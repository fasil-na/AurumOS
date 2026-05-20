import React from 'react';
import Navbar from '../Shared/Navbar';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Employee Dashboard</h2>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium">Welcome, {user?.name}!</h3>
          <p className="text-gray-600">
            You are logged in as an Employee. You do not have permissions to invite other users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
