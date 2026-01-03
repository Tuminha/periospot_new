import { NextRequest, NextResponse } from "next/server"
import { getWooCommerceClient } from "@/lib/woocommerce"

// GET /api/woocommerce/products/[id] - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id, 10)

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      )
    }

    const client = getWooCommerceClient()
    const product = await client.getProduct(productId)

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("WooCommerce product error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch product",
      },
      { status: 500 }
    )
  }
}
