import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../services/api.js';
import {
  ShieldCheck,
  Calendar,
  QrCode,
  Clock,
  Sparkles,
  ChevronRight,
  Search,
  CheckCircle2,
  Store,
  Users,
  AlertCircle,
  Award,
  ArrowRight,
  Check,
  User,
  Shield,
  Activity,
} from 'lucide-react';

const LandingPage = () => {
  const { language, t } = useLanguage();
  const [cardNumber, setCardNumber] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  const handleQuickCheck = async (e) => {
    e.preventDefault();
    if (!cardNumber || !aadhaarLast4) return;

    setVerifying(true);
    setVerifyResult(null);
    setVerifyError(null);
    try {
      const res = await api.post('/ration-cards/verify', {
        cardNumber: cardNumber.trim().toUpperCase(),
        aadhaarLast4: aadhaarLast4.trim(),
      });
      if (res.data.success) {
        setVerifyResult(res.data.card);
      }
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Verification failed. Please check details.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION WITH MODERN AMBIENT GLOW */}
      <section className="bg-gradient-to-br from-gov-navy via-slate-900 to-blue-950 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle grid and radial gradients */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-blue-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Queue Management & Next-Gen PDS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {language === 'ta' ? (
                <>
                  நீண்ட வரிசைகளுக்கு முற்றுப்புள்ளி! <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    15-நிமிட நேர முன்பதிவு
                  </span>{' '}
                  முறை
                </>
              ) : (
                <>
                  Zero Queues. Zero Delays. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    Smart 15-Minute Slot
                  </span>{' '}
                  Booking
                </>
              )}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
              {language === 'ta'
                ? 'உங்கள் ஸ்மார்ட் குடும்ப அட்டைக்கான மாதாந்திர ரேஷன் பொருட்களை நெரிசலின்றி பெற முன்கூட்டியே நேரத்தை முன்பதிவு செய்து, டிஜிட்டல் QR டோக்கனைப் பெறுங்கள்.'
                : 'Modernizing Public Distribution with automated queue slots, non-guessable HMAC-signed QR tokens, instant stock telemetry, digital receipts, and fair distribution.'}
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 font-black text-xs sm:text-sm text-slate-950 shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 flex items-center gap-2"
              >
                <span>Book Slot Now</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs sm:text-sm text-white backdrop-blur transition-all flex items-center gap-2"
              >
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4 text-blue-300" />
              </Link>
            </div>

            {/* Quick Metrics Strip */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 text-xs">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">15 Min</p>
                <p className="text-blue-200/80 text-[11px] mt-0.5">Automated Slots</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">100%</p>
                <p className="text-blue-200/80 text-[11px] mt-0.5">Subsidized Welfare</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono">0 Min</p>
                <p className="text-blue-200/80 text-[11px] mt-0.5">Waiting Queues</p>
              </div>
            </div>
          </div>

          {/* 2. INSTANT PERSONA CHECK WIDGET */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative">
              <div className="flex items-center space-x-2 text-blue-900 font-black text-sm mb-4 border-b border-slate-100 pb-3">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Instant Card & Quota Verification</span>
              </div>

              <form onSubmit={handleQuickCheck} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Smart Ration Card Number (12 Digits)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Enter 12-digit ration card number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Try test card: <strong className="font-mono text-slate-700">330410293847</strong>
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Aadhaar Last 4 Digits (Head of Family)
                  </label>
                  <input
                    type="text"
                    maxLength="4"
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="e.g. 4821"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-600 font-black text-white transition flex items-center justify-center gap-2 shadow-md hover:shadow-blue-600/25"
                >
                  {verifying ? (
                    'Verifying...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check Monthly Entitlement</span>
                    </>
                  )}
                </button>
              </form>

              {/* Error Alert */}
              {verifyError && (
                <div className="mt-3.5 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{verifyError}</span>
                </div>
              )}

              {/* Persona Verification Preview Card */}
              {verifyResult && (
                <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between font-black text-emerald-950">
                    <span className="font-mono">{verifyResult.cardNumber}</span>
                    <span className="bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {verifyResult.cardType}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    Head of Family: <strong>{verifyResult.headOfFamily.name}</strong>
                  </p>
                  <p className="text-slate-700">
                    Fair Price Shop: <strong>{verifyResult.fairPriceShop?.shopName}</strong>
                  </p>
                  <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between font-bold">
                    <span>Monthly Rice: {verifyResult.monthlyEntitlement?.riceKg} kg</span>
                    <span
                      className={
                        verifyResult.isEligibleThisMonth ? 'text-emerald-700' : 'text-amber-800'
                      }
                    >
                      {verifyResult.isEligibleThisMonth ? 'Eligible to Collect' : 'Quota Collected'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. USER PERSONA COMMUNITY SECTION (FIGMA INSPIRATION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Tailored Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            {language === 'ta'
              ? 'அனைத்து பயனர்களுக்கும் ஏற்ற தனிப்பயன் சேவைகள்'
              : 'User Personas Designed for Seamless Operations'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every user persona has dedicated workflows tailored to their daily responsibilities and needs.
          </p>
        </div>

        {/* 3 User Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Persona 1: Citizen Beneficiary */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl border border-blue-200">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Citizen Beneficiary
                  </span>
                  <h4 className="font-black text-base text-slate-900 mt-1">
                    Karthik & Family
                  </h4>
                </div>
              </div>

              {/* Persona Quote */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-slate-600 text-xs italic mb-4">
                “I want to collect our monthly grains on Saturday morning without standing in 2-hour queues with my kids.”
              </div>

              {/* Persona Attributes */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>15-minute slot reservation from mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Instant cryptographically signed QR token</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Choice of Cash at Counter or Mock Online Pay</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Permanent verifiable digital receipt history</span>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl text-xs font-black text-center transition shadow-sm"
            >
              Sign In as Beneficiary
            </Link>
          </div>

          {/* Persona 2: Fair Price Shop Owner */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl border border-emerald-200">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    FPS Shop Owner
                  </span>
                  <h4 className="font-black text-base text-slate-900 mt-1">
                    Annamalai G.
                  </h4>
                </div>
              </div>

              {/* Persona Quote */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-slate-600 text-xs italic mb-4">
                “With slot schedules, crowds are distributed evenly and barcode scanning ensures zero distribution disputes.”
              </div>

              {/* Persona Attributes */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Integrated webcam and handheld QR scanner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Atomic commodity inventory deductions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Automated low-stock threshold replenishment alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>End-of-day reconciliation reports</span>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black text-center transition shadow-sm"
            >
              Sign In as Shop Owner
            </Link>
          </div>

          {/* Persona 3: Civil Supplies Administrator */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl border border-indigo-200">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    State Administrator
                  </span>
                  <h4 className="font-black text-base text-slate-900 mt-1">
                    Dr. Meenakshi IAS
                  </h4>
                </div>
              </div>

              {/* Persona Quote */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-slate-600 text-xs italic mb-4">
                “Real-time statewide telemetry gives us full transparency over commodity movement and queue throughput.”
              </div>

              {/* Persona Attributes */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Statewide distribution telemetry with Recharts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Shop owner credential verification & approvals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Leakage prevention and anomaly detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>CSV/Excel audit exports & compliance logs</span>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black text-center transition shadow-sm"
            >
              Sign In as Administrator
            </Link>
          </div>
        </div>
      </section>

      {/* 3. CORE TECHNICAL PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-8 sm:p-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Transforming Public Distribution with Engineering Rigor
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Robust security, atomic concurrency controls, and real-time database locks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">15-Minute Slot Engine</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Atomic slot reservation guarantees no overbooking beyond shop capacity, completely eliminating crowding.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Cryptographic QR Tokens</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cryptographically signed non-guessable tokens with one-time verification prevent fraudulent claims.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Atomic Stock Management</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inventory is atomically decremented upon physical distribution, ensuring real-time reconciliation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;