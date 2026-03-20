"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "../../Components/PageWrapper";
import Header from "../../Components/Header";
import Icon from "../../Components/Icon";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: any[];
  excerpt: string;
  author: string;
  publishedAt: string;
  lastUpdatedNote?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  tags?: string;
  sources?: string;
  corrections?: string;
  readTime?: number;
  category: string;
  coverImage?: string;
  relatedArtist?: string;
};

export default function ArticlePage({ params }: any) {
  const { slug } = params;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
        const res = await fetch(`${strapiUrl}/api/articles?filters[slug][$eq]=${slug}&populate=coverImage,relatedArtist`);
        if (!res.ok) { setNotFound(true); setLoading(false); return; }
        const json = await res.json();
        const item = json.data?.[0];
        if (!item) { setNotFound(true); setLoading(false); return; }
        setArticle({
          id: String(item.id),
          title: item.attributes.title,
          slug: item.attributes.slug,
          content: item.attributes.content || [],
          excerpt: item.attributes.excerpt || "",
          author: item.attributes.author || "GNS Editorial",
          publishedAt: item.attributes.publishedAt,
          lastUpdatedNote: item.attributes.lastUpdatedNote || undefined,
          isBreaking: item.attributes.isBreaking || false,
          isFeatured: item.attributes.isFeatured || false,
          tags: item.attributes.tags || undefined,
          sources: item.attributes.sources || undefined,
          corrections: item.attributes.corrections || undefined,
          readTime: item.attributes.readTime || 3,
          category: item.attributes.category || "News",
          coverImage: item.attributes.coverImage?.data?.attributes?.url
            ? `${strapiUrl}${item.attributes.coverImage.data.attributes.url}`
            : undefined,
          relatedArtist: item.attributes.relatedArtist?.data?.attributes?.name || undefined,
        });
      } catch { setNotFound(true); }
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  if (loading) return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-oswald text-gray-500 tracking-widest animate-pulse">LOADING...</p>
      </div>
    </PageWrapper>
  );

  if (notFound || !article) return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-oswald text-2xl tracking-widest">ARTICLE NOT FOUND</p>
        <a href="/articles" className="text-accent font-oswald tracking-widest hover:underline">BACK TO ARTICLES</a>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <main className="min-h-screen">
        <Header>
          <a href="/articles" className="font-oswald font-bold text-2xl hover:underline inline-flex flex-row items-center gap-4">
            <Icon name="chevronLeft" />
            Back to Articles
          </a>
        </Header>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex gap-2 mb-4">
            {article.isBreaking && (
              <span className="bg-red-600 text-white font-oswald text-xs font-bold px-3 py-1 tracking-widest animate-pulse">BREAKING NEWS</span>
            )}
            {article.isFeatured && (
              <span className="bg-accent text-primary font-oswald text-xs font-bold px-3 py-1 tracking-widest">FEATURED</span>
            )}
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-secondaryInteraction text-gray-400 font-oswald text-xs font-bold px-2 py-1 tracking-widest">
                {article.category.toUpperCase()}
              </span>
              <span className="text-gray-600 text-sm">{formatDate(article.publishedAt)}</span>
              <span className="text-gray-600 text-sm">{article.readTime} min read</span>
              {article.relatedArtist && (
                <span className="text-accent text-xs font-oswald tracking-widest">{article.relatedArtist}</span>
              )}
            </div>
            <h1 className="font-oswald text-4xl font-bold mb-3">{article.title}</h1>
            {article.excerpt && <p className="text-gray-400 text-lg mb-3 italic">{article.excerpt}</p>}
            <p className="text-gray-500 text-sm">By {article.author}</p>
          </div>
          {article.lastUpdatedNote && (
            <div className="border-l-2 border-accent pl-4 mb-6 py-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Last Updated</p>
              <p className="text-accent text-sm italic">{article.lastUpdatedNote}</p>
            </div>
          )}
          {article.coverImage && (
            <div className="w-full aspect-video mb-8 overflow-hidden">
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="text-gray-300 leading-relaxed text-lg mb-8">
            {(Array.isArray(article.content) ? article.content : []).map((block: any, i: number) => (
              block?.children?.map((c: any) => c.text).join("").trim()
                ? <p key={i} className="mb-4">{block.children.map((c: any) => c.text).join("")}</p>
                : null
            ))}
          </div>
          {article.tags && (
            <div className="flex flex-wrap gap-2 mb-6 pt-6 border-t border-secondaryInteraction">
              {article.tags.split(",").map((tag: string, i: number) => (
                <span key={i} className="text-xs text-gray-500 border border-secondaryInteraction px-2 py-1">#{tag.trim()}</span>
              ))}
            </div>
          )}
          {article.sources && (
            <div className="border border-secondaryInteraction p-4 mb-4">
              <p className="font-oswald text-xs tracking-widest uppercase text-gray-500 mb-2">Sources</p>
              <p className="text-gray-400 text-sm leading-relaxed">{article.sources}</p>
            </div>
          )}
          {article.corrections && (
            <div className="border border-yellow-600 p-4 mb-4">
              <p className="font-oswald text-xs tracking-widest uppercase text-yellow-600 mb-2">Corrections</p>
              <p className="text-gray-400 text-sm leading-relaxed">{article.corrections}</p>
            </div>
          )}
          <div className="pt-8 border-t border-secondaryInteraction">
            <a href="/articles" className="font-oswald text-sm tracking-widest text-accent hover:underline">
              BACK TO ARTICLES
            </a>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
