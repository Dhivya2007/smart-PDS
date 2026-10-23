import React, { useState } from 'react';
import api from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import TokenScanner from '../../components/shop/TokenScanner.jsx';
import DistributionForm from '../../components/shop/DistributionForm.jsx';
import ReceiptModal from '../../components/beneficiary/ReceiptModal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { QrCode, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

const VerifyDistributePage = () => {
  const { language, t } = useLanguage();
  const [verifying, setVerifying] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Handle scanned or entered token
  const handleTokenScanned = async (codeOrQrString) => {
    setVerifying(true);
    setError(null);
    setTokenData(null);
    setSuccessReceipt(null);

    try {
      const payload = codeOrQrString.startsWith('{')
        ? { qrData: codeOrQrString }
        : { tokenCode: codeOrQrString };

      const res = await api.post('/distribution/verify-token', payload);
      if (res.data.success) {
        setTokenData(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Token verification failed. Please check token or validity.'
      );
    } finally {
      setVerifying(false);
    }
  };

  // Confirm distribution
  const handleConfirmDistribution = async (formData) => {
    setDistributing(true);
    setError(null);

    try {
      const res = await api.post('/distribution/confirm', formData);
      if (res.data.success) {
        setSuccessReceipt(res.data.receipt);
        setTokenData(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Distribution confirmation failed.');
    } finally {
      setDistributing(false);
    }
  };

  const handleReset = () => {
    setTokenData(null);
    setError(null);
    setSuccessReceipt(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-emerald-600" />
            <span>{t('verifyToken')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scan beneficiary QR token or enter token code to verify eligibility and record disbursement
          </p>
        </div>

        {(tokenData || error || successReceipt) && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Next</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Verification / Distribution Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Scanner View (if no verified token is being processed) */}
      {!tokenData && !successReceipt && (
        <div className="space-y-4">
          <TokenScanner onTokenScanned={handleTokenScanned} loading={verifying} />
        </div>
      )}

      {/* Step 2: Distribution Form View */}
      {tokenData && (
        <div className="space-y-4 animate-fadeIn">
          <DistributionForm
            tokenData={tokenData}
            onConfirm={handleConfirmDistribution}
            distributing={distributing}
          />
        </div>
      )}

      {/* Step 3: Success Acknowledgement */}
      {successReceipt && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-4 shadow-sm animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-emerald-950">
              Ration Commodities Successfully Distributed!
            </h3>
            <p className="text-xs text-emerald-800 mt-1">
              Receipt No: <strong className="font-mono text-sm">{successReceipt.receiptNumber}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Stock has been atomically deducted and monthly quota marked as completed.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleReset()}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
            >
              Ready for Next Beneficiary
            </button>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {successReceipt && (
        <ReceiptModal
          isOpen={!!successReceipt}
          onClose={() => setSuccessReceipt(null)}
          receipt={successReceipt}
        />
      )}
    </div>
  );
};

export default VerifyDistributePage;
