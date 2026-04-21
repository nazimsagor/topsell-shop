'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { productsApi, categoriesApi } from '@/lib/api';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'desc',
    featured: searchParams.get('featured') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await productsApi.getAll(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', min_price: '', max_price: '', sort: 'created_at', order: 'desc', featured: '', page: 1 });
  };

  const activeFilters = [filters.category, filters.min_price, filters.max_price, filters.search].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.search ? `Results for "${filters.search}"` : filters.category ? categories.find(c => c.slug === filters.category)?.name || 'Products' : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={`${filters.sort}:${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split(':');
              setFilters((prev) => ({ ...prev, sort, order, page: 1 }));
            }}
            className="input py-2 text-sm w-auto"
          >
            <option value="created_at:desc">Newest First</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="rating:desc">Top Rated</option>
            <option value="sold_count:desc">Best Selling</option>
          </select>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
          <div className="card p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary-600 flex items-center gap-1 hover:underline">
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="category" value="" checked={!filters.category} onChange={() => updateFilter('category', '')} className="text-primary-600" />
                  <span className="text-sm text-gray-700">All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value={cat.slug} checked={filters.category === cat.slug} onChange={() => updateFilter('category', cat.slug)} className="text-primary-600" />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">({cat.product_count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                  className="input py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                  className="input py-2 text-sm"
                />
              </div>
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured === 'true'}
                  onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : '')}
                  className="text-primary-600"
                />
                <span className="text-sm text-gray-700">Featured Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                        pagination.page === p
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:border-primary-400'
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
    </div>
  );
}
