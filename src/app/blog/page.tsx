import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Zaffaron Blog — Food Stories, Guides & Culture",
  description: "Read our latest articles on cultural food traditions, cooking guides, and seasonal highlights from around the world.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 3600;

export default async function BlogIndexPage() {
  const { data: posts, error } = await supabaseServer
    .from("blog_posts")
    .select("slug, title, excerpt, author_name, published_at, featured_image")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !posts) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">📝 Zaffaron Blog</h1>
        <p className="text-stone-500">Coming soon. We are preparing some delicious stories for you.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">📝 The Zaffaron Blog</h1>
      <p className="text-stone-500 mb-10 text-lg">
        Deep dives into global food traditions, seasonal guides, and the stories behind the recipes.
      </p>

      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block flex-col justify-between rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            {post.featured_image && (
              <div className="aspect-video w-full bg-stone-100 overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-bold text-stone-900 group-hover:text-amber-700 transition">
                {post.title}
              </h2>
              <p className="mt-3 text-stone-600 line-clamp-3">
                {post.excerpt}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm text-stone-400">
              <span className="font-medium text-stone-600">{post.author_name}</span>
              {post.published_at && (
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
