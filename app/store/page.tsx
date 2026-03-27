import { getProducts } from '../../sanity/strapi-utils';
import StoreClient from './StoreClient';

export const revalidate = 60;

async function getStoreSettings() {
  try {
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const res = await fetch(
      `${STRAPI_URL}/api/store-setting?populate=heroImage,CategoryImage.image`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const attrs = json.data?.attributes;
    if (!attrs) return null;
    return {
      heroImage: attrs.heroImage?.data?.attributes?.url
        ? (attrs.heroImage.data.attributes.url.startsWith('http')
            ? attrs.heroImage.data.attributes.url
            : `${STRAPI_URL}${attrs.heroImage.data.attributes.url}`)
        : undefined,
      heroCopy: attrs.heroCopy || undefined,
      heroSubcopy: attrs.heroSubcopy || undefined,
      categoryImages: (attrs.CategoryImage || []).map((c: any) => ({
        categoryKey: c.categoryKey,
        label: c.label,
        image: c.image?.data?.attributes?.url
          ? (c.image.data.attributes.url.startsWith('http')
              ? c.image.data.attributes.url
              : `${STRAPI_URL}${c.image.data.attributes.url}`)
          : undefined,
      })),
    };
  } catch {
    return null;
  }
}

export default async function StorePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const [products, storeSettings] = await Promise.all([getProducts(), getStoreSettings()]);
  return (
    <StoreClient
      products={products}
      initialCategory={params?.category || 'all'}
      storeSettings={storeSettings || undefined}
    />
  );
}
