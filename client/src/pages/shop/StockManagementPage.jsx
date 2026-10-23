import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import api from '../../services/api.js';
import StockUpdateModal from '../../components/shop/StockUpdateModal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  Package,
  PlusCircle,
  AlertTriangle,
  History,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const StockManagementPage = () => {
  const { user, shop } = useAuth();
  const { language, t } = useLanguage();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState('RICE');

  const fetchStock = async () => {
    if (!shop) return;
    try {
      setLoading(true);
      const res = await api.get(`/stock/${shop._id}`);
      if (res.data.success) {
        setStocks(res.data.stock);
      }
    } catch (err) {
      console.error('Failed to load stock inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [shop]);

  const handleOpenRestock = (comm) => {
    setSelectedCommodity(comm);
    setModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading stock inventory data..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </span>
            <span>{t('stockManagement')} & Warehouse Balances</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fair Price Shop warehouse balances, safety thresholds, and atomic replenishment audit trail
          </p>
        </div>

        <button
          onClick={() => handleOpenRestock('RICE')}
          className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Replenish Stock</span>
        </button>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stocks.map((item) => {
          const percentage = Math.min(
            100,
            Math.round((item.availableQuantity / (item.allocatedMonthlyQuantity || 1000)) * 100)
          );

          return (
            <div
              key={item._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-slate-900">{item.commodity}</h3>
                    <p className="text-xs text-slate-500">{item.commodityName}</p>
                  </div>
                  {item.isLowStock ? (
                    <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Low Stock</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Adequate
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {item.availableQuantity}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{item.unit} available</span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Monthly Quota: {item.allocatedMonthlyQuantity} {item.unit}</span>
                    <span className="font-mono font-bold text-slate-700">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Last: {new Date(item.lastRestockedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleOpenRestock(item.commodity)}
                  className="text-xs font-black text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 transition"
                >
                  Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock History Log */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-700" />
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
            Recent Restock & Warehouse Delivery Audit Trail
          </h3>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {stocks.flatMap((s) => s.restockHistory || []).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No previous restock transactions recorded.
            </div>
          ) : (
            stocks
              .flatMap((s) =>
                (s.restockHistory || []).map((h) => ({ ...h, commodity: s.commodity, unit: s.unit }))
              )
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((log, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                  <div>
                    <span className="font-bold text-slate-900 mr-2">{log.commodity}</span>
                    <span className="text-slate-600">
                      Added +{log.quantityAdded} {log.unit} (Balance: {log.newQuantity} {log.unit})
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{log.notes}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    {new Date(log.date).toLocaleString()}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Restock Modal */}
      {modalOpen && (
        <StockUpdateModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          shopId={shop?._id}
          currentCommodity={selectedCommodity}
          onSuccess={() => fetchStock()}
        />
      )}
    </div>
  );
};

export default StockManagementPage;