import React, { useState } from 'react';
import { uploadSiteMedia } from '../api';
import { X, Upload } from 'lucide-react';

interface ImagePickerModalProps {
  isOpen: boolean;
  siteId: string;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

const CURATED_STOCK_IMAGES = [
  // Business / Services
  { label: 'Technician at Work', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80', cat: 'business' },
  { label: 'Modern Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', cat: 'business' },
  { label: 'Handshake Collaboration', url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80', cat: 'business' },
  // Restaurant / Food
  { label: 'Fine Dining Ambience', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', cat: 'food' },
  { label: 'Wood-Fired Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80', cat: 'food' },
  { label: 'Fresh Pasta & Wine', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80', cat: 'food' },
  // Portfolio / Creative
  { label: 'Creative Designer Headshot', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80', cat: 'creative' },
  { label: 'App Mockup on Desk', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', cat: 'creative' },
  { label: 'Analytics Dashboard Screen', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', cat: 'creative' },
  // Agency / Tech
  { label: 'Engineering Team', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', cat: 'agency' },
  { label: 'Laptop Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', cat: 'agency' },
  { label: 'Modern Architecture', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', cat: 'agency' },
];

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  siteId,
  onClose,
  onSelectImage,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'upload'>('stock');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Client-side HTML5 Canvas resize to WebP <= 200KB before uploading to D1
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1400;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setUploadError('Failed to process image');
          setUploading(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob with 0.8 quality
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              setUploadError('Failed to encode WebP image');
              setUploading(false);
              return;
            }

            if (blob.size > 200 * 1024) {
              // Try higher compression if still above 200KB
              canvas.toBlob(
                async (compressedBlob) => {
                  if (!compressedBlob) return;
                  await executeUpload(compressedBlob, file.name);
                },
                'image/webp',
                0.6
              );
            } else {
              await executeUpload(blob, file.name);
            }
          },
          'image/webp',
          0.8
        );
      };

      reader.readAsDataURL(file);
    } catch {
      setUploadError('Image processing error');
      setUploading(false);
    }
  };

  const executeUpload = async (blob: Blob, originalName: string) => {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const res = await uploadSiteMedia(siteId, bytes, originalName.replace(/\.[^/.]+$/, '') + '.webp');
    if (res.error || !res.url) {
      setUploadError(res.error || 'Upload rejected by server quota');
      setUploading(false);
    } else {
      setUploading(false);
      onSelectImage(res.url);
      onClose();
    }
  };

  const filteredStock =
    filter === 'all'
      ? CURATED_STOCK_IMAGES
      : CURATED_STOCK_IMAGES.filter((img) => img.cat === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Select Image</h2>
          <p className="text-xs text-slate-500">
            Use high-speed free stock photos (0 D1 storage used) or upload a custom compressed photo.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-2 rounded-lg transition ${activeTab === 'stock' ? 'bg-white text-slate-900 shadow-xs' : ''}`}
          >
            Free Stock Photos (Unsplash)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-lg transition ${activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : ''}`}
          >
            Upload Custom (Client WebP)
          </button>
        </div>

        {activeTab === 'stock' ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="flex gap-2 text-xs font-semibold overflow-x-auto pb-1">
              {['all', 'business', 'food', 'creative', 'agency'].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition whitespace-nowrap ${
                    filter === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredStock.map((img, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onSelectImage(img.url);
                    onClose();
                  }}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-slate-200/80 hover:border-blue-500 relative aspect-video transition"
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent opacity-0 group-hover:opacity-100 transition p-2 flex items-end">
                    <span className="text-[11px] font-bold text-white truncate">{img.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Upload size={22} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Upload and Resize</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
              Your browser automatically optimizes and compresses the image to high-efficiency WebP (≤200 KB) before saving to D1 storage.
            </p>

            {uploadError && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {uploadError}
              </div>
            )}

            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition">
              <span>{uploading ? 'Resizing & Uploading...' : 'Choose Image File'}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                disabled={uploading}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
