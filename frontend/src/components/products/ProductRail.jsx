'use client';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

/**
 * Horizontal scrolling rail of ProductCards with left/right arrow controls.
 *
 * Props:
 *   title        – section heading
 *   icon: Icon   – lucide icon component for the heading
 *   products     – array of products
 *   emptyText    – optional fallback when no products
 */
export default function ProductRail({ title, icon: Icon, products = [], emptyText }) {
  const scrollerRef = useRef(null);

  if (!products?.length) {
    if (!emptyText) return null;
    return (
      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-red-600" />} {title}
        </h2>
        <p className="text-sm text-gray-500">{emptyText}</p>
      </section>
    );
  }

  const scrollBy = (delta) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-red-600" />} {title}
        </h2>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-400)}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full border border-gray-300 bg-white hover:border-red-500 hover:text-red-600 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(400)}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full border border-gray-300 bg-white hover:border-red-500 hover:text-red-600 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="snap-start flex-shrink-0 w-[180px] sm:w-[220px] md:w-[240px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
