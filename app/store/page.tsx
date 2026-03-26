import { getProducts } from '../../sanity/strapi-utils';
import StoreClient from './StoreClient';

export const revalidate = 60;

export default async function StorePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const products = await getProducts();
  return <StoreClient products={products} initialCategory={params?.category || 'all'} />;
}
