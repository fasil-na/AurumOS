import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Truck, Plus, Trash2, XCircle } from 'lucide-react';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/suppliers');
      setSuppliers(data.suppliers);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier) return;
    try {
      await api.post('/suppliers', { name: newSupplier, isInternal });
      toast.success('Supplier created');
      setNewSupplier('');
      setIsInternal(false);
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create supplier');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success('Supplier deleted');
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200 backdrop-blur-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading suppliers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white/80 p-6 rounded-2xl border border-slate-200 backdrop-blur-md shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Supplier Management</h3>
          <p className="text-slate-500 text-sm">Manage suppliers for inventory.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-slate-800 bg-blue-600 hover:bg-blue-500 transition-all shadow-lg"
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(supplier => (
          <div key={supplier._id} className="bg-white/80 p-6 rounded-2xl border border-slate-200 flex justify-between items-center group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Truck className="text-indigo-400" size={20} />
              </div>
              <span className="text-lg font-medium text-slate-700 capitalize">{supplier.name}</span>
              {supplier.isInternal && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md uppercase tracking-wider ml-2 border border-blue-200">Internal</span>
              )}
            </div>
            <button onClick={() => handleDeleteSupplier(supplier._id)} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-100 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white/60 rounded-2xl border border-slate-200">
            <Truck className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-500 font-medium">No suppliers found</p>
            <p className="text-sm text-slate-500 mt-1">Create your first supplier to get started.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Add New Supplier</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateSupplier} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Supplier Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Truck className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={newSupplier}
                      onChange={(e) => setNewSupplier(e.target.value)}
                      placeholder="e.g. Stellar, Acme Co"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-slate-50 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm shadow-inner"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Internal Company Stock</p>
                    <p className="text-xs text-slate-500">Check this if this represents your own gold</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newSupplier}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
                  >
                    <Plus size={18} className="mr-2" /> Create Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
