"use client";
import React from 'react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const featuredProducts = [
  {
    id: 'still-alive-digital',
    name: 'STILL ALIVE.',
    artist: 'Prince Inspiration',
    price: 9.99,
    type: 'digital' as const,
    tag: 'NEW RELEASE',
    bandcamp: 'https://princeinspiration.bandcamp.com/album/still-alive',
  },
];

const FeaturedProducts = () => {
  const { addItem, items } = useCart();
  const isInCart = (id: string) => items.some((i) => i.id === id);

  return (
    <section className='py-12 px-4 bg-primary'>
      <div className='max-w-5xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <h2 className='font-oswald text-4xl font-bold'>FEATURED RELEASES</h2>
          <motion.a
            href='/store'
            className='font-oswald text-sm tracking-widest text-accent hover:underline'
            whileHover={{ scale: 1.05 }}
          >
            VISIT STORE
          </motion.a>
        </div>

        <div className='grid md:grid-cols-3 gap-6'>
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              className='border border-secondaryInteraction hover:border-accent transition-colors duration-200'
              whileHover={{ y: -4 }}
            >
              <div className='aspect-square bg-secondaryInteraction flex items-center justify-center relative'>
                <div className='w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-4 border-primary'>
                  <div className='w-8 h-8 rounded-full bg-accent' />
                </div>
                <span className='absolute top-3 left-3 bg-accent text-primary font-oswald text-xs font-bold px-2 py-1 tracking-widest'>
                  {product.tag}
                </span>
              </div>
              <div className='p-4'>
                <p className='text-accent font-oswald text-xs tracking-widest uppercase mb-1'>{product.artist}</p>
                <h3 className='font-oswald text-xl font-bold mb-3'>{product.name}</h3>
                <div className='flex items-center justify-between'>
                  <p className='font-oswald text-xl font-bold text-accent'>${product.price.toFixed(2)}</p>
                  {isInCart(product.id) ? (
                    <a href='/checkout' className='font-oswald text-xs font-bold px-4 py-2 tracking-widest border border-accent text-accent hover:bg-accent hover:text-primary transition-colors'>
                      VIEW CART
                    </a>
                  ) : (
                    <button
                      onClick={() => addItem({ id: product.id, name: product.name, price: product.price, quantity: 1, type: product.type })}
                      className='bg-accent text-primary font-oswald text-xs font-bold px-4 py-2 tracking-widest hover:bg-accentInteraction transition-colors'
                    >
                      ADD TO CART
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
