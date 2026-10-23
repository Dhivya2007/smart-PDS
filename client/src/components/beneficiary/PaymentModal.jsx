import React, { useState } from 'react';
import api from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import {
  X,
  CreditCard,
  Banknote,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Info,
} from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, payment, onSuccess }) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('online'); // 'online' or 'cash'
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [simulateOutcome, setSimulateOutcome] = useState('SUCCESS');

  if (!isOpen || !payment) return null;

  const handleSimulatePayment = async () => {
    setProcessing(true);
    setResult(null);
    try {
      const res = await api.post('/payments/simulate-online', {
        paymentId: payment._id,
        simulateStatus: simulateOutcome,
      });

      setResult({
        success: res.data.success,
        status: res.data.status,
        message: res.data.message,
        transactionId: res.data.payment?.transactionId,
      });

      if (res.data.success && onSuccess) {
        onSuccess(res.data.payment);
      }
    } catch (err) {
      setResult({
        success: false,
        status: 'FAILED',
        message: err.response?.data?.message || 'Payment simulation encounter an unexpected error.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-gov-navy to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-sm">Payment Selection & Status</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Development Mock Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Testing Gateway:</strong> Simulated mock environment. No real money or card data is charged.
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount Due Card */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Subsidized Total Due
              </p>
              <p className="text-2xl font-black text-blue-950 mt-0.5">₹{payment.amount}.00</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-black px-3 py-1 rounded-full">
              PDS Subsidized
            </span>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
            <button
              onClick={() => {
                setActiveTab('online');
                setResult(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'online'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-700" />
              <span>{t('onlinePayment')}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('cash');
                setResult(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'cash'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('cashAtCounter')}</span>
            </button>
          </div>

          {/* Tab 1: Mock Online Gateway */}
          {activeTab === 'online' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs space-y-2">
                <p className="font-extrabold text-blue-950">
                  Select Simulation Scenario (for development & testing):
                </p>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario"
                      value="SUCCESS"
                      checked={simulateOutcome === 'SUCCESS'}
                      onChange={() => setSimulateOutcome('SUCCESS')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">
                      Simulate Successful Payment (Instant confirmation)
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario"
                      value="FAILURE"
                      checked={simulateOutcome === 'FAILURE'}
                      onChange={() => setSimulateOutcome('FAILURE')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">
                      Simulate Card Decline / Insufficient Balance
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scenario"
                      value="NETWORK_ERROR"
                      checked={simulateOutcome === 'NETWORK_ERROR'}
                      onChange={() => setSimulateOutcome('NETWORK_ERROR')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">
                      Simulate Gateway Network Timeout (Retry flow)
                    </span>
                  </label>
                </div>
              </div>

              {/* Status Outcome Banner */}
              {result && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    result.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-bold">{result.message}</p>
                    {result.transactionId && (
                      <p className="font-mono text-[11px] mt-1 text-slate-600">
                        Txn ID: {result.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={processing || (result && result.success)}
                onClick={handleSimulatePayment}
                className={`w-full py-3.5 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 shadow-md transition ${
                  result && result.success
                    ? 'bg-emerald-600 cursor-not-allowed opacity-90'
                    : 'bg-blue-700 hover:bg-blue-600'
                }`}
              >
                {processing ? (
                  <LoadingSpinner size="sm" text="" />
                ) : result && result.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment Completed</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Run Simulated Payment (₹{payment.amount})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 2: Cash at Counter */}
          {activeTab === 'cash' && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span>Cash Payment at Counter Selected</span>
                </div>
                <p className="leading-relaxed">
                  You can pay <strong>₹{payment.amount}.00</strong> directly in cash to the Fair Price Shop owner when you collect your commodities at your scheduled slot.
                </p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  • The shop owner will verify and confirm receipt on their device during distribution.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl font-black text-xs bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
              >
                Got It, Will Pay at Counter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;