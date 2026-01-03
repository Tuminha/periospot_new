import { NextRequest, NextResponse } from "next/server"
import { getWooCommerceClient } from "@/lib/woocommerce"
import type { CreateOrderInput } from "@/lib/woocommerce"

// POST /api/woocommerce/checkout - Create an order in WooCommerce
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      billing,
      shipping,
      line_items,
      customer_note,
      coupon_code,
      redirect_to_woocommerce,
    } = body

    // Validate required fields
    if (!billing?.email || !billing?.first_name || !billing?.last_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Billing information is required (email, first_name, last_name)",
        },
        { status: 400 }
      )
    }

    if (!line_items || line_items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one product is required" },
        { status: 400 }
      )
    }

    // If redirect_to_woocommerce is true, generate checkout URL instead
    if (redirect_to_woocommerce) {
      const baseUrl = process.env.VITE_WOOCOMMERCE_URL || "https://periospot.com"
      const firstItem = line_items[0]
      const checkoutUrl = `${baseUrl}/checkout/?add-to-cart=${firstItem.product_id}&quantity=${firstItem.quantity || 1}`

      return NextResponse.json({
        success: true,
        checkoutUrl,
        method: "redirect",
        message: "Redirect to WooCommerce checkout",
      })
    }

    const client = getWooCommerceClient()

    // Prepare order data
    const orderData: CreateOrderInput = {
      billing: {
        first_name: billing.first_name,
        last_name: billing.last_name,
        email: billing.email,
        phone: billing.phone || "",
        address_1: billing.address_1 || "",
        address_2: billing.address_2 || "",
        city: billing.city || "",
        state: billing.state || "",
        postcode: billing.postcode || "",
        country: billing.country || "",
        company: billing.company || "",
      },
      line_items: line_items.map(
        (item: { product_id: number; quantity?: number }) => ({
          product_id: item.product_id,
          quantity: item.quantity || 1,
        })
      ),
      customer_note: customer_note || "",
    }

    // Add shipping if different from billing
    if (shipping) {
      orderData.shipping = {
        first_name: shipping.first_name || billing.first_name,
        last_name: shipping.last_name || billing.last_name,
        address_1: shipping.address_1 || "",
        address_2: shipping.address_2 || "",
        city: shipping.city || "",
        state: shipping.state || "",
        postcode: shipping.postcode || "",
        country: shipping.country || "",
        company: shipping.company || "",
      }
    }

    // Add coupon if provided
    if (coupon_code) {
      const couponValidation = await client.validateCoupon(coupon_code)
      if (couponValidation?.valid) {
        orderData.coupon_lines = [{ code: coupon_code }]
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid coupon code" },
          { status: 400 }
        )
      }
    }

    // Create the order
    const order = await client.createOrder(orderData)

    // Generate payment URL (redirect to WooCommerce checkout for payment)
    const baseUrl = process.env.VITE_WOOCOMMERCE_URL || "https://periospot.com"
    const paymentUrl = `${baseUrl}/checkout/order-pay/${order.id}/?pay_for_order=true&key=${order.order_key}`

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
        currency: order.currency,
        created: order.date_created,
      },
      paymentUrl,
      message: "Order created successfully. Proceed to payment.",
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    )
  }
}
