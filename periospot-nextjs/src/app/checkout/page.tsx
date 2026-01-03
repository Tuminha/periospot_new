"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle,
  Loader2,
  ShoppingBag
} from "lucide-react"

// Cart item type (in production, this would come from a cart context/store)
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: "digital" | "physical"
}

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"info" | "payment" | "success">("info")
  const [orderId, setOrderId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    country: "",
    address: "",
    city: "",
    postalCode: "",
  })

  // Mock cart items (in production, this comes from cart state)
  const cartItems: CartItem[] = []

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.21 // 21% VAT
  const total = subtotal + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setLoading(false)
    setOrderId(`PS-${Date.now().toString(36).toUpperCase()}`)
    setStep("success")
  }

  // Empty cart state
  if (cartItems.length === 0 && step !== "success") {
    return (
      <main className="min-h-screen pt-24 pb-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-muted-foreground">
                Add some products to your cart before checking out
              </p>
              <Button className="mt-8" asChild>
                <Link href="/tienda">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Success state
  if (step === "success") {
    return (
      <main className="min-h-screen pt-24 pb-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-green-500/10 p-6">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Order Confirmed!</h2>
              <p className="mt-2 text-muted-foreground">
                Thank you for your purchase. A confirmation email has been sent to {formData.email}
              </p>
              <div className="mt-8 rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Order #</p>
                <p className="font-mono font-bold">{orderId ?? "PS-PENDING"}</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/tienda">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="mt-4 text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Customer Information */}
            <Card className={step !== "info" ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === "info" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {step === "payment" ? <CheckCircle className="h-4 w-4" /> : "1"}
                  </div>
                  <div>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>Enter your contact and billing details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              {step === "info" && (
                <form onSubmit={handleContinueToPayment}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="Spain"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Madrid"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          placeholder="28001"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">
                      Continue to Payment
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>

            {/* Step 2: Payment */}
            <Card className={`mt-6 ${step !== "payment" ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    2
                  </div>
                  <div>
                    <CardTitle>Payment</CardTitle>
                    <CardDescription>Secure payment via Stripe</CardDescription>
                  </div>
                </div>
              </CardHeader>
              {step === "payment" && (
                <form onSubmit={handlePayment}>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        Your payment information is encrypted and secure
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          required
                        />
                        <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep("info")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Pay €{total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items in cart</p>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p>€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (21%)</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">€{total.toFixed(2)}</span>
                </div>

                {/* Trust badges */}
                <div className="mt-6 space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    SSL Encrypted Checkout
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" />
                    Secure Payment via Stripe
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    Major cards accepted
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Visa</Badge>
                  <Badge variant="outline">Mastercard</Badge>
                  <Badge variant="outline">Amex</Badge>
                  <Badge variant="outline">PayPal</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
