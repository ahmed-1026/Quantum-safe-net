import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, AlertCircle, CheckCircle, X, WifiOff } from 'lucide-react';
import { login } from '../../apiService';
import Alert from '../../components/Shared/alert'

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, title, message, duration = 5000) => {
    setAlert({ type, title, message });
    if (duration > 0) {
      setTimeout(() => setAlert(null), duration);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Call the login API
      const response = await login({email, password});
      console.log("response", response)
      // Assuming the API response contains a token
      if (response?.data?.access_token) {
        // Store token in localStorage or context for future requests
        localStorage.setItem('authToken', response?.data?.access_token);
        localStorage.setItem('userRole', response?.data?.role);
        console.log("userRole", response?.data?.role);

        // Add this success alert
        showAlert('success', 'Login Successful', 'Welcome! Redirecting to dashboard...', 2000);

        // Navigate to the dashboard
        onLogin(response?.data?.role);
        navigate('/dashboard');
      } else {
        // Handle unexpected API response
        const message = response?.response?.data?.detail;
        showAlert('error', 'Login Failed', message);
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      // Handle API errors
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4">
      {/* Logo and title above the card */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg mx-auto mb-3"></div>
        <h1 className="text-2xl font-bold">
          <span className="text-pink-600">QuantumSafeNet</span>
          <span className="text-gray-800"> Admin</span>
        </h1>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-6">Sign in to your account to continue</p>

        {alert && (
          <Alert 
            type={alert.type} 
            title={alert.title} 
            message={alert.message}
            setAlert = {setAlert}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              EMAIL
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              PASSWORD
            </label>
            <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                required
                style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
                {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
                ) : (
                <EyeIcon className="w-5 h-5" />
                )}
            </button>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              REMEMBER ME
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            {loading ? 'SIGNING IN...' : 'LOGIN'}
          </button>
        </form>

        <p className="text-center mt-4">
          <Link href="#" className="text-gray-500 hover:text-red-500 text-sm">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;