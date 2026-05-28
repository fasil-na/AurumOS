import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PackagePlus, Scale, History, Plus, Briefcase, FileText, X } from 'lucide-react';
import DataTable from '../Shared/DataTable';
import { goldReceiptColumns, stoneReceiptColumns } from './InventoryColumns';

const InventoryDashboard = () => {
  const [balanceData, setBalanceData] = useState({ balance: 0, totalReceived: 0, totalAllocatedToTasks: 0, receipts: [], stoneInventory: {}, sectionAllocations: {}, goldByPurity: {}, stoneInventoryByCarats: {}, totalFineGold: 0, totalSystemFineGold: 0, totalExternalDebt: 0, totalInternalEquity: 0 });
  const [loading, setLoading] = useState(true);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isGoldModalOpen, setIsGoldModalOpen] = useState(false);
  const [isStoneModalOpen, setIsStoneModalOpen] = useState(false);
  const [goldSearch, setGoldSearch] = useState('');
  const [stoneSearch, setStoneSearch] = useState('');
  const [activeTab, setActiveTab] = useState('gold');
  const [formData, setFormData] = useState({ weightReceived: '', purity: '', notes: '', stones: [], transactionType: 'Receive', source: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const handleAddStone = () => setFormData({ ...formData, stones: [...formData.stones, { type: '', carats: '', quantity: 1 }] });
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
        <p className="text-slate-500 font-medium">Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 p-6 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="text-blue-500" /> Material Inventory
          </h2>
          <p className="text-slate-500 mt-1">Manage incoming material from suppliers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-center h-full">
            <h3 className="text-orange-100 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <Scale size={16} /> Total Store Gold
            </h3>
            <p className="text-4xl font-bold">
              {(balanceData.totalSystemFineGold || 0).toFixed(2)}<span className="text-xl text-orange-200">g</span>
            </p>
            <p className="text-xs text-orange-200 font-semibold mt-2">
              Fine Gold (100%) • In Labor & Stock
            </p>
            <div className="mt-4 pt-3 border-t border-orange-400/30 flex justify-between items-center gap-2">
              <div>
                <p className="text-[10px] text-orange-200 font-semibold uppercase tracking-wider mb-1">Owed to Suppliers</p>
                <p className="text-lg font-bold">{(balanceData.totalExternalDebt || 0).toFixed(2)}<span className="text-xs text-orange-200 ml-1">g</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-yellow-200 font-semibold uppercase tracking-wider mb-1">Our Equity</p>
                <p className="text-lg font-bold text-yellow-300">{(balanceData.totalInternalEquity || 0).toFixed(2)}<span className="text-xs text-yellow-200 ml-1">g</span></p>
              </div>
            </div>
          </div>
          <Scale className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-center h-full">
            <h3 className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <PackagePlus size={16} /> Raw Material Balance
            </h3>
            <p className="text-4xl font-bold">
              {balanceData.balance?.toFixed(2) || '0.00'}<span className="text-xl text-blue-200">g</span>
            </p>
            <p className="text-xs text-blue-200 font-semibold mt-2">
              Available Dead Stock (Mixed Purity)
            </p>
            {balanceData.totalFineGold > 0 && (
              <div className="mt-4 pt-3 border-t border-blue-500/30">
                <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider mb-1">Fine Gold Equivalent</p>
                <p className="text-lg font-bold">{balanceData.totalFineGold.toFixed(2)}<span className="text-xs text-blue-200 ml-1">g</span></p>
              </div>
            )}
          </div>
          <PackagePlus className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-slate-500 font-medium text-sm mb-2 uppercase tracking-wider flex items-center gap-1.5">✨ Gold Inventory</h3>
            <div className="flex-1 pr-2 space-y-2">
              {balanceData.goldByPurity && Object.keys(balanceData.goldByPurity).length > 0 ? (
                <>
                  {Object.entries(balanceData.goldByPurity).slice(0, 3).map(([purity, weight]) => (
                    <div key={purity} className="flex justify-between items-center text-sm border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-700">{purity === 'Unknown' ? 'Unknown Purity' : `${purity} Purity`}</span>
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">{weight.toFixed(2)}g</span>
                    </div>
                  ))}
                  {Object.keys(balanceData.goldByPurity).length > 3 && (
                    <button onClick={() => setIsGoldModalOpen(true)} className="w-full text-xs text-blue-500 font-bold hover:text-blue-700 mt-2 py-1.5 bg-blue-50 rounded-lg transition-colors">
                      View All {Object.keys(balanceData.goldByPurity).length} Types
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 italic mt-2">No gold in inventory</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-slate-500 font-medium text-sm mb-2 uppercase tracking-wider flex items-center gap-1.5">💎 Stone Inventory</h3>
            <div className="flex-1 pr-2 space-y-2">
              {balanceData.stoneInventoryByCarats && Object.keys(balanceData.stoneInventoryByCarats).length > 0 ? (
                <>
                  {Object.values(balanceData.stoneInventoryByCarats).slice(0, 3).map((st, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-700 capitalize">
                        {st.type} {st.carats && st.carats !== 'N/A' ? `in ${st.carats}ct` : ''}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{st.quantity} nos</span>
                    </div>
                  ))}
                  {Object.keys(balanceData.stoneInventoryByCarats).length > 3 && (
                    <button onClick={() => setIsStoneModalOpen(true)} className="w-full text-xs text-blue-500 font-bold hover:text-blue-700 mt-2 py-1.5 bg-blue-50 rounded-lg transition-colors">
                      View All {Object.keys(balanceData.stoneInventoryByCarats).length} Stones
                    </button>
                  )}
                </>
              ) : balanceData.stoneInventory && Object.keys(balanceData.stoneInventory).length > 0 ? (
                <>
                  {Object.entries(balanceData.stoneInventory).slice(0, 3).map(([type, qty]) => (
                    <div key={type} className="flex justify-between items-center text-sm border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-700 capitalize">{type}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{qty} nos</span>
                    </div>
                  ))}
                  {Object.keys(balanceData.stoneInventory).length > 3 && (
                    <button onClick={() => setIsStoneModalOpen(true)} className="w-full text-xs text-blue-500 font-bold hover:text-blue-700 mt-2 py-1.5 bg-blue-50 rounded-lg transition-colors">
                      View All {Object.keys(balanceData.stoneInventory).length} Stones
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 italic mt-2">No stones in inventory</p>
              )}
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
          onClick={() => setIsSectionModalOpen(true)}
        >
          <div className="relative z-10">
            <h3 className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={16} /> Allocated to Tasks</h3>
            <p className="text-3xl font-bold text-slate-800">{balanceData.totalAllocatedToTasks?.toFixed(2) || '0.00'}<span className="text-lg text-slate-400 font-medium">g</span></p>
            <p className="text-xs text-blue-500 mt-2 font-medium">Click to view section breakdown →</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white/80 p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <PackagePlus className="text-blue-500" /> Log Material Transaction
            </h3>

            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'gold' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('gold')}
              >
                Gold
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'stone' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('stone')}
              >
                Stone
              </button>
            </div>

            <form onSubmit={handleReceiveMaterial} className="space-y-4">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl mb-4">
                <label className={`flex-1 flex items-center justify-center py-2 text-sm font-bold rounded-lg cursor-pointer transition-all ${formData.transactionType === 'Receive' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <input
                    type="radio"
                    name="transactionType"
                    value="Receive"
                    checked={formData.transactionType === 'Receive'}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                    className="hidden"
                  />
                  ↓ Receive
                </label>
                <label className={`flex-1 flex items-center justify-center py-2 text-sm font-bold rounded-lg cursor-pointer transition-all ${formData.transactionType === 'Return' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <input
                    type="radio"
                    name="transactionType"
                    value="Return"
                    checked={formData.transactionType === 'Return'}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                    className="hidden"
                  />
                  ↑ Return
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Supplier</label>
                <select
                  required
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
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {formData.stones.map((stone, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          required
                          value={stone.type}
                          onChange={(e) => handleStoneChange(idx, 'type', e.target.value)}
                          className="flex-[2] px-2 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          <option value="">-- Type --</option>
                          {stoneTypes.map(st => (
                            <option key={st._id} value={st.name}>{st.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={stone.carats}
                          onChange={(e) => handleStoneChange(idx, 'carats', e.target.value)}
                          placeholder="Carats"
                          className="flex-1 min-w-0 px-2 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                          type="number"
                          required
                          min="1"
                          value={stone.quantity}
                          onChange={(e) => handleStoneChange(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-16 px-2 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button type="button" onClick={() => handleRemoveStone(idx)} className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-100 rounded-lg">
                          <Plus size={16} className="rotate-45" />
                        </button>
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
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSectionModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/90">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="text-blue-500" size={20} /> Current Section Allocation
              </h3>
              <button onClick={() => setIsSectionModalOpen(false)} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {balanceData.sectionAllocations && Object.keys(balanceData.sectionAllocations).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(balanceData.sectionAllocations).map(([section, weight]) => (
                    <div key={section} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <span className="font-bold text-slate-700 capitalize">{section}</span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold">{Number(weight).toFixed(2)}g</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No material currently active in sections.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isGoldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsGoldModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/90">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                ✨ All Gold Inventory
              </h3>
              <button onClick={() => setIsGoldModalOpen(false)} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
              <input
                type="text"
                placeholder="Search by purity..."
                value={goldSearch}
                onChange={(e) => setGoldSearch(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-2">
              {balanceData.goldByPurity && Object.entries(balanceData.goldByPurity)
                .filter(([purity]) => purity.toLowerCase().includes(goldSearch.toLowerCase()))
                .map(([purity, weight]) => (
                  <div key={purity} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <span className="font-bold text-slate-700">{purity === 'Unknown' ? 'Unknown Purity' : `${purity} Purity`}</span>
                    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg font-bold">{weight.toFixed(2)}g</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {isStoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsStoneModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/90">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                💎 All Stone Inventory
              </h3>
              <button onClick={() => setIsStoneModalOpen(false)} className="text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
              <input
                type="text"
                placeholder="Search by stone type or carats..."
                value={stoneSearch}
                onChange={(e) => setStoneSearch(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-2">
              {balanceData.stoneInventoryByCarats && Object.keys(balanceData.stoneInventoryByCarats).length > 0 ? (
                Object.values(balanceData.stoneInventoryByCarats)
                  .filter(st => `${st.type} ${st.carats}`.toLowerCase().includes(stoneSearch.toLowerCase()))
                  .map((st, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <span className="font-bold text-slate-700 capitalize">
                        {st.type} {st.carats && st.carats !== 'N/A' ? `in ${st.carats}ct` : ''}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">{st.quantity} nos</span>
                    </div>
                  ))
              ) : balanceData.stoneInventory && Object.entries(balanceData.stoneInventory)
                .filter(([type]) => type.toLowerCase().includes(stoneSearch.toLowerCase()))
                .map(([type, qty], idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <span className="font-bold text-slate-700 capitalize">{type}</span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">{qty} nos</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
