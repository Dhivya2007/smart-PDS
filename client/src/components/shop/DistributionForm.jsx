import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import {
  PackageCheck,
  AlertTriangle,
  UserCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Coins,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const DistributionForm = ({ tokenData, onConfirm, distributing }) => {
  const { language, t } = useLanguage();
  const [selectedMember, setSelectedMember] = useState(() => {
    return tokenData?.rationCard?.headOfFamily?.name || '';
  });
  const [aadhaarLast4, setAadhaarLast4] = useState(() => {
    return tokenData?.rationCard?.headOfFamily?.aadhaarLast4 || '';
  });

  if (!tokenData) return null;

  const { rationCard, booking, payment, stockStatus, allStockSufficient } = tokenData;

  const handleMemberChange = (name, aadh) => {
    setSelectedMember(name);
    setAadhaarLast4(aadh);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      tokenCode: tokenData.token.tokenCode,
      collectedByMemberName: selectedMember,
      collectedByMemberAadhaarLast4: aadhaarLast4,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
      <div className="bg-gradient-to-r from-gov-navy to-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <PackageCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-sm">Disbursement Verification & Confirmation</h3>
        </div>
        <StatusBadge status={rationCard?.cardType} />
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
        {/* Beneficiary & Card Persona Summary */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-400 uppercase text-[10px] font-black">Ration Card Number</p>
            <p className="text-lg font-mono font-black text-blue-950 mt-0.5">
              {rationCard?.cardNumber}
            </p>
            <p className="text-slate-600 mt-1">
              Head of Family: <strong className="text-slate-900">{rationCard?.headOfFamily?.name}</strong>
            </p>
          </div>

          <div>
            <p className="text-slate-400 uppercase text-[10px] font-black">Queue Slot & Token</p>
            <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">
              {booking?.slotTime} on {booking?.dateString}
            </p>
            <p className="font-mono text-blue-700 text-xs mt-1 font-bold">
              Pass Code: {tokenData.token?.tokenCode}
            </p>
          </div>
        </div>

        {/* Commodity Entitlement and Shop Stock Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              Commodities to Disburse
            </h4>
            {allStockSufficient ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Shop Warehouse Stock Sufficient</span>
              </span>
            ) : (
              <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Insufficient Warehouse Stock</span>
              </span>
            )}
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {stockStatus?.map((item) => (
              <div
                key={item.commodity}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition"
              >
                <div>
                  <span className="font-black text-slate-900">{item.commodity}</span>
                  <span className="text-slate-500 text-[11px] ml-2">
                    (In stock: {item.available})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-blue-900">
                    {item.required}
                  </span>
                  {item.hasSufficient ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="In Stock"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" title="Low Stock"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Verification Status */}
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-700" />
              <span>Payment Verification Status</span>
            </span>
            <StatusBadge status={payment?.status || 'PENDING'} />
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Subsidized Total:</span>
            <strong className="text-base font-mono font-black text-slate-900">
              ₹{payment?.amount || 40}.00
            </strong>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Mode:</span>
            <strong className="text-slate-900">
              {payment?.paymentMethod === 'CASH' ? 'Cash at Counter' : 'Online Payment (Verified)'}
            </strong>
          </div>

          {payment?.paymentMethod === 'CASH' && payment?.status === 'PENDING' && (
            <div className="bg-amber-100/80 text-amber-900 p-3 rounded-xl flex items-center gap-2 mt-2 border border-amber-200">
              <Coins className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Action Required:</strong> Collect <strong>₹{payment.amount}.00</strong> in cash before confirming distribution.
              </span>
            </div>
          )}
        </div>

        {/* Collector Identification */}
        <div className="space-y-3">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
            Person Physically Collecting Commodities
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Select Family Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === rationCard.headOfFamily.name) {
                    handleMemberChange(val, rationCard.headOfFamily.aadhaarLast4);
                  } else {
                    const found = rationCard.members?.find((m) => m.name === val);
                    handleMemberChange(val, found ? found.aadhaarLast4 : '');
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600"
              >
                <option value={rationCard?.headOfFamily?.name}>
                  {rationCard?.headOfFamily?.name} (Head of Family)
                </option>
                {rationCard?.members?.map((m, idx) => (
                  <option key={idx} value={m.name}>
                    {m.name} ({m.relationship || m.relation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Aadhaar Last 4 Digits
              </label>
              <input
                type="text"
                maxLength="4"
                value={aadhaarLast4}
                onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Last 4 digits"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={distributing || !allStockSufficient}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          {distributing ? (
            <LoadingSpinner size="sm" text="" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm Distribution & Atomic Deduction</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default DistributionForm;