// WooCommerce API Types

export interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  permalink: string
  date_created: string
  type: "simple" | "grouped" | "external" | "variable"
  status: "draft" | "pending" | "private" | "publish"
  featured: boolean
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  purchasable: boolean
  total_sales: number
  virtual: boolean
  downloadable: boolean
  downloads: WooCommerceDownload[]
  download_limit: number
  download_expiry: number
  external_url: string
  button_text: string
  tax_status: "taxable" | "shipping" | "none"
  tax_class: string
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: "instock" | "outofstock" | "onbackorder"
  backorders: "no" | "notify" | "yes"
  sold_individually: boolean
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  shipping_required: boolean
  shipping_taxable: boolean
  shipping_class: string
  shipping_class_id: number
  reviews_allowed: boolean
  average_rating: string
  rating_count: number
  related_ids: number[]
  upsell_ids: number[]
  cross_sell_ids: number[]
  parent_id: number
  purchase_note: string
  categories: WooCommerceCategory[]
  tags: WooCommerceTag[]
  images: WooCommerceImage[]
  attributes: WooCommerceAttribute[]
  default_attributes: WooCommerceDefaultAttribute[]
  variations: number[]
  grouped_products: number[]
  menu_order: number
  meta_data: WooCommerceMetaData[]
}

export interface WooCommerceDownload {
  id: string
  name: string
  file: string
}

export interface WooCommerceCategory {
  id: number
  name: string
  slug: string
}

export interface WooCommerceTag {
  id: number
  name: string
  slug: string
}

export interface WooCommerceImage {
  id: number
  date_created: string
  src: string
  name: string
  alt: string
}

export interface WooCommerceAttribute {
  id: number
  name: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface WooCommerceDefaultAttribute {
  id: number
  name: string
  option: string
}

export interface WooCommerceMetaData {
  id: number
  key: string
  value: string
}

// Order Types
export interface WooCommerceOrder {
  id: number
  parent_id: number
  number: string
  order_key: string
  created_via: string
  version: string
  status: WooCommerceOrderStatus
  currency: string
  date_created: string
  date_modified: string
  discount_total: string
  discount_tax: string
  shipping_total: string
  shipping_tax: string
  cart_tax: string
  total: string
  total_tax: string
  prices_include_tax: boolean
  customer_id: number
  customer_ip_address: string
  customer_note: string
  billing: WooCommerceAddress
  shipping: WooCommerceAddress
  payment_method: string
  payment_method_title: string
  transaction_id: string
  date_paid: string | null
  date_completed: string | null
  cart_hash: string
  meta_data: WooCommerceMetaData[]
  line_items: WooCommerceLineItem[]
  tax_lines: WooCommerceTaxLine[]
  shipping_lines: WooCommerceShippingLine[]
  fee_lines: WooCommerceFeeLine[]
  coupon_lines: WooCommerceCouponLine[]
  refunds: WooCommerceRefund[]
}

export type WooCommerceOrderStatus =
  | "pending"
  | "processing"
  | "on-hold"
  | "completed"
  | "cancelled"
  | "refunded"
  | "failed"
  | "trash"

export interface WooCommerceAddress {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
  email?: string
  phone?: string
}

export interface WooCommerceLineItem {
  id: number
  name: string
  product_id: number
  variation_id: number
  quantity: number
  tax_class: string
  subtotal: string
  subtotal_tax: string
  total: string
  total_tax: string
  taxes: WooCommerceTax[]
  meta_data: WooCommerceMetaData[]
  sku: string
  price: number
}

export interface WooCommerceTax {
  id: number
  total: string
  subtotal: string
}

export interface WooCommerceTaxLine {
  id: number
  rate_code: string
  rate_id: number
  label: string
  compound: boolean
  tax_total: string
  shipping_tax_total: string
  meta_data: WooCommerceMetaData[]
}

export interface WooCommerceShippingLine {
  id: number
  method_title: string
  method_id: string
  total: string
  total_tax: string
  taxes: WooCommerceTax[]
  meta_data: WooCommerceMetaData[]
}

export interface WooCommerceFeeLine {
  id: number
  name: string
  tax_class: string
  tax_status: string
  total: string
  total_tax: string
  taxes: WooCommerceTax[]
  meta_data: WooCommerceMetaData[]
}

export interface WooCommerceCouponLine {
  id: number
  code: string
  discount: string
  discount_tax: string
  meta_data: WooCommerceMetaData[]
}

export interface WooCommerceRefund {
  id: number
  reason: string
  total: string
}

// Cart Types (for local cart management)
export interface CartItem {
  id: string
  productId: number
  name: string
  slug: string
  price: number
  salePrice?: number
  quantity: number
  image: string
  productType: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  total: number
  currency: string
}

// Order Creation Input
export interface CreateOrderInput {
  billing: Partial<WooCommerceAddress>
  shipping?: Partial<WooCommerceAddress>
  line_items: {
    product_id: number
    quantity: number
  }[]
  payment_method?: string
  payment_method_title?: string
  customer_note?: string
  coupon_lines?: { code: string }[]
}

// API Response Types
export interface WooCommerceError {
  code: string
  message: string
  data?: {
    status: number
    params?: Record<string, string>
  }
}

export interface ProductsResponse {
  products: WooCommerceProduct[]
  total: number
  totalPages: number
}

export interface OrderResponse {
  order: WooCommerceOrder
  checkoutUrl?: string
}
