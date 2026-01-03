"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Lock
} from "lucide-react"
import { PerioAnalytics } from "@/lib/analytics"

// Cart item type
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  type: "digital" | "physical"
}

export default function CartPage() {
  const router = useRouter()
  // In a real app, this would come from a cart context/store
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const applyCoupon = () => {
    if (couponCode.trim()) {
      // In a real app, validate coupon on server
      setCouponApplied(true)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = couponApplied ? subtotal * 0.1 : 0 // 10% discount example
  const total = subtotal - discount

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      PerioAnalytics.trackBeginCheckout({
        cartValue: total,
        items: cartItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      })
    }
    router.push("/checkout")
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-12">
        <div className="container max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-muted-foreground">
                Looks like you haven&apos;t added any products yet
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/tienda">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Products
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/library">
                    Explore Library
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Products */}
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-semibold">You might be interested in</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-muted">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold">Socket Shield Kit</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Complete surgical kit</p>
                  <p className="mt-2 font-bold text-primary">$299.00</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/tienda/socket-shield-kit">View Product</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-muted">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold">Implantology Masterclass</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Online course</p>
                  <p className="mt-2 font-bold text-primary">$149.00</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/tienda">View Product</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="hidden lg:block">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-muted">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold">Periodontics eBook Bundle</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Digital download</p>
                  <p className="mt-2 font-bold text-primary">$79.00</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/tienda">View Product</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        </div>
      </main>
    )
  }

  // Cart with items
  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.type === "digital" ? "Digital Product" : "Physical Product"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={couponApplied || !couponCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
                {couponApplied && (
                  <p className="text-sm text-green-600">Coupon applied: 10% off</p>
                )}

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button className="w-full" size="lg" onClick={handleProceedToCheckout}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Secure checkout powered by Stripe
                </div>
              </CardFooter>
            </Card>

            <Button variant="ghost" className="mt-4 w-full" asChild>
              <Link href="/tienda">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
