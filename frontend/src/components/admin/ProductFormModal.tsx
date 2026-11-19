import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Edit, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminCategory, AdminProductPayload } from '../../types/admin';
import { Product } from '../../types';

interface ProductFormModalProps {
  product: Product | null; // If null, mode is ADD; if provided, mode is EDIT
  categories: AdminCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onClose,
  onSuccess,
}) => {
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name || '');
  const [subtitle, setSubtitle] = useState(product?.subtitle || '');
  const [description, setDescription] = useState(
    product?.description || 'Artisanal piece crafted for enduring quiet luxury.'
  );
  const [gender, setGender] = useState<'men' | 'women' | 'kids' | 'living'>(
    (product?.gender as any) || 'men'
  );
  const [categoryId, setCategoryId] = useState<string | number>(
    (product?.category as any)?.id || categories[0]?.id || ''
  );
  const [price, setPrice] = useState<number | string>(product?.price || '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(
    product?.originalPrice || product?.price || ''
  );
  const [stockQuantity, setStockQuantity] = useState<number | string>(
    product?.stockQuantity ?? 30
  );
  const [inStock, setInStock] = useState<boolean>(product?.inStock ?? true);
  const [materials, setMaterials] = useState<string>(
    product?.materials || '100% Pure Natural Fiber'
  );
  const [badge, setBadge] = useState<string>(product?.badge || 'New Arrival');
  const [imageUrl, setImageUrl] = useState<string>(
    product?.primaryImage ||
      (product?.images && product.images[0]) ||
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a product title.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Please provide a valid price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && product) {
        const res = await adminService.updateProduct(product.id, {
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : Number(price),
          stockQuantity: Number(stockQuantity),
          inStock: Boolean(inStock),
          materials: materials.trim(),
          badge: badge.trim(),
        });
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.message || 'Failed to update product.');
        }
      } else {
        const payload: AdminProductPayload = {
          name: name.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          gender,
          categoryId: categoryId || (categories[0]?.id ?? 1),
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : Number(price),
          stockQuantity: Number(stockQuantity),
          inStock: Boolean(inStock),
          materials: materials.trim(),
          badge: badge.trim(),
          images: [imageUrl.trim()],
        };

        const res = await adminService.createProduct(payload);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.message || 'Failed to create product.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to complete catalogue operation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-[#FAF8F5] border border-[#E4DED4] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#242522] text-[#F8F6F1] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8C6AA]">
              Catalogue Architecture
            </span>
            <h3 className="font-serif text-lg text-white">
              {isEdit ? `Edit Product: ${product?.name} (${product?.id})` : 'Introduce New Catalogue Piece'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#D8C6AA] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Name & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Silk Linen Relaxed Shirt"
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                Subtitle / Cut
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Relaxed Fit • Spread Collar"
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
              />
            </div>
          </div>

          {/* Gender & Category */}
          {!isEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                  Department / Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
                >
                  <option value="men">Men's Department</option>
                  <option value="women">Women's Department</option>
                  <option value="kids">Kids & Juniors</option>
                  <option value="living">Living & Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.targetAudience})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Pricing & Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12500"
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522] font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="15000"
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522] font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => {
                  setStockQuantity(e.target.value);
                  if (Number(e.target.value) === 0) setInStock(false);
                }}
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522] font-mono"
              />
            </div>
          </div>

          {/* In Stock & Badge */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                Curatorial Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. New Arrival, Signature, Bestseller"
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 accent-[#242522]"
                />
                <span className="text-xs font-semibold text-[#242522] uppercase tracking-wider">
                  Available in Stock
                </span>
              </label>
            </div>
          </div>

          {/* Materials */}
          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
              Fabric Composition & Materials
            </label>
            <input
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="e.g. 100% French Flax Linen, Horn Buttons"
              className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
            />
          </div>

          {/* Image URL */}
          {!isEdit && (
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
                Primary Product Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522] font-mono"
              />
              {imageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-10 h-12 object-cover border border-[#E4DED4]"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800';
                    }}
                  />
                  <span className="text-[10px] text-[#777B63]">Image Preview</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5C55] mb-1">
              Atelier Narrative / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of craftsmanship..."
              className="w-full text-xs p-2.5 bg-white border border-[#D8C6AA] text-[#242522] focus:outline-hidden focus:border-[#242522]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-[#E4DED4] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs uppercase tracking-wider text-[#5A5C55] hover:text-[#242522]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest hover:bg-[#3A3B37] transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                <>
                  <Edit className="w-3.5 h-3.5 text-[#D8C6AA]" />
                  Save Product
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#D8C6AA]" />
                  Publish Product
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

