import { NextRequest, NextResponse } from "next/server"
import { getWooCommerceClient } from "@/lib/woocommerce"

// GET /api/woocommerce/products - Fetch products from WooCommerce
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "20", 10)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const onSale = searchParams.get("on_sale")

    const client = getWooCommerceClient()
    const response = await client.getProducts({
      page,
      per_page: perPage,
      category: category ? parseInt(category, 10) : undefined,
      search: search || undefined,
      featured: featured === "true" ? true : undefined,
      on_sale: onSale === "true" ? true : undefined,
      status: "publish",
    })

    return NextResponse.json({
      success: true,
      products: response.products,
      pagination: {
        page,
        perPage,
        total: response.total,
        totalPages: response.totalPages,
      },
    })
  } catch (error) {
    console.error("WooCommerce products error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    )
  }
}
