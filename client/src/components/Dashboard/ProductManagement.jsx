import React, { useState, useEffect } from 'react';
import { Plus, Upload, X, Package, CheckSquare, Layers } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onEdit }) => {
  const [currentImg, setCurrentImg] = useState(0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden hover:shadow-xl transition-shadow group relative">
      <div className="aspect-square bg-slate-50 relative overflow-hidden border-b border-slate-100">
        <button onClick={() => onEdit(product)} className="absolute top-3 left-3 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-sm z-20 transition-colors opacity-0 group-hover:opacity-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </button>
        {product.images && product.images.length > 0 ? (
          <>
            <img src={product.images[currentImg]} alt={product.productCode} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

            {product.images.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg((prev) => (prev > 0 ? prev - 1 : product.images.length - 1)); }}
                    className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md pointer-events-auto transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg((prev) => (prev < product.images.length - 1 ? prev + 1 : 0)); }}
                    className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md pointer-events-auto transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>

                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(idx); }}
                      className={`w-2 h-2 rounded-full transition-all shadow-sm ${currentImg === idx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/90'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <Package size={48} className="opacity-40 mb-2" />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-1">{product.productCode}</h3>
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm font-medium text-slate-500">Weight</span>
          <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">{product.weight}g</span>
        </div>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productCode: '',
    weight: '',
    images: null,
    sections: []
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data } = await api.get('/sections');
      setAvailableSections(data.sections);
    } catch (error) {
      toast.error('Failed to load sections');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData({ ...formData, images: filesArray });

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewImages(newPreviews);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      productCode: product.productCode,
      weight: product.weight || '',
      sections: product.sections || [],
      images: null
    });
    setExistingImages(product.images || []);
    setPreviewImages([]);
    setEditingProductId(product._id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ productCode: '', weight: '', images: null, sections: [] });
    setPreviewImages([]);
    setExistingImages([]);
    setEditingProductId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productCode || !formData.weight) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('productCode', formData.productCode);
      data.append('weight', formData.weight);
      data.append('sections', JSON.stringify(formData.sections));
      data.append('existingImages', existingImages.length > 0 ? JSON.stringify(existingImages) : '');

      if (formData.images) {
        formData.images.forEach(img => {
          data.append('images', img);
        });
      }

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 p-6 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-blue-500" /> Products Catalog
          </h2>
          <p className="text-slate-500 mt-1">Manage your jewelry products</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} onEdit={handleEdit} />
        ))}
        {products.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-slate-200 border-dashed">
            <Package size={64} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">No products found</p>
            <p className="text-slate-400 text-sm mt-1">Start by adding a new product to your catalog!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); resetForm(); }}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Code</label>
                  <input
                    type="text"
                    required
                    value={formData.productCode}
                    onChange={e => setFormData({ ...formData, productCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50"
                    placeholder="e.g. RG-1024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Weight (g)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50"
                    placeholder="e.g. 15.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Production Stages</label>
                <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {availableSections.length > 0 ? availableSections.map(section => (
                    <label key={section._id} className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${formData.sections.includes(section._id) ? 'bg-blue-600/10 border-blue-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.sections.includes(section._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, sections: [...formData.sections, section._id] });
                          } else {
                            setFormData({ ...formData, sections: formData.sections.filter(id => id !== section._id) });
                          }
                        }}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2.5 flex-shrink-0 ${formData.sections.includes(section._id) ? 'bg-blue-500 border-blue-500' : 'border-slate-400'}`}>
                        {formData.sections.includes(section._id) && <CheckSquare size={12} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium text-slate-700 truncate">{section.name}</span>
                    </label>
                  )) : (
                    <div className="col-span-2 text-sm text-slate-500 italic p-2 text-center">No sections available. Please create them first.</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Images</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (Max 5 images)</p>
                  </div>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>

                {(existingImages.length > 0 || previewImages.length > 0) && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {existingImages.map((src, index) => (
                      <div key={`exist-${index}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 group/img">
                        <img src={src} alt="existing" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full p-0.5 text-rose-500 opacity-0 group-hover/img:opacity-100 transition-all shadow-sm">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {previewImages.map((src, index) => (
                      <div key={`new-${index}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-blue-200 flex-shrink-0">
                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
