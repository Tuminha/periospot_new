import { NextRequest, NextResponse } from "next/server"
import { getWooCommerceClient } from "@/lib/woocommerce"

// GET /api/woocommerce/orders - Get orders (requires authentication)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")
    const customerId = searchParams.get("customer_id")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "10", 10)

    const client = getWooCommerceClient()

    // Get single order by ID
    if (orderId) {
      const order = await client.getOrder(parseInt(orderId, 10))
      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          number: order.number,
          status: order.status,
          total: order.total,
          currency: order.currency,
          billing: order.billing,
          line_items: order.line_items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            total: item.total,
          })),
          date_created: order.date_created,
          date_paid: order.date_paid,
        },
      })
    }

    // Get orders for a customer
    if (customerId) {
      const orders = await client.getCustomerOrders(parseInt(customerId, 10), {
        page,
        per_page: perPage,
      })

      return NextResponse.json({
        success: true,
        orders: orders.map((order) => ({
          id: order.id,
          number: order.number,
          status: order.status,
          total: order.total,
          currency: order.currency,
          date_created: order.date_created,
          items_count: order.line_items.length,
        })),
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Order ID or Customer ID is required",
      },
      { status: 400 }
    )
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    )
  }
}

// PUT /api/woocommerce/orders - Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, status } = body

    if (!order_id || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and status are required" },
        { status: 400 }
      )
    }

    const validStatuses = [
      "pending",
      "processing",
      "on-hold",
      "completed",
      "cancelled",
      "refunded",
      "failed",
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const client = getWooCommerceClient()
    const order = await client.updateOrder(order_id, { status })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
      },
      message: `Order status updated to ${status}`,
    })
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update order",
      },
      { status: 500 }
    )
  }
}
