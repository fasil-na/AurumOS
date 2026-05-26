import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layers, Plus, Trash2, XCircle } from 'lucide-react';

const StoneManagement = () => {
  const [stoneTypes, setStoneTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStoneType, setNewStoneType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoneTypes();
  }, []);

  const fetchStoneTypes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/stones');
      setStoneTypes(data.stoneTypes);
    } catch (error) {
      toast.error('Failed to load stone types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStoneType = async (e) => {
    e.preventDefault();
    if (!newStoneType) return;
    try {
      await api.post('/stones', { name: newStoneType });
      toast.success('Stone type created');
      setNewStoneType('');
      setIsModalOpen(false);
      fetchStoneTypes();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create stone type');
    }
  };

  const handleDeleteStoneType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stone type?')) return;
    try {
      await api.delete(`/stones/${id}`);
      toast.success('Stone type deleted');
      fetchStoneTypes();
    } catch (error) {
      toast.error('Failed to delete stone type');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200 backdrop-blur-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading master data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white/80 p-6 rounded-2xl border border-slate-200 backdrop-blur-md shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Master Data Management</h3>
          <p className="text-slate-500 text-sm">Manage stone types and other master data here.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-slate-800 bg-blue-600 hover:bg-blue-500 transition-all shadow-lg"
        >
          <Plus size={18} /> Add Stone Type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stoneTypes.map(stone => (
          <div key={stone._id} className="bg-white/80 p-6 rounded-2xl border border-slate-200 flex justify-between items-center group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Layers className="text-indigo-400" size={20} />
              </div>
              <span className="text-lg font-medium text-slate-700 capitalize">{stone.name}</span>
            </div>
            <button onClick={() => handleDeleteStoneType(stone._id)} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-100 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {stoneTypes.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white/60 rounded-2xl border border-slate-200">
            <Layers className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-500 font-medium">No stone types found</p>
            <p className="text-sm text-slate-500 mt-1">Create your first stone type to get started.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Add New Stone Type</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateStoneType} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stone Type Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Layers className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={newStoneType}
                      onChange={(e) => setNewStoneType(e.target.value)}
                      placeholder="e.g. Diamond, Ruby, Emerald"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-slate-50 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm shadow-inner"
                      required
                    />
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
                    disabled={!newStoneType}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
                  >
                    <Plus size={18} className="mr-2" /> Create Stone Type
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

export default StoneManagement;
