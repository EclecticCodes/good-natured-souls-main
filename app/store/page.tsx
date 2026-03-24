import React, { Suspense } from 'react';
import { PageWrapper } from '../Components/PageWrapper';
import Header from '../Components/Header';
import ComingSoonStore from '../Components/ComingSoonStore';
import { getProducts } from '../../sanity/strapi-utils';
import { useSearchParams } from 'next/navigation';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'digital', label: 'Digital Downloads' },
  { key: 'vinyl', label: 'Vinyl' },
  { key: 'tees', label: 'Tees' },
  { key: 'hoodies', label: 'Hoodies' },
  { key: 'accessories', label: 'Accessories' },
];

async function StoreContent({ activeCategory }: { activeCategory: string }) {
  const products = await getProducts();
  return (
    <div>
      <div className='border-b border-secondaryInteraction overflow-x-auto'>
        <div className='max-w-5xl mx-auto px-4 flex gap-0'>
          {categories.map((cat) => (
            
              key={cat.key}
              href={cat.key === 'all' ? '/store' : '/store?category=' + cat.key}
              className={'font-oswald text-sm tracking-widest px-5 py-4 border-b-2 whitespace-nowrap transition-colors ' + (activeCategory === cat.key ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white')}
            >
              {cat.label.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
      <ComingSoonStore activeCategory={activeCategory} strapiProducts={products} />
    </div>
  );
}

export default async function StorePage({ searchParams }: { searchParams: { category?: string } }) {
  const active = searchParams?.category || 'all';
  return (
    <PageWrapper>
      <main className='min-h-screen'>
        <Header>
          <h1 className='text-4xl font-bold font-oswald'>Store</h1>
        </Header>
        <Suspense fallback={<div className='text-center py-16 font-oswald text-gray-500 tracking-widest'>LOADING...</div>}>
          <StoreContent activeCategory={active} />
        </Suspense>
      </main>
    </PageWrapper>
  );
}
