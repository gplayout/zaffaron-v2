import { safeJsonLd } from "@/lib/seo/safe-json-ld";
import { SITE_URL, SITE_NAME } from "@/lib/config";

interface BlogPostJsonLdProps {
  title: string;
  slug: string;
  description: string;
  authorName: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage?: string;
  tags?: string[];
}

export function BlogPostJsonLd({
  title,
  slug,
  description,
  authorName,
  publishedAt,
  updatedAt,
  featuredImage,
  tags,
}: BlogPostJsonLdProps) {
  const url = `${SITE_URL}/blog/${slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: title,
    description,
    inLanguage: "en",
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Organization",
      name: authorName || "Zaffaron Kitchen",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
      },
    },
    ...(featuredImage
      ? {
          image: {
            "@type": "ImageObject",
            url: featuredImage.startsWith("http")
              ? featuredImage
              : `${SITE_URL}${featuredImage}`,
          },
        }
      : {}),
    ...(tags && tags.length > 0 ? { keywords: tags.join(", ") } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: title },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
    </>
  );
}
