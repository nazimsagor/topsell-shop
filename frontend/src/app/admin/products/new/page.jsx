'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { productsApi, categoriesApi } from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';
import { useState } from 'react';

export default function NewProductPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
    categoriesApi.getAll().then(({ data }) => setCategories(data)).catch(() => {});
  }, [user, loading, router]);

  const onSubmit = async (data) => {
    try {
      // Whitelist to columns that actually exist on the `products` table.
      const payload = {
        name: data.name,
        slug:
          data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
          '-' +
          Date.now(),
        description: data.description || null,
        price: parseFloat(data.price),
        old_price: data.compare_price ? parseFloat(data.compare_price) : null,
        stock: parseInt(data.stock) || 0,
        category_id: data.category_id || null,
        image: image || null,
        badge: data.is_featured === 'true' ? 'featured' : null,
      };
      await productsApi.create(payload);
      toast.success('Product created!');
      router.push('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="input" placeholder="e.g. Premium Wireless Headphones" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <input {...register('short_description')} className="input" placeholder="Brief product summary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
            <textarea {...register('description')} rows={5} className="input resize-none" placeholder="Detailed product description..." />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input {...register('price', { required: true, min: 0 })} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price</label>
              <input {...register('compare_price')} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input {...register('stock', { required: true, min: 0 })} type="number" className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input {...register('sku')} className="input" placeholder="e.g. SKU-001" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Organization</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select {...register('category_id')} className="input">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input {...register('brand')} className="input" placeholder="Brand name" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('is_featured')} type="checkbox" value="true" className="text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Image</h2>
          <ImageUploader value={image} onChange={setImage} label="" />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </button>
          <Link href="/admin/products" className="btn-secondary flex-1 text-center">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
