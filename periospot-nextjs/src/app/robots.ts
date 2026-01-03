import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard/",
          "/cart/",
          "/checkout/",
          "/search/",
          "/_next/",
          "/private/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/dashboard/", "/cart/", "/checkout/", "/search/"],
      },
    ],
    sitemap: "https://periospot.com/sitemap.xml",
    host: "https://periospot.com",
  }
}
