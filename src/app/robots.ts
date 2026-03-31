import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow search engines
      { userAgent: "*", allow: "/" },
      // Block AI training crawlers
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "FacebookBot", disallow: "/" },
      { userAgent: "Omgilibot", disallow: "/" },
      { userAgent: "Diffbot", disallow: "/" },
      { userAgent: "PerplexityBot", disallow: "/" },
      { userAgent: "ImagesiftBot", disallow: "/" },
      { userAgent: "cohere-ai", disallow: "/" },
    ],
    sitemap: "https://zaffaron.com/sitemap.xml",
  };
}
