import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, CreditCard, Save, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileForm = () => {
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    aadharNumber: '',
    panNumber: '',
    address: '',
    profilePic: null,
    profilePicPreview: ''
  });

  const isVerifiedEmployee = authUser?.role === 'Employee' && authUser?.isVerified;

  const calculateCompletion = () => {
    const fields = ['firstName', 'lastName', 'mobileNumber', 'aadharNumber', 'panNumber', 'address', 'profilePicPreview'];
    let filled = 0;
    fields.forEach(field => {
      if (formData[field]) filled++;
    });
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/me');
        const user = data.user;
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          mobileNumber: user.mobileNumber || '',
          aadharNumber: user.aadharNumber || '',
          panNumber: user.panNumber || '',
          address: user.address || '',
          profilePic: null,
          profilePicPreview: user.profilePic || ''
        });
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'profilePic') {
      const file = e.target.files[0];
      if (file) {
        setFormData({ 
          ...formData, 
          profilePic: file,
          profilePicPreview: URL.createObjectURL(file)
        });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'profilePicPreview' && formData[key] !== null) {
          dataToSubmit.append(key, formData[key]);
        }
      });

      const { data } = await api.put('/auth/profile', dataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-xl overflow-hidden p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-slate-700/50">
        <div className="relative group cursor-pointer">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden">
            {formData.profilePicPreview ? (
              <img src={formData.profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (formData.firstName?.charAt(0) || authUser?.name?.charAt(0) || 'U').toUpperCase()
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-xs text-white font-medium">{isVerifiedEmployee ? 'Locked' : 'Change'}</span>
            {!isVerifiedEmployee && (
              <input 
                type="file" 
                name="profilePic" 
                onChange={handleChange} 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-3">
            <h3 className="text-2xl font-bold text-white">{formData.firstName} {formData.lastName}</h3>
            {isVerifiedEmployee && (
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <ShieldCheck size={14} />
                <span>Verified</span>
              </span>
            )}
          </div>
          <p className="text-slate-400 mb-2">{authUser?.role}</p>
          
          <div className="flex items-center space-x-3">
            <div className="w-48 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  completionPercentage === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-slate-300">{completionPercentage}% Complete</span>
          </div>
        </div>
      </div>

      {isVerifiedEmployee && (
        <div className="mb-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start space-x-3">
          <Lock className="text-blue-400 mt-0.5 shrink-0" size={18} />
          <p className="text-sm text-blue-200 leading-relaxed">
            Your profile has been verified by an Administrator and is now locked. If you need to make changes to your personal information, please contact HR or an Admin.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isVerifiedEmployee}
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isVerifiedEmployee}
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-600" />
              </div>
              <input
                type="email"
                value={formData.email}
                disabled
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-slate-500 sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isVerifiedEmployee}
              />
            </div>
          </div>

          {/* Aadhar Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Aadhar Number</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                placeholder="0000 0000 0000"
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isVerifiedEmployee}
              />
            </div>
          </div>

          {/* PAN Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">PAN Number</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isVerifiedEmployee}
              />
            </div>
          </div>



          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Address</label>
            <div className="relative group">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                placeholder="123 Main St, City, State, ZIP"
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isVerifiedEmployee}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          {!isVerifiedEmployee && (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>Save Profile</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
