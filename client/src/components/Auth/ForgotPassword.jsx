import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Check Your Email</h2>
          <p className="mb-6 text-gray-600">
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <Link to="/login" className="text-blue-600 hover:underline">Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-800">Forgot Password</h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
