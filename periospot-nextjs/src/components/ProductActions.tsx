"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/woocommerce"
import { ShoppingCart, Download, Package, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

interface ProductActionsProps {
  product: {
    id: string
    woocommerce_id?: number
    title: string
    slug: string
    price: number
    sale_price?: number
    featured_image_url?: string
    product_type?: string
    link?: string
  }
}

export function ProductActions({ product }: ProductActionsProps) {
  const { addItem, isInCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isDigital =
    product.product_type === "Animations" ||
    product.product_type === "Speaker Packs"

  const productInCart = product.woocommerce_id
    ? isInCart(product.woocommerce_id)
    : false

  const handleAddToCart = () => {
    if (!product.woocommerce_id) {
      toast.error("Product not available for cart")
      return
    }

    setIsAddingToCart(true)

    // Simulate a small delay for UX
    setTimeout(() => {
      addItem({
        productId: product.woocommerce_id!,
        name: product.title,
        slug: product.slug,
        price: product.price,
        salePrice: product.sale_price,
        quantity: 1,
        image: product.featured_image_url || "",
        productType: product.product_type || "",
      })

      setIsAddingToCart(false)
      setJustAdded(true)
      toast.success("Added to cart!", {
        description: product.title,
        action: {
          label: "View Cart",
          onClick: () => (window.location.href = "/cart"),
        },
      })

      // Reset the "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000)
    }, 300)
  }

  const handleBuyNow = () => {
    const wooCommerceUrl =
      process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || "https://periospot.com"
    const productId = product.woocommerce_id || product.id

    // Generate direct checkout URL
    const checkoutUrl = `${wooCommerceUrl}/checkout/?add-to-cart=${productId}`

    // Open in new tab
    window.open(checkoutUrl, "_blank")
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="flex-1"
        onClick={handleAddToCart}
        disabled={isAddingToCart || productInCart}
      >
        {isAddingToCart ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Adding...
          </>
        ) : justAdded || productInCart ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </>
        )}
      </Button>

      <Button variant="outline" size="lg" onClick={handleBuyNow}>
        {isDigital ? (
          <>
            <Download className="mr-2 h-5 w-5" />
            Buy Now
          </>
        ) : (
          <>
            <Package className="mr-2 h-5 w-5" />
            Buy Now
          </>
        )}
      </Button>
    </div>
  )
}
