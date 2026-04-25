'use client';
import { useParams } from 'next/navigation';
import BlogForm from '@/components/admin/BlogForm';

export default function EditBlogPostPage() {
  const { id } = useParams();
  return <BlogForm mode="edit" postId={id} />;
}
