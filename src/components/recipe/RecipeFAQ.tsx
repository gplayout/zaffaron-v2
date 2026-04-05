import type { RecipeFaqItem } from '@/lib/seo/recipe-faq';

function buildFaqJsonLd(items: RecipeFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function RecipeFAQ({ items }: { items: RecipeFaqItem[] }) {
  if (!items || items.length === 0) return null;

  const jsonLd = buildFaqJsonLd(items);

  return (
    <section className="mt-10">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h2 className="text-xl font-bold text-stone-900">FAQ</h2>
      <div className="mt-4 space-y-4">
        {items.map((it) => (
          <details
            key={it.question}
            className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm"
          >
            <summary className="cursor-pointer select-none text-base font-semibold text-stone-900">
              {it.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{it.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
