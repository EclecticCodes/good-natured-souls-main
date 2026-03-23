"use client";
import React from "react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

type Project = {
  _id: string;
  name: string;
  type: string;
  url: string;
  releaseYear: number;
  coverImageUrl: string;
  artist: string;
};

type Props = {
  projects?: Project[];
};

const FALLBACK_PRODUCTS = [
  {
    id: "still-alive-digital",
    name: "STILL ALIVE.",
    artist: "Prince Inspiration",
    price: 9.99,
    type: "digital" as const,
    tag: "NEW RELEASE",
    url: "https://princeinspiration.bandcamp.com/album/still-alive",
    coverImageUrl: "",
  },
];

const FeaturedProducts = ({ projects }: Props) => {
  const { addItem, items } = useCart();
  const isInCart = (id: string) => items.some((i) => i.id === id);
  const hasProjects = projects && projects.length > 0;

  return (
    <section className="py-12 px-4 bg-primary">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-2xl md:text-4xl font-bold">FEATURED RELEASES</h2>
          <a href="/store" className="font-oswald text-xs tracking-widest text-accent hover:underline shrink-0 ml-4">
            VISIT STORE
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {hasProjects ? (
            projects.map((project) => (
              <motion.a
                key={project._id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-secondaryInteraction hover:border-accent transition-colors duration-200 block"
                whileHover={{ y: -3 }}
              >
                <div className="aspect-square bg-secondaryInteraction flex items-center justify-center relative overflow-hidden">
                  {project.coverImageUrl ? (
                    <img src={project.coverImageUrl} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-4 border-primary">
                      <div className="w-6 h-6 rounded-full bg-accent" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-accent text-primary font-oswald text-xs font-bold px-2 py-0.5 tracking-widest">
                    {project.type?.toUpperCase() || "RELEASE"}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-accent font-oswald text-xs tracking-widest uppercase mb-0.5">{project.artist}</p>
                  <h3 className="font-oswald text-sm md:text-lg font-bold mb-1 leading-tight">{project.name}</h3>
                  <p className="text-gray-500 text-xs font-oswald tracking-widest">{project.releaseYear} · LISTEN ↗</p>
                </div>
              </motion.a>
            ))
          ) : (
            FALLBACK_PRODUCTS.map((product) => (
              <motion.div
                key={product.id}
                className="border border-secondaryInteraction hover:border-accent transition-colors duration-200"
                whileHover={{ y: -3 }}
              >
                <div className="aspect-square bg-secondaryInteraction flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-4 border-primary">
                    <div className="w-6 h-6 rounded-full bg-accent" />
                  </div>
                  <span className="absolute top-2 left-2 bg-accent text-primary font-oswald text-xs font-bold px-2 py-0.5 tracking-widest">
                    {product.tag}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-accent font-oswald text-xs tracking-widest uppercase mb-0.5">{product.artist}</p>
                  <h3 className="font-oswald text-sm md:text-lg font-bold mb-2 leading-tight">{product.name}</h3>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-oswald text-base font-bold text-accent">${product.price.toFixed(2)}</p>
                    {isInCart(product.id) ? (
                      <a href="/checkout" className="font-oswald text-xs font-bold px-2 py-1.5 tracking-widest border border-accent text-accent hover:bg-accent hover:text-primary transition-colors whitespace-nowrap">
                        CART
                      </a>
                    ) : (
                      <button
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, quantity: 1, type: product.type })}
                        className="bg-accent text-primary font-oswald text-xs font-bold px-2 py-1.5 tracking-widest hover:bg-accentInteraction transition-colors whitespace-nowrap"
                      >
                        ADD
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;