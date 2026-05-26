import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PackagePlus, Scale, History, Plus, Briefcase, FileText, X } from 'lucide-react';

const InventoryDashboard = () => {
  const [balanceData, setBalanceData] = useState({ balance: 0, totalReceived: 0, totalAllocatedToTasks: 0, receipts: [], stoneInventory: {}, sectionAllocations: {} });
  const [loading, setLoading] = useState(true);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [formData, setFormData] = useState({ weightReceived: '', notes: '', stones: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStone = () => setFormData({ ...formData, stones: [...formData.stones, { type: '', quantity: 1 }] });
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
  }, []);

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

  const handleReceiveMaterial = async (e) => {
    e.preventDefault();
    if ((!formData.weightReceived || Number(formData.weightReceived) <= 0) && formData.stones.length === 0) {
      toast.error('Please enter a valid weight or add at least one stone');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/inventory', formData);
      toast.success('Material received successfully');
      setFormData({ weightReceived: '', notes: '', stones: [] });
      fetchInventory();
    } catch (error) {
      toast.error('Failed to add material receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
          <p className="text-slate-500 mt-1">Manage incoming material from Stellar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-wider">Available Balance</h3>
            <p className="text-4xl font-bold">{balanceData.balance.toFixed(2)}<span className="text-xl text-blue-200">g</span></p>
          </div>
          <Scale className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-1.5"><PackagePlus size={16} /> Total Received</h3>
            <p className="text-3xl font-bold text-slate-800">{balanceData.totalReceived.toFixed(2)}<span className="text-lg text-slate-400 font-medium">g</span></p>
            <p className="text-xs text-slate-400 mt-2">From Stellar Parent Company</p>
          </div>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
          onClick={() => setIsSectionModalOpen(true)}
        >
          <div className="relative z-10">
            <h3 className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={16} /> Allocated to Tasks</h3>
            <p className="text-3xl font-bold text-slate-800">{balanceData.totalAllocatedToTasks.toFixed(2)}<span className="text-lg text-slate-400 font-medium">g</span></p>
            <p className="text-xs text-blue-500 mt-2 font-medium">Click to view section breakdown →</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-slate-500 font-medium text-sm mb-2 uppercase tracking-wider flex items-center gap-1.5">💎 Stone Inventory</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {Object.keys(balanceData.stoneInventory).length > 0 ? (
                Object.entries(balanceData.stoneInventory).map(([type, qty]) => (
                  <div key={type} className="flex justify-between items-center text-sm border-b border-slate-100 pb-1">
                    <span className="font-semibold text-slate-700 capitalize">{type}</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{qty} nos</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic mt-2">No stones in inventory</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white/80 p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <PackagePlus className="text-blue-500" /> Receive Material
            </h3>
            <form onSubmit={handleReceiveMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Weight Received (g)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weightReceived}
                  onChange={(e) => setFormData({ ...formData, weightReceived: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-slate-50"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Stones (Optional)</label>
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
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="">-- Type --</option>
                        <option value="diamond">Diamond</option>
                        <option value="ruby">Ruby</option>
                        <option value="emerald">Emerald</option>
                        <option value="sapphire">Sapphire</option>
                        <option value="pearl">Pearl</option>
                        <option value="opal">Opal</option>
                        <option value="amethyst">Amethyst</option>
                        <option value="topaz">Topaz</option>
                        <option value="garnet">Garnet</option>
                      </select>
                      <input
                        type="number"
                        required
                        min="1"
                        value={stone.quantity}
                        onChange={(e) => handleStoneChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-20 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button type="button" onClick={() => handleRemoveStone(idx)} className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-100 rounded-lg">
                        <Plus size={16} className="rotate-45" />
                      </button>
                    </div>
                  ))}
                  {formData.stones.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">No stones added to this receipt.</p>
                  )}
                </div>
              </div>
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
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-blue-500/20"
              >
                {isSubmitting ? 'Processing...' : <><Plus size={18} /> Add to Inventory</>}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/80 rounded-2xl border border-slate-200 shadow-lg overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History className="text-blue-500" /> Material Receipt History
              </h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Received By</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stones</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Gold (g)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {balanceData.receipts.map(receipt => (
                    <tr key={receipt._id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {new Date(receipt.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {receipt.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {receipt.receivedBy?.firstName} {receipt.receivedBy?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {receipt.notes ? (
                          <div className="flex items-center gap-1.5" title={receipt.notes}>
                            <FileText size={14} className="text-slate-400" />
                            <span className="truncate max-w-[150px] inline-block">{receipt.notes}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {receipt.stones && receipt.stones.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {receipt.stones.map((st, i) => (
                              <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-medium capitalize">
                                {st.type}: {st.quantity}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 text-right">
                        {receipt.weightReceived > 0 ? `+${receipt.weightReceived}g` : '-'}
                      </td>
                    </tr>
                  ))}
                  {balanceData.receipts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        <History size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium text-slate-600">No receipts found</p>
                        <p className="text-xs mt-1">Material added will show up here</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
              {Object.keys(balanceData.sectionAllocations || {}).length > 0 ? (
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
    </div>
  );
};

export default InventoryDashboard;
