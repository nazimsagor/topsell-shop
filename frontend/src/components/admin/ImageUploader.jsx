'use client';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Link as LinkIcon, X, ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';

async function uploadToCloudinary(file, onProgress) {
  const form = new FormData();
  form.append('image', file);
  return axios.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
}

const TABS = [
  { id: 'upload', label: 'Upload', Icon: Upload },
  { id: 'url',    label: 'URL',    Icon: LinkIcon },
];

/**
 * ImageUploader — drag/drop OR paste a URL.
 *
 * Props:
 *   value       string | null  — current image URL
 *   onChange    (url|null)     — called when image changes (upload complete or URL typed or cleared)
 *   label       string         — optional field label
 */
export default function ImageUploader({ value, onChange, label = 'Image' }) {
  const [tab, setTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  const absUrl = (u) => (u && u.startsWith('/') ? `${apiBase}${u}` : u);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await uploadToCloudinary(file, (p) => setProgress(p));
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clear = () => onChange(null);

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      {/* Tabs */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 mb-3">
        {TABS.map(({ id, label: l, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {l}
          </button>
        ))}
      </div>

      {/* Preview */}
      {value ? (
        <div className="relative mb-3 w-full max-w-xs">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={absUrl(value)} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={clear}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mb-3 w-full max-w-xs aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
          <ImageIcon className="h-10 w-10" />
        </div>
      )}

      {/* Upload panel */}
      {tab === 'upload' && (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`w-full rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-red-50/30'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
              <p className="text-sm font-medium">Uploading... {progress}%</p>
              <div className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-7 w-7 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Drag & drop image here, or <span className="text-red-600 underline">click to browse</span>
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
        </div>
      )}

      {/* URL panel */}
      {tab === 'url' && (
        <div>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="https://example.com/image.jpg"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-400 mt-1">Paste a direct link to an image.</p>
        </div>
      )}
    </div>
  );
}
