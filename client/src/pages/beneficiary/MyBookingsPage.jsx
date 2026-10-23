import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import QueueTokenCard from '../../components/beneficiary/QueueTokenCard.jsx';
import PaymentModal from '../../components/beneficiary/PaymentModal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  Calendar,
  Clock,
  QrCode,
  CreditCard,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Store,
  X,
} from 'lucide-react';

const MyBookingsPage = () => {
  const { language, t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTokenBooking, setSelectedTokenBooking] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenPayment = async (booking) => {
    try {
      const res = await api.get(`/payments/booking/${booking._id}`);
      if (res.data.success) {
        setSelectedPayment(res.data.payment);
        setPaymentModalOpen(true);
      }
    } catch (err) {
      alert('Could not fetch payment record');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const res = await api.post(`/bookings/${cancelModalBooking._id}/cancel`, {
        reason: 'Cancelled by beneficiary',
      });
      if (res.data.success) {
        setFeedbackMsg('Booking cancelled successfully.');
        setCancelModalBooking(null);
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your bookings..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </span>
          <span>{t('myBookings')} & Digital Queue Passes</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review appointment slots, download cryptographic QR tokens, or cancel upcoming visits
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{feedbackMsg}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-300 mx-auto flex items-center justify-center border border-slate-100">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-700">No Booking History Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You haven't scheduled any 15-minute ration collection slots yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-300 transition-all"
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-base text-slate-900">
                    {booking.dateString}
                  </span>
                  <span className="font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {booking.slotTime}
                  </span>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="flex items-center gap-2 text-slate-500 pt-0.5">
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {booking.shopId?.shopName} ({booking.shopId?.fpsCode})
                  </span>
                </div>

                {booking.tokenCode && (
                  <div className="text-[11px] font-mono text-slate-600">
                    Token Pass: <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{booking.tokenCode}</strong>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {booking.tokenRef && booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => {
                      setSelectedTokenBooking(booking);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-200" />
                    <span>View QR Pass</span>
                  </button>
                )}

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => setCancelModalBooking(booking)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Token Modal */}
      {selectedTokenBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setSelectedTokenBooking(null)}
              className="absolute -top-11 right-0 text-white hover:text-slate-300 text-xs font-bold flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
            <QueueTokenCard
              booking={selectedTokenBooking}
              token={selectedTokenBooking.tokenRef}
              payment={null}
              onOpenPayment={() => {
                handleOpenPayment(selectedTokenBooking);
              }}
            />
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 max-w-sm w-full space-y-4 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center border border-red-100">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Cancel Slot Booking?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to cancel your slot for {cancelModalBooking.slotTime} on {cancelModalBooking.dateString}? Your window will be released to other beneficiaries.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-sm transition"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedPayment && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          payment={selectedPayment}
          onSuccess={() => {
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;