import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SidebarLayout from '../Shared/SidebarLayout';
import { Mail, Plus, UserPlus, Clock, CheckCircle, XCircle, ShieldAlert, Settings, Building2 } from 'lucide-react';
import DataTable from '../Shared/DataTable';
import { workspaceColumns } from './WorkspaceColumns';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [email, setEmail] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const { data } = await api.get('/workspaces');
      setWorkspaces(data.workspaces);
    } catch (error) {
      toast.error('Failed to load workspaces');
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/invites', { email, role: 'Admin', workspaceName });
      toast.success('Admin invited and workspace created successfully');
      setEmail('');
      setWorkspaceName('');
      setIsInviteModalOpen(false);
      fetchWorkspaces();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { label: 'Admin Management', icon: 'users', active: activeTab === 'users', onClick: () => setActiveTab('users') },
    { label: 'System Settings', icon: 'settings', active: activeTab === 'settings', onClick: () => setActiveTab('settings') },
  ];

  return (
    <SidebarLayout menuItems={menuItems}>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 p-6 rounded-2xl border border-slate-200 backdrop-blur-md shadow-xl">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Super Admin Portal</h2>
            <p className="text-slate-500 mt-1">Manage administrators and system-wide configurations</p>
          </div>
          <div className="flex items-center space-x-3 bg-purple-500/10 px-4 py-2.5 rounded-xl border border-purple-500/20">
            <ShieldAlert className="text-purple-400" size={20} />
            <span className="font-semibold text-purple-300 tracking-wide uppercase text-sm">Super Admin</span>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'users' && (
          <div className="space-y-6">

            {/* Workspaces List */}
            <div className="bg-white/80 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-xl overflow-hidden h-full flex flex-col">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white/70">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-slate-800">Registered Workspaces</h3>
                  <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                    <span className="text-xs font-medium text-slate-500">{workspaces.length} Total</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-slate-800 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none transition-all shadow-lg hover:shadow-purple-500/25"
                >
                  <Plus size={18} /> Create Workspace
                </button>
              </div>
              <div className="p-6">
                <DataTable 
                  data={workspaces || []} 
                  columns={workspaceColumns}
                />
              </div>
            </div>
          </div>
        )
        }

        {
          activeTab === 'settings' && (
            <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200 backdrop-blur-md">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <Settings className="text-purple-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">System Settings</h3>
              <p className="text-slate-500 text-center max-w-md">System configuration options are currently under development.</p>
            </div>
          )
        }
        {
          isInviteModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Create Workspace</h3>
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-6">Create a new workspace and invite its first system administrator.</p>
                  <form onSubmit={handleInvite} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@aurumos.com"
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-slate-50 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm shadow-inner"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Workspace Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Settings className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          placeholder="Acme Corp"
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-slate-50 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm shadow-inner"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsInviteModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !email || !workspaceName}
                        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-slate-800 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/25"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span>
                        ) : (
                          <span className="flex items-center gap-2"><Plus size={18} /> Create Workspace</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </SidebarLayout >
  );
};

export default SuperAdminDashboard;
