'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
  Star, Check, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/store/useAuthStore';
import { productsApi, categoriesApi } from '@/lib/api';

const PAGE_SIZE = 20;
const BADGES = ['NEW', 'HOT', 'SALE', 'BESTSELLER'];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'oldest',     label: 'Oldest first' },
  { value: 'name-asc',   label: 'Name: A → Z' },
  { value: 'name-desc',  label: 'Name: Z → A' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'stock-asc',  label: 'Stock: Low → High' },
  { value: 'stock-desc', label: 'Stock: High → Low' },
];

export default function AdminProductsPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching]   = useState(true);

  // Search + filters
  const [searchInput, setSearchInput]       = useState('');
  const [search, setSearch]                 = useState('');         // debounced
  const [categoryFilter, setCategoryFilter] = useState('');
  const [badgeFilter, setBadgeFilter]       = useState('');
  const [stockFilter, setStockFilter]       = useState('');         // '' | 'in' | 'out'
  const [featuredFilter, setFeaturedFilter] = useState('');         // '' | 'yes' | 'no'
  const [minPrice, setMinPrice]             = useState('');
  const [maxPrice, setMaxPrice]             = useState('');
  const [sort, setSort]                     = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);

  // Bulk select
  const [selected, setSelected] = useState(() => new Set());

  // Inline edit { id, field: 'price'|'stock', value }
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      productsApi.getAll({ limit: 500 }),
      categoriesApi.getAll(),
    ])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data.products || []);
        setCategories(Array.isArray(cRes.data) ? cRes.data : []);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setFetching(false));
  }, [user]);

  // Debounce search input → search (300ms)
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); },
    [search, categoryFilter, badgeFilter, stockFilter, featuredFilter, minPrice, maxPrice, sort]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      list = list.filter((p) => {
        const cat = (p.categories?.name || p.category?.name || '').toLowerCase();
        return (
          p.name?.toLowerCase().includes(search) ||
          cat.includes(search) ||
          (p.badge || '').toLowerCase().includes(search) ||
          (p.sku || '').toLowerCase().includes(search)
        );
      });
    }
    if (categoryFilter) list = list.filter((p) => String(p.category_id) === String(categoryFilter));
    if (badgeFilter) {
      const want = badgeFilter.toLowerCase();
      list = list.filter((p) => (p.badge || '').toLowerCase() === want);
    }
    if (stockFilter === 'in')   list = list.filter((p) => Number(p.stock) > 0);
    if (stockFilter === 'out')  list = list.filter((p) => Number(p.stock) <= 0);
    if (featuredFilter === 'yes') list = list.filter((p) => !!p.badge);
    if (featuredFilter === 'no')  list = list.filter((p) => !p.badge);

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!Number.isNaN(min)) list = list.filter((p) => Number(p.price) >= min);
    if (!Number.isNaN(max)) list = list.filter((p) => Number(p.price) <= max);

    list.sort((a, b) => {
      switch (sort) {
        case 'name-asc':   return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':  return (b.name || '').localeCompare(a.name || '');
        case 'price-asc':  return Number(a.price) - Number(b.price);
        case 'price-desc': return Number(b.price) - Number(a.price);
        case 'stock-asc':  return Number(a.stock) - Number(b.stock);
        case 'stock-desc': return Number(b.stock) - Number(a.stock);
        case 'oldest':     return Number(a.id) - Number(b.id);
        case 'newest':
        default:           return Number(b.id) - Number(a.id);
      }
    });
    return list;
  }, [products, search, categoryFilter, badgeFilter, stockFilter, featuredFilter, minPrice, maxPrice, sort]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged       = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allOnPageSelected = paged.length > 0 && paged.every((p) => selected.has(p.id));
  const togglePageAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) paged.forEach((p) => next.delete(p.id));
      else paged.forEach((p) => next.add(p.id));
      return next;
    });
  };
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchInput(''); setSearch('');
    setCategoryFilter(''); setBadgeFilter(''); setStockFilter('');
    setFeaturedFilter(''); setMinPrice(''); setMaxPrice('');
    setSort('newest');
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected product${selected.size === 1 ? '' : 's'}?`)) return;
    const ids = [...selected];
    const results = await Promise.allSettled(ids.map((id) => productsApi.delete(id)));
    const okIds = ids.filter((_, i) => results[i].status === 'fulfilled');
    setProducts((prev) => prev.filter((p) => !okIds.includes(p.id)));
    setSelected(new Set());
    const failed = results.length - okIds.length;
    if (failed) toast.error(`Deleted ${okIds.length}, failed ${failed}`);
    else toast.success(`Deleted ${okIds.length} products`);
  };

  const startEdit = (id, field, current) =>
    setEditing({ id, field, value: String(current ?? '') });
  const cancelEdit = () => setEditing(null);
  const saveEdit = async () => {
    if (!editing) return;
    const { id, field, value } = editing;
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) { toast.error('Enter a valid number'); return; }
    try {
      const { data } = await productsApi.update(id, { [field]: num });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: data[field] ?? num } : p)));
      toast.success(`${field === 'price' ? 'Price' : 'Stock'} updated`);
      setEditing(null);
    } catch {
      toast.error('Failed to update');
    }
  };

  const toggleFeatured = async (product) => {
    // "Featured" = has any badge (matches backend `featured=true` filter).
    // Toggling: clear badge if set, otherwise set to NEW.
    const next = product.badge ? null : 'NEW';
    try {
      const { data } = await productsApi.update(product.id, { badge: next });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, badge: data.badge ?? next } : p))
      );
      toast.success(next ? 'Marked as featured' : 'Removed from featured');
    } catch {
      toast.error('Failed to toggle featured');
    }
  };

  const hasFilters = search || categoryFilter || badgeFilter || stockFilter || featuredFilter || minPrice || maxPrice || sort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products ({products.length})</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} matching filter{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Filter bar */}
      <div className="card mb-4 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search by name, category, badge, SKU…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={badgeFilter} onChange={(e) => setBadgeFilter(e.target.value)} className="input">
            <option value="">All badges</option>
            {BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="input">
            <option value="">Any stock</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)} className="input">
            <option value="">Any featured</option>
            <option value="yes">Featured only</option>
            <option value="no">Not featured</option>
          </select>
          <input type="number" min="0" placeholder="Min ৳" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input" />
          <input type="number" min="0" placeholder="Max ৳" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Sort by</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-auto">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-600 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="card mb-4 p-3 flex items-center justify-between bg-orange-50 border-orange-200">
          <p className="text-sm font-medium text-gray-700">{selected.size} selected</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-semibold border border-gray-300 rounded-lg px-3 py-1.5 hover:border-gray-400"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1 text-xs font-semibold border border-red-300 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allOnPageSelected} onChange={togglePageAll} className="h-4 w-4" />
                </th>
                {['Product', 'Category', 'Price', 'Stock', 'Badge', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3" colSpan={8}><div className="h-8 bg-gray-100 rounded" /></td>
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No products match these filters</td></tr>
              ) : paged.map((product) => {
                const image = product.image || product.images?.[0] || null;
                const categoryName = product.categories?.name || product.category?.name || product.category_name || '—';
                const isEditingPrice = editing?.id === product.id && editing.field === 'price';
                const isEditingStock = editing?.id === product.id && editing.field === 'stock';
                const stockNum = Number(product.stock) || 0;
                const featured = !!product.badge;

                return (
                <tr key={product.id} className={`hover:bg-gray-50 ${selected.has(product.id) ? 'bg-orange-50/40' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleOne(product.id)} className="h-4 w-4" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        {image
                          ? <img src={image} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku || `#${product.id}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{categoryName}</td>
                  <td className="px-5 py-3 font-semibold">
                    {isEditingPrice ? (
                      <InlineEdit editing={editing} setEditing={setEditing} onSave={saveEdit} onCancel={cancelEdit} />
                    ) : (
                      <button
                        onClick={() => startEdit(product.id, 'price', product.price)}
                        className="hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 text-left"
                        title="Click to edit"
                      >
                        ৳{parseFloat(product.price).toFixed(0)}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {isEditingStock ? (
                      <InlineEdit editing={editing} setEditing={setEditing} onSave={saveEdit} onCancel={cancelEdit} />
                    ) : (
                      <button
                        onClick={() => startEdit(product.id, 'stock', product.stock)}
                        className={`badge cursor-pointer hover:opacity-80 ${stockNum <= 0 ? 'bg-red-100 text-red-700' : stockNum < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                        title="Click to edit"
                      >
                        {stockNum}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {product.badge
                      ? <span className="badge bg-orange-100 text-orange-700">{product.badge}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleFeatured(product)}
                      className="p-1 rounded hover:bg-gray-100"
                      title={featured ? 'Remove featured' : 'Mark as featured'}
                    >
                      <Star className={`h-5 w-5 ${featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product.id}`} className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!fetching && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
            <p className="text-gray-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InlineEdit({ editing, setEditing, onSave, onCancel }) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        autoFocus
        value={editing.value}
        onChange={(e) => setEditing((s) => ({ ...s, value: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === 'Enter')  onSave();
          if (e.key === 'Escape') onCancel();
        }}
        className="input py-1 px-2 w-24 text-sm"
      />
      <button onClick={onSave}   className="p-1 rounded text-green-600 hover:bg-green-50"><Check className="h-4 w-4" /></button>
      <button onClick={onCancel} className="p-1 rounded text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
    </div>
  );
}
