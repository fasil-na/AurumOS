import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PackagePlus, Scale, Briefcase, FileText, X } from 'lucide-react';

const InventoryDashboard = () => {
  const [balanceData, setBalanceData] = useState({ balance: 0, totalReceived: 0, totalAllocatedToTasks: 0, receipts: [], stoneInventory: {}, sectionAllocations: {}, goldByPurity: {}, stoneInventoryByCarats: {}, totalFineGold: 0, totalSystemFineGold: 0, totalExternalDebt: 0, totalInternalEquity: 0 });
  const [loading, setLoading] = useState(true);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [overviewTab, setOverviewTab] = useState('gold');
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* NEW CURRENT STOCK OVERVIEW SECTION */}
      <div className="bg-white/80 rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/50 gap-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-500" /> Current Stock Overview
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${overviewTab === 'gold' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setOverviewTab('gold')}
            >
              ✨ Gold
            </button>
            <button
              type="button"
              className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all ${overviewTab === 'stone' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setOverviewTab('stone')}
            >
              💎 Stone
            </button>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          {overviewTab === 'gold' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Purity</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Available Weight (g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balanceData.goldByPurity && Object.entries(balanceData.goldByPurity).filter(([_, weight]) => weight > 0).length > 0 ? (
                  Object.entries(balanceData.goldByPurity)
                    .filter(([_, weight]) => weight > 0)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([purity, weight]) => (
                      <tr key={purity} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700">{purity === 'Unknown' ? 'Unknown Purity' : `${purity} Purity`}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg font-bold">{weight.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-6 py-8 text-center text-slate-400 italic">No gold stock available</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Shape</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dimensions</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Carats</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balanceData.detailedStoneInventory && Object.keys(balanceData.detailedStoneInventory).length > 0 ? (
                  Object.values(balanceData.detailedStoneInventory)
                    .filter(st => st.quantity > 0)
                    .sort((a, b) => a.type.localeCompare(b.type))
                    .map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700 capitalize">{st.type}</td>
                        <td className="px-6 py-4 text-slate-600">{st.shape}</td>
                        <td className="px-6 py-4 text-slate-600">{st.dimensions}</td>
                        <td className="px-6 py-4 text-slate-600">{st.carats && st.carats !== 'N/A' ? `${st.carats}ct` : '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold">{st.quantity}</span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No stone stock available</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
    </div>
  );
};

export default InventoryDashboard;
