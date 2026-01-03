import type {
  WooCommerceProduct,
  WooCommerceOrder,
  CreateOrderInput,
  ProductsResponse,
  WooCommerceError,
} from "./types"

// WooCommerce REST API Client
class WooCommerceClient {
  private baseUrl: string
  private consumerKey: string
  private consumerSecret: string

  constructor() {
    this.baseUrl = process.env.VITE_WOOCOMMERCE_URL || "https://periospot.com"
    this.consumerKey = process.env.VITE_WOOCOMMERCE_CONSUMER_KEY || ""
    this.consumerSecret = process.env.VITE_WOOCOMMERCE_CONSUMER_SECRET || ""

    if (!this.consumerKey || !this.consumerSecret) {
      console.warn("WooCommerce credentials not configured")
    }
  }

  private getAuthParams(): string {
    return `consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const separator = endpoint.includes("?") ? "&" : "?"
    const url = `${this.baseUrl}/wp-json/wc/v3${endpoint}${separator}${this.getAuthParams()}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error: WooCommerceError = await response.json().catch(() => ({
        code: "unknown_error",
        message: `HTTP ${response.status}: ${response.statusText}`,
      }))
      throw new Error(error.message || "WooCommerce API error")
    }

    return response.json()
  }

  // Products
  async getProducts(params?: {
    page?: number
    per_page?: number
    category?: number
    search?: string
    status?: string
    featured?: boolean
    on_sale?: boolean
    orderby?: string
    order?: "asc" | "desc"
  }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/products?${queryString}` : "/products"

    const response = await fetch(
      `${this.baseUrl}/wp-json/wc/v3${endpoint}&${this.getAuthParams()}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }

    const products: WooCommerceProduct[] = await response.json()
    const total = parseInt(response.headers.get("X-WP-Total") || "0", 10)
    const totalPages = parseInt(
      response.headers.get("X-WP-TotalPages") || "0",
      10
    )

    return { products, total, totalPages }
  }

  async getProduct(id: number): Promise<WooCommerceProduct> {
    return this.request<WooCommerceProduct>(`/products/${id}`)
  }

  async getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
    const { products } = await this.getProducts({ search: slug, per_page: 1 })
    return products.find((p) => p.slug === slug) || null
  }

  // Orders
  async createOrder(orderData: CreateOrderInput): Promise<WooCommerceOrder> {
    return this.request<WooCommerceOrder>("/orders", {
      method: "POST",
      body: JSON.stringify({
        ...orderData,
        set_paid: false, // Will be set to true after payment
      }),
    })
  }

  async getOrder(id: number): Promise<WooCommerceOrder> {
    return this.request<WooCommerceOrder>(`/orders/${id}`)
  }

  async updateOrder(
    id: number,
    data: Partial<WooCommerceOrder>
  ): Promise<WooCommerceOrder> {
    return this.request<WooCommerceOrder>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async getCustomerOrders(
    customerId: number,
    params?: { page?: number; per_page?: number }
  ): Promise<WooCommerceOrder[]> {
    const searchParams = new URLSearchParams({
      customer: String(customerId),
    })
    if (params?.page) searchParams.append("page", String(params.page))
    if (params?.per_page)
      searchParams.append("per_page", String(params.per_page))

    return this.request<WooCommerceOrder[]>(`/orders?${searchParams.toString()}`)
  }

  // Categories
  async getCategories(): Promise<
    { id: number; name: string; slug: string; count: number }[]
  > {
    return this.request("/products/categories?per_page=100")
  }

  // Coupons
  async validateCoupon(
    code: string
  ): Promise<{ valid: boolean; discount_type: string; amount: string } | null> {
    try {
      const coupons = await this.request<
        { code: string; discount_type: string; amount: string }[]
      >(`/coupons?code=${encodeURIComponent(code)}`)
      if (coupons.length > 0) {
        return {
          valid: true,
          discount_type: coupons[0].discount_type,
          amount: coupons[0].amount,
        }
      }
      return { valid: false, discount_type: "", amount: "0" }
    } catch {
      return null
    }
  }

  // Generate checkout URL for WooCommerce
  generateCheckoutUrl(productId: number, quantity: number = 1): string {
    return `${this.baseUrl}/checkout/?add-to-cart=${productId}&quantity=${quantity}`
  }

  // Generate direct add-to-cart URL
  generateAddToCartUrl(productId: number, quantity: number = 1): string {
    return `${this.baseUrl}/?add-to-cart=${productId}&quantity=${quantity}`
  }
}

// Singleton instance
let clientInstance: WooCommerceClient | null = null

export function getWooCommerceClient(): WooCommerceClient {
  if (!clientInstance) {
    clientInstance = new WooCommerceClient()
  }
  return clientInstance
}

export { WooCommerceClient }
