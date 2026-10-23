import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import {
  Store,
  QrCode,
  Package,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';

const ShopDashboard = () => {
  const { user, shop } = useAuth();
  const { language, t } = useLanguage();
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopDashboard = async () => {
      try {
        setLoading(true);
        if (shop) {
          const sRes = await api.get(`/stock/${shop._id}`);
          if (sRes.data.success) {
            setStockData(sRes.data.stock);
          }
        }
      } catch (err) {
        console.error('Failed to load shop dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDashboard();
  }, [shop]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading Fair Price Shop operations console..." />;
  }

  const lowStockCount = stockData.filter((s) => s.isLowStock).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. SHOP OWNER PERSONA HERO BANNER */}
      <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-900 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            {/* Shop Owner Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-blue-700 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-white/20">
                <Store className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center"
                title="Licensed & Authorized Shop"
              >
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            {/* Persona Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                  Fair Price Shop Operator
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold border border-white/10">
                  {shop?.fpsCode || 'FPS-OFFICIAL'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {shop?.shopName || 'Fair Price Shop'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Taluk: <strong className="text-white">{shop?.taluk}</strong></span>
                <span>•</span>
                <span>District: <strong className="text-white">{shop?.district}</strong></span>
                <span>•</span>
                <span>Helpline: <strong className="text-white font-mono">{shop?.contactNumber}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/shop/verify"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>{t('verifyToken')}</span>
            </Link>
            <Link
              to="/shop/stock"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur transition-all flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-amber-300" />
              <span>Manage Inventory</span>
            </Link>
          </div>
        </div>

        {/* Persona Quote Banner */}
        <div className="mt-6 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs italic flex items-start gap-2.5">
          <span className="text-lg leading-none select-none text-emerald-400">“</span>
          <p className="flex-1 font-medium leading-relaxed">
            {language === 'ta'
              ? '“ஒழுங்கான 15-நிமிட நேர முன்பதிவு முறை மூலம் கூட்ட நெரிசலின்றி பொதுமக்களுக்கு விரைவாக பொருட்களை விநியோகிக்க முடிகிறது.”'
              : '“Scheduled 15-minute appointment slots ensure our distribution center operates at peak efficiency with zero crowd distress.”'}
          </p>
        </div>
      </div>

      {/* 2. LOW STOCK ALERT BANNER */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-3xl flex items-center justify-between gap-4 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Low Inventory Warning:</strong> {lowStockCount} commodity item(s) are below the 15% threshold. Please replenish stock before incoming bookings.
            </span>
          </div>
          <Link
            to="/shop/stock"
            className="font-black underline text-amber-800 hover:text-amber-950 flex-shrink-0"
          >
            Restock Now
          </Link>
        </div>
      )}

      {/* 3. OPERATIONAL METRICS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
              Slot Throughput
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {shop?.slotCapacity || 6} <span className="text-xs font-normal text-slate-500">citizens / 15m</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
              Operating Window
            </p>
            <p className="text-lg font-black text-slate-900 mt-1 font-mono">
              {shop?.operatingHours?.open || '09:00'} - {shop?.operatingHours?.close || '18:00'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Lunch: {shop?.operatingHours?.lunchStart || '13:00'} - {shop?.operatingHours?.lunchEnd || '14:00'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
              Commodities Active
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stockData.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Rice, Wheat, Sugar, Oil, Dal</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
              Verification Engine
            </p>
            <p className="text-xs font-black text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Camera & Manual Scanner</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Instant Atomic Sync</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. COMMODITY STOCK BALANCES PROGRESS CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Current Commodity Warehouse Stock Balance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inventory tracking with atomic deduction upon citizen QR disbursal
            </p>
          </div>
          <Link
            to="/shop/stock"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 transition"
          >
            <span>Full Stock Sheet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stockData.map((item) => {
            const percentage = Math.min(
              100,
              Math.round((item.availableQuantity / (item.allocatedMonthlyQuantity || 1000)) * 100)
            );

            return (
              <div
                key={item._id}
                className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800">{item.commodity}</span>
                    {item.isLowStock && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        Low
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-blue-950 mt-2">
                    {item.availableQuantity}{' '}
                    <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200/60">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block text-right font-mono font-medium">
                    {percentage}% of allocation
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;