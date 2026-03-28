"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";
import { resolveUrl } from '@/lib/resolveUrl';

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  scheduledAt?: string;
  lastUpdatedNote?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  tags?: string;
  readTime?: number;
  category: string;
  coverImage?: string;
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

        const res = await fetch(`${strapiUrl}/api/articles?sort=isFeatured:desc,publishedAt:desc&populate=coverImage,relatedArtist`);
        if (!res.ok) { setLoading(false); return; }
        const json = await res.json();
        const now = new Date();
        setArticles((json.data || []).filter((item: any) => {
          const scheduled = item.attributes.scheduledAt;
          return !scheduled || new Date(scheduled) <= now;
        }).map((item: any) => ({
          id: String(item.id),
          title: item.attributes.title,
          slug: item.attributes.slug,
          excerpt: item.attributes.excerpt || "",
          author: item.attributes.author || "GNS Editorial",
          publishedAt: item.attributes.publishedAt,
          scheduledAt: item.attributes.scheduledAt || undefined,
          lastUpdatedNote: item.attributes.lastUpdatedNote || undefined,
          isBreaking: item.attributes.isBreaking || false,
          isFeatured: item.attributes.isFeatured || false,
          tags: item.attributes.tags || undefined,
          readTime: item.attributes.readTime || 3,
          category: item.attributes.category || "News",
          coverImage: item.attributes.coverImage?.data?.attributes?.url
            ? resolveUrl(item.attributes.coverImage.data.attributes.url, strapiUrl)
            : undefined,
        })));
      } catch {}
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header>
          <h1 className="font-oswald text-5xl font-bold text-center">Articles</h1>
        </Header>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-16">
              <p className="font-oswald text-gray-500 tracking-widest animate-pulse">LOADING...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="border border-secondaryInteraction p-16 text-center">
              <p className="font-oswald text-2xl font-bold tracking-widest mb-3">COMING SOON</p>
              <p className="text-gray-500 text-sm tracking-wide">
                Press coverage, artist spotlights, and label news dropping soon.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className={`border transition-colors duration-200 group ${article.isFeatured ? "border-accent" : "border-secondaryInteraction hover:border-accent"}`}
                >
                  <div className="aspect-video bg-secondaryInteraction flex items-center justify-center overflow-hidden relative">
                    {article.coverImage ? (
                      <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-accent" />
                        </div>
                        <p className="font-oswald text-gray-600 text-xs tracking-widest">GNS</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {article.isBreaking && (
                        <span className="bg-red-600 text-white font-oswald text-xs font-bold px-2 py-1 tracking-widest animate-pulse">BREAKING</span>
                      )}
                      {article.isFeatured && !article.isBreaking && (
                        <span className="bg-accent text-primary font-oswald text-xs font-bold px-2 py-1 tracking-widest">FEATURED</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="bg-secondaryInteraction text-gray-400 font-oswald text-xs font-bold px-2 py-1 tracking-widest">
                        {article.category.toUpperCase()}
                      </span>
                      <span className="text-gray-600 text-xs">{formatDate(article.publishedAt)}</span>
                      <span className="text-gray-600 text-xs">{article.readTime} min read</span>
                    </div>
                    <h2 className="font-oswald text-xl font-bold mb-2 group-hover:text-accent transition-colors">{article.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{article.excerpt}</p>
                    {article.lastUpdatedNote && (
                      <p className="text-xs text-accent mt-2 italic">Updated: {article.lastUpdatedNote}</p>
                    )}
                    {article.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.split(",").map((tag: string, i: number) => (
                          <span key={i} className="text-xs text-gray-600 border border-secondaryInteraction px-2 py-0.5">#{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondaryInteraction">
                      <span className="text-gray-600 text-xs">By {article.author}</span>
                      <span className="font-oswald text-xs text-accent tracking-widest group-hover:underline">READ MORE</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
