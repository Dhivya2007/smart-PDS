import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Lock, Mail, LogIn, AlertCircle, Sparkles, User, Store, Shield, Check } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('BENEFICIARY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(email, password);
      if (data && data.user) {
        if (data.user.role === 'BENEFICIARY') {
          navigate('/beneficiary/dashboard');
        } else if (data.user.role === 'SHOP_OWNER') {
          navigate('/shop/dashboard');
        } else if (data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demonstration
  const handleQuickFill = (roleKey, demoEmail, demoPass) => {
    setSelectedRole(roleKey);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center text-2xl shadow-md border-2 border-white ring-2 ring-blue-100 mb-3.5">
            🌾
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('login')} to Smart PDS
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Choose your user persona to sign in to your operations workspace
          </p>
        </div>

        {/* Demo Fast-Login Persona Selector */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Demo Persona:</span>
            </span>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
              One-Click Fill
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                handleQuickFill('BENEFICIARY', 'karthik.pds@gmail.com', 'Citizen@123')
              }
              className={`p-2.5 rounded-2xl text-left transition-all border flex flex-col items-center justify-center text-center ${
                selectedRole === 'BENEFICIARY'
                  ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-black">Citizen</span>
              <span className="text-[9px] text-slate-400">Beneficiary</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickFill('SHOP_OWNER', 'owner.anna@smartpds.gov.in', 'Shop@123')
              }
              className={`p-2.5 rounded-2xl text-left transition-all border flex flex-col items-center justify-center text-center ${
                selectedRole === 'SHOP_OWNER'
                  ? 'bg-emerald-50/80 border-emerald-400 text-emerald-900 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-xs font-black">FPS Owner</span>
              <span className="text-[9px] text-slate-400">Shop Operator</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN', 'admin@smartpds.gov.in', 'Admin@123')}
              className={`p-2.5 rounded-2xl text-left transition-all border flex flex-col items-center justify-center text-center ${
                selectedRole === 'ADMIN'
                  ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-black">Admin</span>
              <span className="text-[9px] text-slate-400">State Civil</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartpds.gov.in or citizen email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gov-navy hover:bg-blue-900 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t('login')}</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-700 font-extrabold hover:underline">
              Register as Citizen or Shop Owner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;