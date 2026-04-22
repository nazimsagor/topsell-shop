'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';
import useAuthStore from '../../../../store/useAuthStore';
import { productsApi, categoriesApi } from '../../../../lib/api';
import ImageUploader from '../../../../components/admin/ImageUploader';

const BADGES = ['', 'hot', 'sale', 'new', 'featured'];

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const imageUrl = watch('image');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      productsApi.getOne(id).then(({ data }) => data),
      categoriesApi.getAll().then(({ data }) => data).catch(() => []),
    ])
      .then(([p, cats]) => {
        setProduct(p);
        setCategories(cats || []);
        reset({
          name: p.name || '',
          description: p.description || '',
          price: p.price ?? '',
          old_price: p.old_price ?? '',
          stock: p.stock ?? 0,
          category_id: p.category_id || '',
          badge: p.badge || '',
          is_featured: !!p.is_featured,
          image: p.image || '',
          is_active: p.is_active != null ? p.is_active : true,
        });
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id, user, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        old_price: data.old_price ? parseFloat(data.old_price) : null,
        stock: parseInt(data.stock) || 0,
        category_id: data.category_id || null,
        badge: data.badge || null,
        is_featured: !!data.is_featured,
        image: data.image || null,
        is_active: !!data.is_active,
      };
      await productsApi.update(id, payload);
      toast.success('Product updated');
      router.push('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update product');
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  if (!product) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Product not found</h2>
      <Link href="/admin/products" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl">
        Back to Products
      </Link>
    </div>
  );

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input {...register('name', { required: 'Name is required' })} className={inputCls} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={5} className={`${inputCls} resize-none`} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input {...register('price', { required: true, min: 0 })} type="number" step="0.01" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Old Price</label>
              <input {...register('old_price')} type="number" step="0.01" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input {...register('stock', { required: true, min: 0 })} type="number" className={inputCls} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Organization</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select {...register('category_id')} className={inputCls}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
            <select {...register('badge')} className={inputCls}>
              {BADGES.map((b) => (
                <option key={b} value={b}>{b ? b.charAt(0).toUpperCase() + b.slice(1) : 'None'}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('is_featured')} type="checkbox" className="accent-red-600 w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('is_active')} type="checkbox" className="accent-red-600 w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Image</h2>
          <input type="hidden" {...register('image')} />
          <ImageUploader
            value={imageUrl}
            onChange={(url) => setValue('image', url, { shouldDirty: true })}
            label=""
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/admin/products"
            className="flex-1 text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
