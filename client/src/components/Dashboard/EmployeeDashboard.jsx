import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SidebarLayout from '../Shared/SidebarLayout';
import ProfileForm from '../Shared/ProfileForm';
import { CheckSquare, Briefcase, Clock, Calendar, User } from 'lucide-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmployeeTasks from './EmployeeTasks';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/employee' },
    { label: 'My Tasks', icon: 'tasks', path: '/employee/tasks' },
    { label: 'My Profile', icon: 'profile', path: '/employee/profile' },
  ];

  return (
    <SidebarLayout menuItems={menuItems}>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 p-6 rounded-2xl border border-slate-200 backdrop-blur-md shadow-xl">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome, {user?.firstName || user?.name}!</h2>
            <p className="text-slate-500 mt-1">Here is a quick overview of your workspace today.</p>
          </div>
          <div className="flex items-center space-x-3 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
            <Briefcase className="text-emerald-400" size={20} />
            <span className="font-semibold text-emerald-300 tracking-wide uppercase text-sm">Employee</span>
          </div>
        </div>

        {/* Content Area */}


        <Routes>
          <Route path="/" element={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</h3>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <CheckSquare className="text-blue-400" size={20} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-800">0</p>
                <p className="text-sm text-slate-500 mt-2">All caught up for today!</p>
              </div>
              
              <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Hours Logged</h3>
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Clock className="text-amber-400" size={20} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-800">0h</p>
                <p className="text-sm text-slate-500 mt-2">This week</p>
              </div>

              <div className="bg-white/80 rounded-2xl p-6 border border-slate-200 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Upcoming Deadlines</h3>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Calendar className="text-purple-400" size={20} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-800">0</p>
                <p className="text-sm text-slate-500 mt-2">In the next 7 days</p>
              </div>
            </div>
          } />

          <Route path="tasks" element={<EmployeeTasks />} />

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
          
          <Route path="*" element={<Navigate to="/employee" replace />} />
        </Routes>
      </div>
    </SidebarLayout>
  );
};

export default EmployeeDashboard;
