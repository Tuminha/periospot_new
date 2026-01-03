import { NextRequest, NextResponse } from "next/server"
import { getWooCommerceClient } from "@/lib/woocommerce"
import type { CartItem, Cart } from "@/lib/woocommerce"

// Cart is stored in cookies/localStorage on client side
// This API generates checkout URLs and validates cart items

// POST /api/woocommerce/cart/checkout - Generate checkout URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body as { items: CartItem[] }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      )
    }

    const client = getWooCommerceClient()

    // For single item, generate direct checkout URL
    if (items.length === 1) {
      const checkoutUrl = client.generateCheckoutUrl(
        items[0].productId,
        items[0].quantity
      )
      return NextResponse.json({
        success: true,
        checkoutUrl,
        method: "redirect",
      })
    }

    // For multiple items, generate add-to-cart URL with all products
    // WooCommerce handles multi-product cart via sequential add-to-cart
    const baseUrl = process.env.VITE_WOOCOMMERCE_URL || "https://periospot.com"

    // Build cart URL with all items
    const cartItems = items
      .map((item) => `${item.productId}:${item.quantity}`)
      .join(",")

    // Use WooCommerce's batch add to cart (if supported) or sequential
    const checkoutUrl = `${baseUrl}/cart/?add-to-cart=${items[0].productId}&quantity=${items[0].quantity}`

    return NextResponse.json({
      success: true,
      checkoutUrl,
      additionalItems: items.slice(1).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        addToCartUrl: client.generateAddToCartUrl(item.productId, item.quantity),
      })),
      method: items.length === 1 ? "redirect" : "sequential",
      message:
        items.length > 1
          ? "Multiple items require sequential cart addition"
          : undefined,
    })
  } catch (error) {
    console.error("Cart checkout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process cart",
      },
      { status: 500 }
    )
  }
}

// GET /api/woocommerce/cart/validate - Validate cart items exist in WooCommerce
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get("ids")?.split(",").map(Number) || []

    if (productIds.length === 0) {
      return NextResponse.json({
        success: true,
        validProducts: [],
        invalidProducts: [],
      })
    }

    const client = getWooCommerceClient()
    const validProducts: number[] = []
    const invalidProducts: number[] = []

    // Validate each product exists
    for (const productId of productIds) {
      try {
        await client.getProduct(productId)
        validProducts.push(productId)
      } catch {
        invalidProducts.push(productId)
      }
    }

    return NextResponse.json({
      success: true,
      validProducts,
      invalidProducts,
    })
  } catch (error) {
    console.error("Cart validation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to validate cart",
      },
      { status: 500 }
    )
  }
}
