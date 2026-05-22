import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SidebarLayout from '../Shared/SidebarLayout';
import ProfileForm from '../Shared/ProfileForm';
import { Mail, Plus, UserPlus, Clock, CheckCircle, XCircle, Shield, User, CheckSquare, Layers, Trash2 } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProductManagement from './ProductManagement';

const AdminDashboard = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [invitations, setInvitations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeListTab, setActiveListTab] = useState('employees');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [isEditingEmployeeSections, setIsEditingEmployeeSections] = useState(false);
  const [editingEmployeeSections, setEditingEmployeeSections] = useState([]);
  const [isSavingSections, setIsSavingSections] = useState(false);

  const handleUpdateEmployeeSections = async () => {
    if (!selectedEmployee) return;
    setIsSavingSections(true);
    try {
      await api.put(`/users/employees/${selectedEmployee._id}/sections`, { sections: editingEmployeeSections });
      toast.success('Employee sections updated');
      fetchEmployees();
      setIsEditingEmployeeSections(false);
      setSelectedEmployee({
        ...selectedEmployee,
        sections: sections.filter(s => editingEmployeeSections.includes(s._id))
      });
    } catch (error) {
      toast.error('Failed to update sections');
    } finally {
      setIsSavingSections(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data } = await api.get('/invites');
      setInvitations(data.invitations);
    } catch (error) {
      toast.error('Failed to load invitations');
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/users/employees');
      setEmployees(data.employees);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const fetchSections = async () => {
    try {
      const { data } = await api.get('/sections');
      setSections(data.sections);
    } catch (error) {
      toast.error('Failed to load sections');
    }
  };

  useEffect(() => {
    fetchInvitations();
    fetchEmployees();
    fetchSections();
  }, []);

  const handleVerify = async (id) => {
    try {
      await api.put(`/users/employees/${id}/verify`);
      toast.success('Employee profile verified');
      fetchEmployees();
      setSelectedEmployee(null);
    } catch (error) {
      toast.error('Failed to verify employee');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/invites', { email, role, sections: selectedSections });
      toast.success(`${role} invited successfully`);
      setEmail('');
      setRole('Employee');
      setSelectedSections([]);
      setIsInviteModalOpen(false);
      fetchInvitations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await api.delete(`/invites/${id}`);
      toast.success('Invitation revoked');
      fetchInvitations();
    } catch (error) {
      toast.error('Failed to revoke invitation');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionName) return;
    try {
      await api.post('/sections', { name: newSectionName });
      toast.success('Section created');
      setNewSectionName('');
      setIsSectionModalOpen(false);
      fetchSections();
    } catch (error) {
      toast.error('Failed to create section');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await api.delete(`/sections/${id}`);
      toast.success('Section deleted');
      fetchSections();
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { label: 'Users & Roles', icon: 'users', path: '/admin/users' },
    { label: 'Sections', icon: 'layers', path: '/admin/sections' },
    { label: 'Task Management', icon: 'tasks', path: '/admin/tasks' },
    { label: 'Workspace Profile', icon: 'building', path: '/admin/workspace' },
    { label: 'My Profile', icon: 'profile', path: '/admin/profile' },
    { label: 'Products', icon: 'product', path: '/admin/products' },
  ];

  return (
    <SidebarLayout menuItems={menuItems}>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 p-6 rounded-2xl border border-slate-200 backdrop-blur-md shadow-xl">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Portal</h2>
            <p className="text-slate-500 mt-1">Manage your workforce and monitor tasks</p>
          </div>
          <div className="flex items-center space-x-3 bg-blue-500/10 px-4 py-2.5 rounded-xl border border-blue-500/20">
            <Shield className="text-blue-400" size={20} />
            <span className="font-semibold text-blue-300 tracking-wide uppercase text-sm">Administrator</span>
          </div>
        </div>

        {/* Content Area */}
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200 backdrop-blur-md">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Admin Dashboard</h3>
              <p className="text-slate-500 text-center max-w-md">Select an option from the menu to get started.</p>
            </div>
          } />

          <Route path="products" element={<ProductManagement />} />

          <Route path="users" element={
            <div className="space-y-6">
              {/* Tab Switcher */}
              <div className="flex justify-center">
                <div className="bg-white/80 p-1.5 rounded-xl border border-slate-200 backdrop-blur-md inline-flex shadow-lg">
                  <button
                    onClick={() => setActiveListTab('employees')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeListTab === 'employees' ? 'bg-blue-600 text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                  >
                    Employees Directory
                  </button>
                  <button
                    onClick={() => setActiveListTab('invitations')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeListTab === 'invitations' ? 'bg-blue-600 text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                  >
                    Recent Invitations
                  </button>
                </div>
              </div>

              {/* Invitations List */}
              {activeListTab === 'invitations' && (
                <div className="bg-white/80 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-xl overflow-hidden h-full flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white/70">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-slate-800">Recent Invitations</h3>
                      <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                        <span className="text-xs font-medium text-slate-500">{invitations.length} Total</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                      <Plus size={18} /> Invite User
                    </button>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700/50">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent Date</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {invitations.map((inv) => (
                          <tr key={inv._id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm mr-3">
                                  {inv.email.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-700">{inv.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                inv.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                {inv.status === 'accepted' && <CheckCircle size={12} className="mr-1.5" />}
                                {inv.status === 'pending' && <Clock size={12} className="mr-1.5" />}
                                {inv.status === 'revoked' && <XCircle size={12} className="mr-1.5" />}
                                <span className="capitalize">{inv.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {new Date(inv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {inv.status === 'pending' ? (
                                <button
                                  onClick={() => handleRevoke(inv._id)}
                                  className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  Revoke
                                </button>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {invitations.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-500">
                                <Mail size={40} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">No invitations found</p>
                                <p className="text-xs mt-1">Start by inviting an employee using the form.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Employees List */}
              {activeListTab === 'employees' && (
                <div className="bg-white/80 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white/70">
                    <h3 className="text-lg font-semibold text-slate-800">Employees Directory</h3>
                    <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                      <span className="text-xs font-medium text-slate-500">{employees.length} Total</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700/50">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Status</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {employees.map((emp) => {
                          const fields = ['firstName', 'lastName', 'mobileNumber', 'aadharNumber', 'panNumber', 'address', 'profilePic'];
                          let filled = 0;
                          fields.forEach(field => { if (emp[field]) filled++; });
                          const completion = Math.round((filled / fields.length) * 100);

                          return (
                            <tr key={emp._id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm mr-3 overflow-hidden">
                                    {emp.profilePic ? <img src={emp.profilePic} alt="" className="w-full h-full object-cover" /> : emp.firstName?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <span className="block text-sm font-medium text-slate-700">{emp.firstName} {emp.lastName}</span>
                                    <span className="block text-xs text-slate-500">{emp.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {emp.mobileNumber || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${completion === 100 ? 'bg-emerald-400' : 'bg-blue-400'}`}
                                      style={{ width: `${completion}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-slate-500">{completion}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => setSelectedEmployee(emp)}
                                  className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors opacity-100 focus:opacity-100"
                                >
                                  View Profile
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {employees.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                              <p className="text-sm font-medium">No employees found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          } />

          <Route path="sections" element={
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/80 p-6 rounded-2xl border border-slate-200 backdrop-blur-md shadow-xl">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">Sections Management</h3>
                  <p className="text-slate-500 text-sm">Create and manage departments for this workspace.</p>
                </div>
                <button
                  onClick={() => setIsSectionModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-slate-800 bg-blue-600 hover:bg-blue-500 transition-all shadow-lg"
                >
                  <Plus size={18} /> Add Section
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map(section => (
                  <div key={section._id} className="bg-white/80 p-6 rounded-2xl border border-slate-200 flex justify-between items-center group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <Layers className="text-indigo-400" size={20} />
                      </div>
                      <span className="text-lg font-medium text-slate-700">{section.name}</span>
                    </div>
                    <button onClick={() => handleDeleteSection(section._id)} className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-100 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {sections.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white/60 rounded-2xl border border-slate-200">
                    <Layers className="mx-auto text-slate-600 mb-3" size={32} />
                    <p className="text-slate-500 font-medium">No sections found</p>
                    <p className="text-sm text-slate-500 mt-1">Create your first section to get started.</p>
                  </div>
                )}
              </div>
            </div>
          } />

          <Route path="tasks" element={
            <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200 backdrop-blur-md">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckSquare className="text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Task Management</h3>
              <p className="text-slate-500 text-center max-w-md">The tasks module is currently under construction. Check back soon for updates!</p>
            </div>
          } />

          <Route path="workspace" element={
            <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200 backdrop-blur-md">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Workspace Profile</h3>
              <p className="text-slate-500 text-center max-w-md">Workspace profile and settings will be displayed here.</p>
            </div>
          } />

          <Route path="profile" element={
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Profile Settings</h3>
                  <p className="text-slate-500">Manage your personal information and preferences.</p>
                </div>
              </div>
              <ProfileForm />
            </div>
          } />

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>



        {/* Employee Details Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Employee Profile</h3>
                <button
                  onClick={() => { setSelectedEmployee(null); setIsEditingEmployeeSections(false); }}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-3xl overflow-hidden shadow-lg border border-slate-200">
                    {selectedEmployee.profilePic ? (
                      <img src={selectedEmployee.profilePic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedEmployee.firstName?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-1">{selectedEmployee.firstName} {selectedEmployee.lastName}</h4>
                    <p className="text-slate-500">{selectedEmployee.email}</p>
                    <div className="mt-2 flex space-x-2">
                      {selectedEmployee.isVerified ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} className="mr-1.5" /> Verified Profile
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock size={12} className="mr-1.5" /> Pending Verification
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mobile Number</p>
                    <p className="text-slate-700 font-medium">{selectedEmployee.mobileNumber || 'Not provided'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Aadhar Number</p>
                    <p className="text-slate-700 font-medium">{selectedEmployee.aadharNumber || 'Not provided'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">PAN Number</p>
                    <p className="text-slate-700 font-medium uppercase">{selectedEmployee.panNumber || 'Not provided'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Address</p>
                    <p className="text-slate-700 font-medium">{selectedEmployee.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="mb-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Assigned Sections</h4>
                    {!isEditingEmployeeSections ? (
                      <button onClick={() => {
                        setEditingEmployeeSections((selectedEmployee.sections || []).map(s => s._id || s));
                        setIsEditingEmployeeSections(true);
                      }} className="text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium">Edit Sections</button>
                    ) : (
                      <div className="flex space-x-2">
                        <button onClick={() => setIsEditingEmployeeSections(false)} className="text-sm text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium">Cancel</button>
                        <button onClick={handleUpdateEmployeeSections} disabled={isSavingSections} className="text-sm bg-blue-600 text-slate-800 px-3 py-1.5 rounded-lg hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors">
                          {isSavingSections ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingEmployeeSections ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.sections && selectedEmployee.sections.length > 0 ? (
                        selectedEmployee.sections.map(section => (
                          <span key={section._id || section} className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-300 text-sm rounded-lg border border-indigo-500/20 font-medium">
                            <Layers size={14} />
                            <span>{section.name || section}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500 italic">No sections assigned yet.</span>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {sections.map(section => (
                        <label key={section._id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${editingEmployeeSections.includes(section._id) ? 'bg-blue-600/20 border-blue-500' : 'bg-white/90 border-slate-200 hover:border-slate-500'}`}>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={editingEmployeeSections.includes(section._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditingEmployeeSections([...editingEmployeeSections, section._id]);
                              } else {
                                setEditingEmployeeSections(editingEmployeeSections.filter(id => id !== section._id));
                              }
                            }}
                          />
                          <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${editingEmployeeSections.includes(section._id) ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                            {editingEmployeeSections.includes(section._id) && <CheckSquare size={12} className="text-slate-800" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{section.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end space-x-4">
                <button
                  onClick={() => { setSelectedEmployee(null); setIsEditingEmployeeSections(false); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>

                {!selectedEmployee.isVerified && (() => {
                  const fields = ['firstName', 'lastName', 'mobileNumber', 'aadharNumber', 'panNumber', 'address', 'profilePic'];
                  let filled = 0;
                  fields.forEach(field => { if (selectedEmployee[field]) filled++; });
                  const completion = Math.round((filled / fields.length) * 100);

                  return (
                    <button
                      onClick={() => handleVerify(selectedEmployee._id)}
                      disabled={completion < 100}
                      className="flex items-center space-x-2 px-6 py-2 border border-transparent text-sm font-bold rounded-xl text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                      <CheckCircle size={16} />
                      <span>{completion < 100 ? `Incomplete (${completion}%)` : 'Verify Profile'}</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Invite User</h3>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 mb-6">Send an onboarding invitation to a new team member.</p>
                <form onSubmit={handleInvite} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Shield className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                      <div
                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl leading-5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm shadow-inner cursor-pointer select-none relative"
                      >
                        {role}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>

                      {isRoleDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsRoleDropdownOpen(false)}
                          ></div>
                          <div className="absolute z-20 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                            <div
                              onClick={() => { setRole('Employee'); setIsRoleDropdownOpen(false); }}
                              className="px-4 py-3 hover:bg-slate-100 cursor-pointer transition-colors flex items-center space-x-3 border-b border-slate-200 text-slate-700"
                            >
                              <User className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium">Employee</span>
                            </div>
                            <div
                              onClick={() => { setRole('Admin'); setIsRoleDropdownOpen(false); }}
                              className="px-4 py-3 hover:bg-slate-100 cursor-pointer transition-colors flex items-center space-x-3 text-slate-700"
                            >
                              <Shield className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium">Admin</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="employee@company.com"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-slate-50 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm shadow-inner"
                        required
                      />
                    </div>
                  </div>
                  {role === 'Employee' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign to Sections</label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {sections.map(section => (
                          <label key={section._id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedSections.includes(section._id) ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-50 border-slate-300 hover:border-slate-500'}`}>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={selectedSections.includes(section._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSections([...selectedSections, section._id]);
                                } else {
                                  setSelectedSections(selectedSections.filter(id => id !== section._id));
                                }
                              }}
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${selectedSections.includes(section._id) ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}`}>
                              {selectedSections.includes(section._id) && <CheckSquare size={12} className="text-slate-800" />}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{section.name}</span>
                          </label>
                        ))}
                        {sections.length === 0 && (
                          <div className="col-span-2 text-sm text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                            No sections available. Please create a section first.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                      disabled={loading || !email}
                      className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span>
                      ) : (
                        <span className="flex items-center gap-2"><Plus size={18} /> Send Invitation</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Section Modal */}
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Add New Section</h3>
                <button
                  onClick={() => setIsSectionModalOpen(false)}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateSection} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Section Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Layers className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="e.g. Design, Casting, Finishing"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-slate-50 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm shadow-inner"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsSectionModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newSectionName}
                      className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                      <Plus size={18} className="mr-2" /> Create Section
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
