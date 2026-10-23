import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import api from '../../services/api.js';
import RationCardCard from '../../components/beneficiary/RationCardCard.jsx';
import QueueTokenCard from '../../components/beneficiary/QueueTokenCard.jsx';
import PaymentModal from '../../components/beneficiary/PaymentModal.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import {
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Store,
  MapPin,
  QrCode,
  Check,
  HelpCircle,
} from 'lucide-react';

const BeneficiaryDashboard = () => {
  const { user, rationCard, refreshProfile } = useAuth();
  const { language, t } = useLanguage();
  const [activeBooking, setActiveBooking] = useState(null);
  const [activeToken, setActiveToken] = useState(null);
  const [activePayment, setActivePayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchActiveBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        // Find confirmed booking for current/future
        const confirmed = res.data.bookings.find((b) => b.status === 'CONFIRMED');
        if (confirmed) {
          setActiveBooking(confirmed);
          setActiveToken(confirmed.tokenRef);
          // Fetch payment for this booking
          const pRes = await api.get(`/payments/booking/${confirmed._id}`);
          if (pRes.data.success) {
            setActivePayment(pRes.data.payment);
          }
        } else {
          setActiveBooking(null);
          setActiveToken(null);
          setActivePayment(null);
        }
      }
    } catch (err) {
      console.warn('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBooking();
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCollectedThisMonth = rationCard?.lastCollectedMonth === currentMonth;

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading citizen persona dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP FIGMA-STYLE PERSONA HERO BANNER */}
      <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-blue-950 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            {/* Avatar Pill */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-white/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center"
                title="Active Account"
              >
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            {/* Persona Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Citizen</span>
                </span>
                <span className="px-3 py-0.5 rounded-full bg-white/10 text-blue-200 border border-white/10 text-xs font-semibold">
                  Tamil Nadu PDS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {t('welcome')}, {user?.name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200/90 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Mobile: <strong className="text-white font-mono">{user?.phone}</strong></span>
                <span>•</span>
                <span>Email: <strong className="text-white">{user?.email}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Actions Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isCollectedThisMonth && !activeBooking && rationCard && (
              <Link
                to="/beneficiary/book-slot"
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('bookSlot')}</span>
              </Link>
            )}
            <Link
              to="/beneficiary/purchase-history"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Digital Receipts</span>
            </Link>
          </div>
        </div>

        {/* Persona Quick Attribute Chips Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-blue-300 text-[10px] uppercase font-bold tracking-wider block">
              Card Status
            </span>
            <span className="font-extrabold text-white text-sm mt-0.5 block">
              {rationCard ? `${rationCard.cardType} Active` : 'Unlinked'}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-blue-300 text-[10px] uppercase font-bold tracking-wider block">
              Monthly Cycle
            </span>
            <span className="font-extrabold text-white text-sm mt-0.5 block font-mono">
              {currentMonth}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-blue-300 text-[10px] uppercase font-bold tracking-wider block">
              Distribution Status
            </span>
            <span
              className={`font-extrabold text-sm mt-0.5 block ${
                isCollectedThisMonth ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {isCollectedThisMonth ? 'Quota Disbursed' : 'Pending Collection'}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-blue-300 text-[10px] uppercase font-bold tracking-wider block">
              Queue Token Pass
            </span>
            <span className="font-extrabold text-white text-sm mt-0.5 block">
              {activeBooking ? 'Slot Confirmed' : 'None Active'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. UNLINKED RATION CARD WARNING BANNER */}
      {!rationCard && (
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start space-x-3.5">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-900">
                No Smart Ration Card Linked to Your Profile
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                To access your family monthly entitlement quota, book 15-minute queue slots, and generate digital QR tokens, please link your 12-digit Smart Ration Card.
              </p>
            </div>
          </div>
          <Link
            to="/beneficiary/verify-card"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl shadow transition flex-shrink-0 flex items-center gap-1.5"
          >
            <span>Verify & Link Card</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Persona Smart Ration Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                🌾
              </span>
              <span>Citizen Persona & Ration Quota</span>
            </h2>
            {rationCard && <StatusBadge status={rationCard.cardType} />}
          </div>

          {rationCard ? (
            <RationCardCard card={rationCard} currentMonth={currentMonth} />
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-400 text-xs">
              Card preview unavailable. Please link a ration card to view details.
            </div>
          )}
        </div>

        {/* Right Column: Queue Token / Next Step Persona Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
                <Clock className="w-4 h-4" />
              </span>
              <span>Live Queue & Distribution Pass</span>
            </h2>
          </div>

          {activeBooking && activeToken ? (
            <div>
              <QueueTokenCard
                booking={activeBooking}
                token={activeToken}
                payment={activePayment}
                onOpenPayment={() => setPaymentModalOpen(true)}
              />
            </div>
          ) : isCollectedThisMonth ? (
            <div className="bg-white border border-emerald-200/90 rounded-3xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block mb-2">
                  Completed Cycle
                </span>
                <h3 className="font-black text-base text-slate-900">
                  Monthly Quota Already Collected
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mt-1.5">
                  You have successfully collected all subsidized commodities for the current monthly cycle ({currentMonth}). The next booking quota cycle opens automatically on the 1st of next month.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/beneficiary/purchase-history"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>View & Download Distribution Receipt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center border border-blue-100">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-block mb-2">
                  Zero Waiting Time
                </span>
                <h3 className="font-black text-base text-slate-900">
                  Ready to Book for {currentMonth}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Reserve a convenient 15-minute time slot at your registered Fair Price Shop and receive an encrypted QR queue token.
                </p>
              </div>

              {/* 3 Step Persona Guide */}
              <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 text-xs border border-slate-200/70">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Pick date & slot:</strong> 15-minute intervals tailored to avoid crowd peaks.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Receive QR token:</strong> Download or present on your mobile at the shop counter.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Collect & Get Receipt:</strong> Instant disbursal with digital receipt.
                  </p>
                </div>
              </div>

              {rationCard ? (
                <Link
                  to="/beneficiary/book-slot"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-blue-600/25 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Choose 15-Minute Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  to="/beneficiary/verify-card"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow transition-all"
                >
                  <span>Link Smart Card First</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {activePayment && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          payment={activePayment}
          onSuccess={(updatedPayment) => {
            setActivePayment(updatedPayment);
            fetchActiveBooking();
          }}
        />
      )}
    </div>
  );
};

export default BeneficiaryDashboard;