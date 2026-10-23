import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import StatsCards from '../../components/admin/StatsCards.jsx';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  ShieldAlert,
  Users,
  Store,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Shield,
} from 'lucide-react';

const AdminDashboard = () => {
  const { language, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading statewide PDS administrative analytics..." />;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center text-red-600 space-y-3 bg-white rounded-3xl border border-red-200 shadow-sm mt-8">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <p className="font-black text-base">Access Denied or System Error</p>
        <p className="text-xs text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP ADMIN PERSONA BANNER */}
      <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-900 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-700 to-purple-800 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-white/20 flex-shrink-0">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                  Civil Supplies Administration
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold border border-white/10">
                  Statewide Oversight
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Smart PDS Governance & Telemetry Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Real-time queue throughput, commodity disbursements, inventory balances, and shop governance
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/users"
              className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold backdrop-blur transition flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-blue-300" />
              <span>Manage Users</span>
            </Link>
            <Link
              to="/admin/shops"
              className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold backdrop-blur transition flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>Manage Shops</span>
            </Link>
            <Link
              to="/admin/reports"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Audit Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI METRIC CARDS */}
      <StatsCards metrics={data.metrics} />

      {/* 3. LOW STOCK ALERTS */}
      {data.lowStockAlerts && data.lowStockAlerts.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-3xl p-6 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2.5 text-amber-950 font-black text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Statewide Fair Price Shop Inventory Alerts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {data.lowStockAlerts.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-2xl border border-amber-200/90 text-xs flex justify-between items-center shadow-2xs"
              >
                <div>
                  <span className="font-black text-slate-900 block">{item.shopId?.shopName}</span>
                  <p className="text-[11px] text-slate-500 font-mono">{item.shopId?.fpsCode}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-rose-600 text-sm block">
                    {item.availableQuantity} {item.unit}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{item.commodity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RECHARTS ANALYTICS */}
      <AnalyticsCharts charts={data.charts} />
    </div>
  );
};

export default AdminDashboard;