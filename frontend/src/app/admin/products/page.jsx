'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/store/useAuthStore';
import { productsApi } from '@/lib/api';

export default function AdminProductsPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    productsApi.getAll({ limit: 50 })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setFetching(false));
  }, [user]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="card mb-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Price', 'Stock', 'Category', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3" colSpan={6}><div className="h-8 bg-gray-100 rounded" /></td>
                  </tr>
                ))
              ) : filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold">${parseFloat(product.price).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{product.category_name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
