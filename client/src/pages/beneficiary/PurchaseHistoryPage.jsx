import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import ReceiptModal from '../../components/beneficiary/ReceiptModal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { FileText, Printer, Store, CheckCircle, Calendar, Sparkles } from 'lucide-react';

const PurchaseHistoryPage = () => {
  const { language, t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/distribution/history');
        if (res.data.success) {
          setHistory(res.data.records);
        }
      } catch (err) {
        console.error('Error fetching distribution history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleOpenReceipt = async (recordId) => {
    try {
      const res = await api.get(`/distribution/receipt/${recordId}`);
      if (res.data.success) {
        setSelectedReceipt(res.data.receipt);
      }
    } catch (err) {
      alert('Could not retrieve digital receipt details');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading digital receipts & distribution history..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </span>
          <span>Purchase History & Digital Receipts</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically audited records of food grains and commodities disbursed to your registered household
        </p>
      </div>

      {history.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-300 mx-auto flex items-center justify-center border border-slate-100">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-700">No Distribution History Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Once you collect ration commodities from your Fair Price Shop, authenticated digital receipts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record._id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-300 transition-all"
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-blue-900 text-base">
                    {record.receiptNumber}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    Cycle: {record.monthCycle}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{new Date(record.distributedAt).toLocaleString()}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-blue-600" />
                    <span>{record.shopId?.shopName}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {record.itemsDistributed?.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-2xs"
                    >
                      {item.commodity}: <strong>{item.quantity} {item.unit}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right sm:mr-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Total Amount
                  </p>
                  <p className="font-mono font-black text-lg text-slate-900">
                    ₹{record.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenReceipt(record._id)}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-sm flex items-center gap-2 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          receipt={selectedReceipt}
        />
      )}
    </div>
  );
};

export default PurchaseHistoryPage;