import React, { useState, useEffect } from 'react';
import Navbar from '../Shared/Navbar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [email, setEmail] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvitations = async () => {
    try {
      const { data } = await api.get('/invites');
      setInvitations(data.invitations);
    } catch (error) {
      toast.error('Failed to load invitations');
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/invites', { email, role: 'Admin' });
      toast.success('Admin invited successfully');
      setEmail('');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Super Admin Dashboard</h2>
        
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium">Invite New Admin</h3>
          <form onSubmit={handleInvite} className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email Address"
              className="flex-1 rounded-md border p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-medium">Invitation History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invitations.map((inv) => (
                  <tr key={inv._id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{inv.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{inv.role}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        inv.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        inv.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {inv.status === 'pending' && (
                        <button onClick={() => handleRevoke(inv._id)} className="text-red-600 hover:text-red-900">
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {invitations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No invitations found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
