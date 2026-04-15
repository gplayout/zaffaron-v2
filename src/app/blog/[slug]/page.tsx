import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BlogPostJsonLd } from "@/components/blog/BlogPostJsonLd";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data } = await supabaseServer
    .from("blog_posts")
    .select("slug")
    .eq("published", true);
  return (data || []).map((p) => ({ slug: p.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabaseServer
    .from("blog_posts")
    .select("seo_title, seo_description, title, excerpt, featured_image")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) return { title: "Blog Post Not Found" };

  const title = data.seo_title || `${data.title} — Zaffaron Blog`;
  const description = data.seo_description || data.excerpt || `Read the full article about ${data.title}.`;
  const ogImage = data.featured_image || '/og-default.jpg';

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/blog/${slug}`,
      images: [{ url: ogImage, alt: data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  
  const { data: post, error } = await supabaseServer
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <>
      <BlogPostJsonLd
        title={post.title}
        slug={post.slug}
        description={post.seo_description || post.excerpt || ''}
        authorName={post.author_name || 'Zaffaron Kitchen'}
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
        featuredImage={post.featured_image}
        tags={post.tags}
      />
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/blog" className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline mb-8 block transition">
        ← Back to Blog
      </Link>

      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-xl text-stone-500 mb-6 italic">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-stone-400 font-medium uppercase tracking-wider">
          <span>By {post.author_name || "Zaffaron Kitchen"}</span>
          <span>•</span>
          {post.published_at && (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}
        </div>
      </header>

      {post.featured_image && (
        <div className="mb-12 w-full aspect-video md:aspect-[21/9] rounded-2xl bg-stone-100 overflow-hidden relative shadow-sm">
          <img 
            src={post.featured_image} 
            alt={post.title} 
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div className="prose prose-stone prose-lg md:prose-xl mx-auto
          prose-headings:font-bold prose-headings:text-stone-800
          prose-a:text-amber-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
          prose-p:text-stone-700 prose-p:leading-relaxed
          prose-li:text-stone-700
          prose-strong:text-stone-900
          prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50/50 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:not-italic
          prose-img:rounded-xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content_markdown}
        </ReactMarkdown>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="bg-stone-100 text-stone-600 text-xs px-3 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
    </>
  );
}
