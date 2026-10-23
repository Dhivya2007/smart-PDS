import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import {
  ShieldCheck,
  Search,
  Link2,
  AlertCircle,
  CheckCircle2,
  Store,
  Users,
  Award,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';

const CardVerificationPage = () => {
  const { user, refreshProfile } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [linking, setLinking] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    setCardData(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/ration-cards/verify', {
        cardNumber: cardNumber.trim().toUpperCase(),
        aadhaarLast4: aadhaarLast4.trim(),
      });
      if (res.data.success) {
        setCardData(res.data.card);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check details.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLinkCard = async () => {
    setLinking(true);
    setError(null);
    try {
      const res = await api.post('/ration-cards/link', {
        cardNumber: cardData.cardNumber,
        aadhaarLast4: cardData.headOfFamily.aadhaarLast4,
      });

      if (res.data.success) {
        setSuccessMsg('Ration card successfully linked to your account!');
        await refreshProfile();
        setTimeout(() => {
          navigate('/beneficiary/dashboard');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link ration card.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-700 to-indigo-900 text-white rounded-3xl mx-auto flex items-center justify-center mb-3.5 shadow-md border-2 border-white ring-2 ring-blue-100">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Smart Ration Card Verification & Linking
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
          Authenticate your household Aadhaar credentials against the state PDS registry to unlock automated 15-minute queue booking
        </p>
      </div>

      {/* Verification Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                12-Digit Smart Card Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="Enter 12-digit ration card number"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-mono font-bold text-xs text-slate-900 uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Test card: <strong className="font-mono text-slate-700">330410293847</strong>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Head of Family Aadhaar (Last 4) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength="4"
                value={aadhaarLast4}
                onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 4821"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-mono font-bold text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">Digits only</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3.5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            {verifying ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify Card Details</span>
              </>
            )}
          </button>
        </form>

        {/* Verification Result Persona Card */}
        {cardData && (
          <div className="pt-6 border-t border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Card Found & Authenticated in Registry</span>
              </span>
              <StatusBadge status={cardData.cardType} />
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 uppercase text-[10px] font-black">Family Head</p>
                <p className="font-black text-slate-900 text-base mt-0.5">
                  {cardData.headOfFamily.name}
                </p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                  Aadhaar: XXXX-XXXX-{cardData.headOfFamily.aadhaarLast4}
                </p>
              </div>

              <div>
                <p className="text-slate-400 uppercase text-[10px] font-black">Linked Fair Price Shop</p>
                <p className="font-black text-slate-900 text-base mt-0.5">
                  {cardData.fairPriceShop?.shopName}
                </p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                  {cardData.fairPriceShop?.fpsCode} • {cardData.fairPriceShop?.taluk}
                </p>
              </div>

              <div className="col-span-1 sm:col-span-2 pt-3 border-t border-slate-200/60">
                <p className="text-slate-400 uppercase text-[10px] font-black mb-2">
                  Monthly Entitlement Allocation
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700">
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                    🌾 Rice: {cardData.monthlyEntitlement.riceKg} kg
                  </span>
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                    🥖 Wheat: {cardData.monthlyEntitlement.wheatKg} kg
                  </span>
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                    🧂 Sugar: {cardData.monthlyEntitlement.sugarKg} kg
                  </span>
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                    🪔 Kerosene: {cardData.monthlyEntitlement.keroseneLitre} L
                  </span>
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                    🥣 Dal: {cardData.monthlyEntitlement.dalKg} kg
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={linking}
              onClick={handleLinkCard}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {linking ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Link This Ration Card to My Account</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardVerificationPage;