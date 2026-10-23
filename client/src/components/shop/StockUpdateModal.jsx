import React, { useState } from 'react';
import api from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { X, PackagePlus, CheckCircle2, AlertCircle } from 'lucide-react';

const StockUpdateModal = ({ isOpen, onClose, shopId, currentCommodity, onSuccess }) => {
  const { language, t } = useLanguage();
  const [commodity, setCommodity] = useState(currentCommodity || 'RICE');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/stock/restock', {
        shopId,
        commodity,
        quantityAdded: Number(quantity),
        notes: notes.trim() || 'Official stock replenishment shipment',
      });

      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.stock);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-gov-navy to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <PackagePlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-sm">Replenish Shop Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
              Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600"
            >
              <option value="RICE">Subsidized Rice (அரிசி) - kg</option>
              <option value="WHEAT">Whole Wheat (கோதுமை) - kg</option>
              <option value="SUGAR">Refined Sugar (சர்க்கரை) - kg</option>
              <option value="KEROSENE">Kerosene Oil (மண்ணெண்ணெய்) - Litre</option>
              <option value="DAL">Toor Dal (துவரம் பருப்பு) - kg</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
              Quantity Added ({commodity === 'KEROSENE' ? 'Litres' : 'Kilograms'})
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
              Shipment / Delivery Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Truck Delivery Batch #TN-8821"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-md transition"
            >
              {submitting ? 'Updating...' : 'Confirm Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;