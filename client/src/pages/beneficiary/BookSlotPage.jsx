import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import api from '../../services/api.js';
import SlotPicker from '../../components/beneficiary/SlotPicker.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Store,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const BookSlotPage = () => {
  const { user, rationCard } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [paymentMethod, setPaymentMethod] = useState('ONLINE_MOCK');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCollectedThisMonth = rationCard?.lastCollectedMonth === currentMonth;

  const handleSelectSlot = (slotTime, dateStr) => {
    setSelectedSlot(slotTime);
    if (dateStr) setSelectedDate(dateStr);
    setError(null);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDate) {
      setError('Please select an available 15-minute slot.');
      return;
    }

    setBookingInProgress(true);
    setError(null);

    try {
      const res = await api.post('/bookings', {
        dateString: selectedDate,
        slotTime: selectedSlot,
        paymentMethod,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/beneficiary/my-bookings');
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to complete booking. The slot may have just been booked.'
      );
    } finally {
      setBookingInProgress(false);
    }
  };

  if (!rationCard) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-3xl mx-auto flex items-center justify-center border border-amber-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Ration Card Not Linked</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You must link a verified smart ration card to your profile before booking queue slots.
        </p>
        <Link
          to="/beneficiary/verify-card"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-md transition"
        >
          <span>Link Ration Card Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (isCollectedThisMonth) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center border border-emerald-200">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Monthly Quota Already Collected</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          Your household ration quota for {currentMonth} has already been collected. The system permits only one successful collection per monthly cycle to prevent duplicate disbursements.
        </p>
        <Link
          to="/beneficiary/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow transition"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </span>
          <span>{t('bookSlot')}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select an available 15-minute collection window at your registered Fair Price Shop to generate an HMAC-signed QR token
        </p>
      </div>

      {/* Linked Shop Card */}
      <div className="bg-gradient-to-r from-blue-50/80 via-sky-50/50 to-slate-50 border border-blue-200/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-blue-950 text-sm">
                {rationCard.fpsId?.shopName || 'Assigned Fair Price Shop'}
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-200/70 text-blue-900">
                {rationCard.fpsId?.fpsCode}
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-0.5">
              {rationCard.fpsId?.address}
            </p>
          </div>
        </div>
        <span className="font-mono bg-white px-3 py-1.5 rounded-xl text-xs font-bold text-blue-900 border border-blue-200 shadow-2xs">
          Capacity: {rationCard.fpsId?.slotCapacity || 6} citizens / 15m
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">Slot confirmed! Redirecting to your digital QR token pass...</span>
        </div>
      )}

      {/* Main Interactive Slot Picker Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8 space-y-6">
        <SlotPicker
          shopId={rationCard.fpsId?._id || rationCard.fpsId}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSelectSlot}
        />

        {/* Payment Method Selector */}
        <div className="pt-6 border-t border-slate-100">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-3">
            Choose Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                paymentMethod === 'ONLINE_MOCK'
                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-200'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payMode"
                  value="ONLINE_MOCK"
                  checked={paymentMethod === 'ONLINE_MOCK'}
                  onChange={() => setPaymentMethod('ONLINE_MOCK')}
                  className="text-blue-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                    <span>Online Simulated Gateway</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Instant digital payment confirmation</p>
                </div>
              </div>
              <span className="font-mono font-black text-xs text-blue-900">
                ₹{rationCard.monthlyEntitlement?.subsidizedTotalAmount || 40}.00
              </span>
            </label>

            <label
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                paymentMethod === 'CASH'
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payMode"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                  className="text-emerald-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Cash at Shop Counter</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Pay cash upon grain collection</p>
                </div>
              </div>
              <span className="font-mono font-black text-xs text-emerald-900">
                ₹{rationCard.monthlyEntitlement?.subsidizedTotalAmount || 40}.00
              </span>
            </label>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            {selectedSlot ? (
              <span className="text-slate-600">
                Selected Window: <strong className="text-blue-700 font-mono">{selectedSlot}</strong> on{' '}
                <strong className="text-slate-900">{selectedDate}</strong>
              </span>
            ) : (
              <span className="text-slate-400">Please choose an available 15-min slot above</span>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedSlot || bookingInProgress || success}
            onClick={handleConfirmBooking}
            className="w-full sm:w-auto px-7 py-3.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            {bookingInProgress ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm 15-Minute Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookSlotPage;