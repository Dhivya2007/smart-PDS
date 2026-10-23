import React, { useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import {
  Download,
  QrCode,
  Store,
  Calendar,
  Clock,
  CreditCard,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  MapPin,
} from 'lucide-react';

const QueueTokenCard = ({ booking, token, payment, onOpenPayment }) => {
  const { language, t } = useLanguage();
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (!booking || !token) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token.tokenCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (token.qrDataUrl) {
      const link = document.createElement('a');
      link.href = token.qrDataUrl;
      link.download = `SmartPDS_Token_${token.tokenCode}.png`;
      link.click();
    } else {
      window.print();
    }
  };

  const isPaymentPending = payment && payment.status === 'PENDING';

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/90 overflow-hidden max-w-lg mx-auto"
    >
      {/* 1. PASS HEADER */}
      <div className="bg-gradient-to-r from-gov-navy via-slate-900 to-blue-950 text-white p-6 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 border border-blue-400/40 flex items-center justify-center font-black text-lg shadow-inner">
              🌾
            </div>
            <div>
              <span className="text-[10px] text-blue-300 font-extrabold uppercase tracking-widest block">
                Digital Queue Pass
              </span>
              <h3 className="text-base font-black tracking-tight text-white">
                Fair Price Distribution
              </h3>
            </div>
          </div>
          <StatusBadge status={token.status || booking.status} />
        </div>
      </div>

      {/* 2. TOKEN & QR SURFACE */}
      <div className="p-6 text-center space-y-5">
        {/* Token Code Display with Copy */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
            {t('tokenCode')}
          </span>
          <div className="inline-flex items-center gap-2 bg-blue-50/80 px-4 py-2 rounded-2xl border border-blue-200/80">
            <span className="text-xl sm:text-2xl font-mono font-black text-blue-950 tracking-wider">
              {token.tokenCode}
            </span>
            <button
              type="button"
              onClick={handleCopyToken}
              className="p-1 rounded-lg text-blue-700 hover:bg-blue-100 transition"
              title="Copy Token"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* QR Code Container with Tamper-Proof Frame */}
        <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-blue-200 rounded-3xl inline-block shadow-inner">
          {token.qrDataUrl ? (
            <img
              src={token.qrDataUrl}
              alt="Queue Token QR Code"
              className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-2xl"
            />
          ) : (
            <div className="w-48 h-48 sm:w-52 sm:h-52 bg-slate-100 flex items-center justify-center text-slate-400 text-xs rounded-2xl">
              QR Code Preview
            </div>
          )}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>HMAC Cryptographically Verified</span>
          </div>
        </div>

        {/* 3. TICKET DETAILS GRID */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Date</span>
            </span>
            <span className="font-extrabold text-slate-900">{booking.dateString}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>15-Minute Slot</span>
            </span>
            <span className="font-black text-blue-700 font-mono text-xs bg-blue-100/70 px-2.5 py-0.5 rounded-lg border border-blue-200">
              {booking.slotTime}
            </span>
          </div>

          <div className="flex items-start justify-between border-b border-slate-200/70 pb-2">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <Store className="w-4 h-4 text-blue-600" />
              <span>Fair Price Shop</span>
            </span>
            <div className="text-right">
              <span className="font-bold text-slate-900 block">
                {booking.shopId?.shopName || 'Fair Price Shop'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {booking.shopId?.fpsCode}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Subsidized Total</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">
                ₹{payment ? payment.amount : booking.rationCardId?.monthlyEntitlement?.subsidizedTotalAmount || 40}
              </span>
              <StatusBadge status={payment?.status || 'PENDING'} />
            </div>
          </div>
        </div>

        {/* 4. ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-blue-300" />
            <span>{t('downloadToken')}</span>
          </button>

          {isPaymentPending && onOpenPayment && (
            <button
              onClick={onOpenPayment}
              className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <CreditCard className="w-4 h-4 text-emerald-200" />
              <span>{t('payNow')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueTokenCard;