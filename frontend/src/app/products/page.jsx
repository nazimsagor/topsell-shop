'use client';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { productsApi, categoriesApi } from '@/lib/api';

// --- Sort options ---------------------------------------------------------
// Each option maps to backend `sort` + `order` query params. Backend allows:
// sort ∈ { id, name, price, stock }. We use `id:desc` for Newest First
// (id is BIGSERIAL, so highest id = most recent) and `stock:asc` for Best
// Sellers (proxy — lowest remaining stock ≈ most sold).
const SORT_OPTIONS = [
  { value: 'id:desc',    label: 'Newest First' },
  { value: 'price:asc',  label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'name:asc',   label: 'Name: A to Z' },
  { value: 'name:desc',  label: 'Name: Z to A' },
  { value: 'stock:asc',  label: 'Best Sellers' },
];

const DEFAULT_FILTERS = {
  search:    '',
  category:  '',
  min_price: '',
  max_price: '',
  sort:      'id',
  order:     'desc',
  featured:  '',
  badge:     '',
  page:      1,
};

function ProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Build the filter state from the current URL. Called on mount AND whenever
  // the query string changes (e.g. user clicks a nav link while already on /products).
  const buildFromParams = useCallback(() => ({
    ...DEFAULT_FILTERS,
    search:    searchParams.get('search')    || '',
    category:  searchParams.get('category')  || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort:      searchParams.get('sort')      || 'id',
    order:     searchParams.get('order')     || 'desc',
    featured:  searchParams.get('featured')  || '',
    badge:     searchParams.get('badge')     || '',
    page:      parseInt(searchParams.get('page')) || 1,
  }), [searchParams]);

  const [filters, setFilters] = useState(buildFromParams);

  // Re-sync when the URL changes (nav links, back/forward button).
  useEffect(() => {
    const next = buildFromParams();
    setFilters(next);
    setPriceDraft({ min: next.min_price, max: next.max_price });
  }, [buildFromParams]);

  // Price inputs are deferred — user types, then hits "Apply" (or Enter).
  // This avoids firing an API call on every keystroke.
  const [priceDraft, setPriceDraft] = useState({
    min: filters.min_price,
    max: filters.max_price,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null));
      const { data } = await productsApi.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      setProducts([]);
      setPagination({ total: 0, page: 1, pages: 1 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const applyPrice = () => {
    setFilters((prev) => ({
      ...prev,
      min_price: priceDraft.min,
      max_price: priceDraft.max,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setPriceDraft({ min: '', max: '' });
  };

  const activeCount = useMemo(
    () => [filters.category, filters.min_price, filters.max_price, filters.featured, filters.badge].filter(Boolean).length,
    [filters]
  );

  const currentSort = `${filters.sort}:${filters.order}`;
  const BADGE_LABELS = { new: 'New Products', bestseller: 'Bestsellers', sale: 'On Sale', hot: 'Hot Deals' };
  const heading = filters.search
    ? `Results for "${filters.search}"`
    : filters.badge
      ? (BADGE_LABELS[filters.badge] || `${filters.badge} Products`)
      : filters.featured === 'true'
        ? 'Featured Products'
        : filters.category
          ? (categories.find((c) => c.slug === filters.category)?.name || 'Products')
          : 'All Products';

  // -----------------------------------------------------------------------
  // Filter panel — rendered in both the desktop sidebar and mobile drawer.
  // -----------------------------------------------------------------------
  const FilterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Filters</h3>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Category</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value=""
              checked={!filters.category}
              onChange={() => updateFilter('category', '')}
              className="accent-red-600"
            />
            <span className="text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat.slug}
                checked={filters.category === cat.slug}
                onChange={() => updateFilter('category', cat.slug)}
                className="accent-red-600"
              />
              <span className="text-sm text-gray-700 flex-1 truncate">{cat.name}</span>
              {cat.product_count != null && (
                <span className="text-xs text-gray-400">({cat.product_count})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Min"
            value={priceDraft.min}
            onChange={(e) => setPriceDraft((p) => ({ ...p, min: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Max"
            value={priceDraft.max}
            onChange={(e) => setPriceDraft((p) => ({ ...p, max: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button
          type="button"
          onClick={applyPrice}
          disabled={priceDraft.min === filters.min_price && priceDraft.max === filters.max_price}
          className="mt-2 w-full bg-gray-900 hover:bg-black text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>

      {/* Featured */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.featured === 'true'}
            onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : '')}
            className="h-4 w-4 accent-red-600"
          />
          <span className="text-sm text-gray-700">Featured only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{heading}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total} product{pagination.total === 1 ? '' : 's'} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter trigger */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => {
                const [sort, order] = e.target.value.split(':');
                setFilters((prev) => ({ ...prev, sort, order, page: 1 }));
              }}
              className="appearance-none bg-white border border-gray-300 hover:border-gray-400 rounded-lg pl-4 pr-9 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>Sort: {label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {filters.category && (
            <button
              type="button"
              onClick={() => updateFilter('category', '')}
              className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold hover:bg-red-100"
            >
              {categories.find((c) => c.slug === filters.category)?.name || filters.category}
              <X className="h-3 w-3" />
            </button>
          )}
          {(filters.min_price || filters.max_price) && (
            <button
              type="button"
              onClick={() => {
                setPriceDraft({ min: '', max: '' });
                setFilters((prev) => ({ ...prev, min_price: '', max_price: '', page: 1 }));
              }}
              className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold hover:bg-red-100"
            >
              ${filters.min_price || '0'} – ${filters.max_price || '∞'}
              <X className="h-3 w-3" />
            </button>
          )}
          {filters.badge && (
            <button
              type="button"
              onClick={() => updateFilter('badge', '')}
              className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold hover:bg-red-100 capitalize"
            >
              {filters.badge} <X className="h-3 w-3" />
            </button>
          )}
          {filters.featured === 'true' && (
            <button
              type="button"
              onClick={() => updateFilter('featured', '')}
              className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold hover:bg-red-100"
            >
              Featured <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            {FilterPanel}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <p className="text-5xl mb-4">🛍️</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                        pagination.page === p
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto w-[86%] max-w-sm bg-white h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">{FilterPanel}</div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm"
              >
                Show {pagination.total} product{pagination.total === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
