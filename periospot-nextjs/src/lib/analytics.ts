type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    gtag?: Gtag
    dataLayer?: unknown[]
  }
}

const isBrowser = () => typeof window !== "undefined"

export const gaEvent = (action: string, params?: Record<string, unknown>): void => {
  if (!isBrowser() || !window.gtag) {
    return
  }
  window.gtag("event", action, params || {})
}

export const gaPageview = (url: string): void => {
  if (!isBrowser() || !window.gtag) return
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!measurementId) return
  window.gtag("config", measurementId, { page_path: url })
}

export const PerioAnalytics = {
  trackNewsletterSignup: (params: {
    location: "footer" | "sidebar" | "article_inline" | "popup"
  }) => {
    gaEvent("sign_up", {
      method: "email",
      location: params.location,
      newsletter_type: "periospot_brew",
    })
  },
  trackEbookLead: (params: { ebookTitle: string; articleReferrer?: string }) => {
    if (!isBrowser()) return
    gaEvent("generate_lead", {
      form_name: "ebook_download",
      lead_type: "ebook_download",
      ebook_title: params.ebookTitle,
      value: 1,
      article_referrer: params.articleReferrer || window.location.pathname,
    })
  },
  trackFileDownload: (params: {
    fileName: string
    category: string
    topic: string
    language?: "en" | "es" | "pt" | "zh"
  }) => {
    gaEvent("file_download", {
      file_name: params.fileName,
      content_category: params.category,
      topic: params.topic,
      language: params.language || "en",
    })
  },
  trackArticleDepth: (params: {
    articleSlug: string
    depthPercentage: 25 | 50 | 75 | 90
    category: string
    readingTimeSeconds: number
    language?: "en" | "es" | "pt" | "zh"
  }) => {
    gaEvent("article_read_depth", {
      article_slug: params.articleSlug,
      depth_percentage: params.depthPercentage,
      article_category: params.category,
      reading_time_seconds: params.readingTimeSeconds,
      article_language: params.language || "en",
    })
  },
  trackArticleClick: (params: {
    articleSlug: string
    category: string
    location: "homepage" | "blog_listing" | "related_articles"
  }) => {
    gaEvent("select_content", {
      content_type: "article",
      item_id: params.articleSlug,
      content_category: params.category,
      location: params.location,
    })
  },
  trackShare: (params: {
    method: "email" | "facebook" | "twitter" | "linkedin" | "whatsapp"
    contentType: "article" | "ebook"
    itemId: string
    contentTitle?: string
  }) => {
    gaEvent("share", {
      method: params.method,
      content_type: params.contentType,
      item_id: params.itemId,
      content_title: params.contentTitle,
    })
  },
  trackLanguageSwitch: (params: { toLanguage: string; contentType: "articles" | "library" }) => {
    if (!isBrowser()) return
    gaEvent("language_selection", {
      to_language: params.toLanguage,
      content_type: params.contentType,
      page_location: window.location.pathname,
    })
  },
  trackSearch: (searchTerm: string) => {
    if (!isBrowser()) return
    gaEvent("search", {
      search_term: searchTerm,
      page_location: window.location.pathname,
    })
  },
  trackAssessmentStart: (params: { formType: "learning_assessment"; entryPoint: "homepage" | "navigation" }) => {
    gaEvent("assessment_start", {
      form_type: params.formType,
      entry_point: params.entryPoint,
      form_url: "https://form.typeform.com/to/ycAW7N",
    })
  },
  trackOutboundLink: (params: {
    url: string
    linkType: "ibook" | "partner" | "resource" | "social"
    productName?: string
  }) => {
    gaEvent("outbound_link", {
      link_url: params.url,
      link_domain: new URL(params.url).hostname,
      link_type: params.linkType,
      product_name: params.productName,
    })
  },
  trackAddToCart: (params: {
    productId: string
    productName: string
    price: number
    category: string
    quantity?: number
  }) => {
    gaEvent("add_to_cart", {
      currency: "EUR",
      value: params.price * (params.quantity || 1),
      items: [
        {
          item_id: params.productId,
          item_name: params.productName,
          item_category: params.category,
          price: params.price,
          quantity: params.quantity || 1,
        },
      ],
    })
  },
  trackBeginCheckout: (params: {
    cartValue: number
    items: Array<{
      item_id: string
      item_name: string
      price: number
      quantity: number
    }>
  }) => {
    gaEvent("begin_checkout", {
      currency: "EUR",
      value: params.cartValue,
      items: params.items,
    })
  },
  trackPurchase: (params: {
    transactionId: string
    value: number
    tax?: number
    items: Array<{
      item_id: string
      item_name: string
      price: number
      quantity: number
    }>
  }) => {
    gaEvent("purchase", {
      transaction_id: params.transactionId,
      currency: "EUR",
      value: params.value,
      tax: params.tax || 0,
      items: params.items,
    })
  },
  trackViewItem: (params: { productId: string; productName: string; price: number; category: string }) => {
    gaEvent("view_item", {
      currency: "EUR",
      value: params.price,
      items: [
        {
          item_id: params.productId,
          item_name: params.productName,
          item_category: params.category,
          price: params.price,
        },
      ],
    })
  },
  trackVideoStart: (params: { videoTitle: string; videoProvider: "youtube" | "vimeo" | "embedded"; articleContext?: string }) => {
    gaEvent("video_start", {
      video_title: params.videoTitle,
      video_provider: params.videoProvider,
      article_context: params.articleContext,
    })
  },
  trackVideoProgress: (params: { videoTitle: string; videoPercent: 25 | 50 | 75; videoProvider: string }) => {
    gaEvent("video_progress", {
      video_title: params.videoTitle,
      video_percent: params.videoPercent,
      video_provider: params.videoProvider,
    })
  },
}

export {}
