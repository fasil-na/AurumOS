import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { History, Plus, FileText, X } from 'lucide-react';
import DataTable from '../Shared/DataTable';
import { goldReceiptColumns, stoneReceiptColumns } from './InventoryColumns';
import { STONE_SHAPES, STONE_SHAPE_CONFIG } from '../../constants';

const MaterialTransactions = () => {
  const [balanceData, setBalanceData] = useState({ receipts: [], goldByPurity: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gold');
  const [formData, setFormData] = useState({ weightReceived: '', purity: '', notes: '', stones: [], transactionType: 'Receive', source: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const handleAddStone = () => setFormData({ ...formData, stones: [...formData.stones, { type: '', shape: '', size: '', length: '', width: '', carats: '', quantity: 1 }] });
  
  const handleRemoveStone = (index) => {
    const newStones = [...formData.stones];
    newStones.splice(index, 1);
    setFormData({ ...formData, stones: newStones });
  };
  
  const handleStoneChange = (index, field, value) => {
    const newStones = [...formData.stones];
    newStones[index][field] = value;
    setFormData({ ...formData, stones: newStones });
  };

  useEffect(() => {
    fetchInventory();
    fetchStoneTypes();
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data.suppliers);
    } catch (error) {
      console.error('Failed to load suppliers');
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/inventory');
      setBalanceData(data);
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoneTypes = async () => {
    try {
      const { data } = await api.get('/stones');
      setStoneTypes(data.stoneTypes);
    } catch (error) {
      console.error('Failed to load stone types');
    }
  };

  const handleReceiveMaterial = async (e) => {
    e.preventDefault();
    if (!formData.source && formData.transactionType === 'Receive') {
      toast.error('Please select a supplier');
      return;
    }
    let payload = { notes: formData.notes, transactionType: formData.transactionType, source: formData.source };

    if (activeTab === 'gold') {
      if (!formData.weightReceived || Number(formData.weightReceived) <= 0) {
        toast.error('Please enter a valid weight greater than 0');
        return;
      }
      if (!formData.purity || Number(formData.purity) <= 0 || Number(formData.purity) > 100) {
        toast.error('Please enter a valid purity between 0.01 and 100');
        return;
      }
      if (formData.transactionType === 'Return') {
        const availableForPurity = balanceData.goldByPurity[formData.purity] || 0;
        if (Number(formData.weightReceived) > availableForPurity) {
          toast.error(`Cannot return more than available (${availableForPurity}g) for ${formData.purity} purity`);
          return;
        }
      }
      payload.weightReceived = formData.weightReceived;
      payload.purity = formData.purity;
    } else {
      if (formData.stones.length === 0) {
        toast.error('Please add at least one stone');
        return;
      }
      const validStones = formData.stones.filter(s => s.type);
      if (validStones.length === 0) {
        toast.error('Please select a stone type');
        return;
      }
      for (const stone of validStones) {
        if (!stone.shape) {
          toast.error('Please select a shape for all stones');
          return;
        }
        if (stone.shape === 'Round' && (!stone.size || Number(stone.size) <= 0)) {
          toast.error(`Please enter a valid size for the Round stone`);
          return;
        }
        if (stone.shape !== 'Party Stone' && stone.shape !== 'Round') {
          if (!stone.length || Number(stone.length) <= 0) {
            toast.error(`Please enter a valid length for the ${stone.shape} stone`);
            return;
          }
          if (!stone.width || Number(stone.width) <= 0) {
            toast.error(`Please enter a valid width for the ${stone.shape} stone`);
            return;
          }
        }
        if (!stone.carats || Number(stone.carats) <= 0) {
          toast.error('Carats must be greater than 0 for all stones');
          return;
        }
        if (!stone.quantity || Number(stone.quantity) <= 0) {
          toast.error('Quantity must be greater than 0 for all stones');
          return;
        }
      }
      payload.stones = validStones;
    }

    setIsSubmitting(true);
    try {
      await api.post('/inventory', payload);
      toast.success(`Material ${formData.transactionType === 'Return' ? 'returned' : 'received'} successfully`);
      setFormData({ weightReceived: '', purity: '', notes: '', stones: [], transactionType: 'Receive', source: '' });
      fetchInventory();
    } catch (error) {
      toast.error('Failed to add material receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && balanceData.receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200 backdrop-blur-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 p-6 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-500" /> Material Transactions
          </h2>
          <p className="text-slate-500 mt-1">Log inward receipts and outward returns</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:w-64">
        <button
          type="button"
          className={`flex-1 sm:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'gold' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('gold')}
        >
          ✨ Gold
        </button>
        <button
          type="button"
          className={`flex-1 sm:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'stone' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('stone')}
        >
          💎 Stone
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white/80 p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Plus className="text-blue-500" /> Log Material {formData.transactionType}
            </h3>

            <form onSubmit={handleReceiveMaterial} className="space-y-5">
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.transactionType === 'Receive' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setFormData({ ...formData, transactionType: 'Receive' })}
                >
                  Receive Material
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.transactionType === 'Return' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setFormData({ ...formData, transactionType: 'Return' })}
                >
                  Return Material
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Supplier / Vendor</label>
                <select
                  required={formData.transactionType === 'Receive'}
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-slate-50"
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(sup => (
                    <option key={sup._id} value={sup._id}>{sup.name}</option>
                  ))}
                </select>
              </div>

              {activeTab === 'gold' && (
                <>
                  {formData.transactionType === 'Return' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Purity to Return</label>
                        <select
                          required
                          value={formData.purity}
                          onChange={(e) => setFormData({ ...formData, purity: e.target.value, weightReceived: '' })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-slate-50"
                        >
                          <option value="">-- Select Available Purity --</option>
                          {Object.entries(balanceData.goldByPurity || {})
                            .filter(([_, weight]) => weight > 0)
                            .map(([purity, weight]) => (
                              <option key={purity} value={purity}>
                                {purity} (Available: {weight.toFixed(2)}g)
                              </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Weight to Return (g)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={formData.purity ? balanceData.goldByPurity[formData.purity] : ""}
                          required
                          disabled={!formData.purity}
                          value={formData.weightReceived}
                          onChange={(e) => setFormData({ ...formData, weightReceived: e.target.value })}
                          placeholder="e.g. 500"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-slate-50 disabled:opacity-50"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Weight Received (g)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={formData.weightReceived}
                          onChange={(e) => setFormData({ ...formData, weightReceived: e.target.value })}
                          placeholder="e.g. 500"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Purity % (Required)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="100"
                          required
                          value={formData.purity}
                          onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                          placeholder="e.g. 99.99, 91.6"
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-slate-50"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'stone' && (
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Stones</label>
                    <button type="button" onClick={handleAddStone} className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
                      <Plus size={12} /> Add Stone
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.stones.map((stone, idx) => (
                      <div key={idx} className="relative bg-white p-3 rounded-xl border border-slate-200 shadow-sm mt-3 group">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveStone(idx)} 
                          className="absolute -top-2 -right-2 p-1 text-slate-400 hover:text-rose-500 bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                        >
                          <X size={14} />
                        </button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Type</label>
                            <select
                              required
                              value={stone.type}
                              onChange={(e) => handleStoneChange(idx, 'type', e.target.value)}
                              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                            >
                              <option value="">-- Select Type --</option>
                              {stoneTypes.map(st => (
                                <option key={st._id} value={st.name}>{st.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Shape</label>
                            <select
                              required
                              value={stone.shape}
                              onChange={(e) => {
                                handleStoneChange(idx, 'shape', e.target.value);
                                handleStoneChange(idx, 'size', '');
                                handleStoneChange(idx, 'length', '');
                                handleStoneChange(idx, 'width', '');
                              }}
                              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                            >
                              <option value="">-- Select Shape --</option>
                              {STONE_SHAPES.map(shape => (
                                <option key={shape} value={shape}>{shape}</option>
                              ))}
                            </select>
                          </div>

                          {STONE_SHAPE_CONFIG[stone.shape]?.fields.map((field, fIdx) => (
                            <div key={field}>
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                                {STONE_SHAPE_CONFIG[stone.shape].labels[fIdx]}
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                value={stone[field]}
                                onChange={(e) => handleStoneChange(idx, field, e.target.value)}
                                placeholder="0.00"
                                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                              />
                            </div>
                          ))}

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Carats</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              required
                              value={stone.carats}
                              onChange={(e) => handleStoneChange(idx, 'carats', e.target.value)}
                              placeholder="0.00"
                              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Quantity</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={stone.quantity}
                              onChange={(e) => handleStoneChange(idx, 'quantity', e.target.value)}
                              placeholder="1"
                              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.stones.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic">No stones added. Click "Add Stone".</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes / Waybill (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional info..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-slate-50 resize-none h-24"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl font-bold transition-colors disabled:opacity-50 shadow-md ${formData.transactionType === 'Return'
                  ? 'bg-rose-600 hover:bg-rose-500 hover:shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/20'
                  }`}
              >
                {isSubmitting ? 'Processing...' : <><Plus size={18} /> {formData.transactionType === 'Return' ? 'Process Return' : 'Add to Inventory'}</>}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/80 rounded-2xl border border-slate-200 shadow-lg overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History className="text-blue-500" /> {activeTab === 'gold' ? 'Gold Receipt History' : 'Stone Receipt History'}
              </h3>
            </div>
            <div className="p-6">
              <DataTable
                data={activeTab === 'gold'
                  ? (balanceData.receipts?.filter(r => r.weightReceived > 0) || [])
                  : (balanceData.receipts?.filter(r => r.stones && r.stones.length > 0) || [])}
                columns={activeTab === 'gold' ? goldReceiptColumns : stoneReceiptColumns}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialTransactions;
