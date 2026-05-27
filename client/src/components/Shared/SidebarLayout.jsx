import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Users, CheckSquare, Menu, X, ChevronRight, User, LayoutDashboard, Layers, Building, Package, Gem, Truck } from 'lucide-react';

const SidebarLayout = ({ children, menuItems = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'dashboard': return <LayoutDashboard size={20} />;
      case 'users': return <Users size={20} />;
      case 'tasks': return <CheckSquare size={20} />;
      case 'profile': return <User size={20} />;
      case 'layers': return <Layers size={20} />;
      case 'building': return <Building size={20} />;
      case 'product': return <Package size={20} />;
      case 'gem': return <Gem size={20} />;
      case 'truck': return <Truck size={20} />;
      default: return <ChevronRight size={20} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white/90 backdrop-blur-xl border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AurumOS</h1>
          <button className="lg:hidden text-slate-500 hover:text-slate-900" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-6 px-2">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const isActive = item.active || location.pathname === item.path;
                return (
                  <li key={index}>
                    <button
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        else if (item.path) navigate(item.path);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                          ? 'bg-blue-300/20 text-blue-400 border border-blue-500/20 shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                    >
                      <div className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-600'} transition-colors`}>
                        {getIcon(item.icon)}
                      </div>
                      <span className="font-medium">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center p-3 bg-white rounded-xl mb-3 border border-slate-200 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-slate-800 font-bold text-lg shadow-lg overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.firstName} {user?.lastName} {user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/20"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Top Header Mobile */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white/90 backdrop-blur-md border-b border-slate-200 z-30 sticky top-0">
          <button className="text-slate-600 hover:text-slate-900" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AurumOS</h1>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Dynamic Background Effects */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none opacity-50" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300/20 blur-[100px] pointer-events-none" />

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 z-10 relative scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
