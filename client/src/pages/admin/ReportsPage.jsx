import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ReceiptModal from '../../components/beneficiary/ReceiptModal.jsx';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Store,
  Filter,
  Eye,
  CheckCircle2,
} from 'lucide-react';

const ReportsPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/distribution/history?limit=50');
        if (res.data.success) {
          setHistory(res.data.records);
        }
      } catch (err) {
        console.error('Failed to load distribution history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = [
      'Receipt Number',
      'Ration Card Number',
      'Card Type',
      'FPS Code',
      'Shop Name',
      'Month Cycle',
      'Distribution Date',
      'Total Amount (INR)',
      'Payment Method',
      'Collector Name',
    ];

    const rows = history.map((r) => [
      r.receiptNumber,
      r.rationCardId?.cardNumber || 'N/A',
      r.rationCardId?.cardType || 'N/A',
      r.shopId?.fpsCode || 'N/A',
      `"${r.shopId?.shopName || 'N/A'}"`,
      r.monthCycle,
      new Date(r.distributedAt).toISOString(),
      r.totalAmount || 0,
      r.paymentMethod,
      `"${r.collectedByMember?.name || 'Self'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartPDS_Statewide_Distribution_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleOpenReceipt = async (recordId) => {
    try {
      const res = await api.get(`/distribution/receipt/${recordId}`);
      if (res.data.success) {
        setSelectedReceipt(res.data.receipt);
      }
    } catch (err) {
      alert('Could not retrieve digital receipt');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <span>Statewide Distribution Audit Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auditable distribution logs, digital receipts, and commodity throughput records
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={history.length === 0}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Reports Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="font-black text-xs uppercase tracking-wider text-slate-700">
            Real-Time Distribution Ledger ({history.length} transactions)
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Sorted by recent disbursals</span>
        </div>

        {loading ? (
          <LoadingSpinner size="md" text="Loading audit reports..." />
        ) : history.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400">
            No distribution events found in the selected cycle.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Receipt No.</th>
                  <th className="py-3.5 px-4">Ration Card</th>
                  <th className="py-3.5 px-4">Fair Price Shop</th>
                  <th className="py-3.5 px-4">Cycle</th>
                  <th className="py-3.5 px-4">Distributed At</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-mono font-black text-blue-900">
                      {record.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {record.rationCardId?.cardNumber || '—'}
                      <span className="ml-1 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-normal">
                        {record.rationCardId?.cardType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      {record.shopId?.shopName}
                      <p className="text-[10px] text-slate-400 font-mono">{record.shopId?.fpsCode}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                      {record.monthCycle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">
                      {new Date(record.distributedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex flex-wrap gap-1">
                        {record.itemsDistributed?.map((it, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded"
                          >
                            {it.commodity}: {it.quantity}{it.unit}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      ₹{record.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenReceipt(record._id)}
                        className="p-1.5 rounded-xl hover:bg-blue-50 text-blue-700 transition"
                        title="View Full Digital Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default ReportsPage;