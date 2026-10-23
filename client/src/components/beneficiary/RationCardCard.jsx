import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import {
  ShieldCheck,
  Users,
  MapPin,
  Store,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Sparkles,
  HeartHandshake,
  QrCode,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const RationCardCard = ({ card, currentMonth }) => {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  if (!card) return null;

  const isCollectedThisMonth =
    card.lastCollectedMonth === (currentMonth || new Date().toISOString().slice(0, 7));

  const formatCardNumber = (num) => {
    if (!num) return '';
    // Format 12-digit as 3304 1029 3847
    return num.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(card.cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Persona tier styling
  const cardThemes = {
    AAY: {
      accent: 'from-amber-500 to-amber-700',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      pillBg: 'bg-amber-50 text-amber-800 border-amber-200',
      tag: 'Antyodaya Anna Yojana (AAY) • Deep Subsidy',
      quote:
        language === 'ta'
          ? '“என் குடும்பத்திற்கு தடையற்ற, இலவச உணவு தானியங்கள் சரியான நேரத்தில் கிடைப்பதை உறுதி செய்கிறது.”'
          : '“Ensuring uninterrupted, full food security and nutrition for my entire household with zero delay.”',
    },
    PHH: {
      accent: 'from-blue-600 to-indigo-800',
      badge: 'bg-blue-100 text-blue-900 border-blue-300',
      pillBg: 'bg-blue-50 text-blue-800 border-blue-200',
      tag: 'Priority Household (PHH) • Subsidized Quota',
      quote:
        language === 'ta'
          ? '“முன்னுரிமை குடும்ப அட்டை மூலம் மாதாந்திர அத்தியாவசியப் பொருட்களை விரைவாக பெற முடிகிறது.”'
          : '“Transparent monthly commodity allocation with digital queue tokens and zero waiting time.”',
    },
    NPHH: {
      accent: 'from-emerald-600 to-teal-800',
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      pillBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      tag: 'Non-Priority Household (NPHH) • Standard Quota',
      quote:
        language === 'ta'
          ? '“நியாய விலைக் கடையில் தரமான அரிசி மற்றும் சர்க்கரை தடையின்றி கிடைக்கிறது.”'
          : '“Accessing high-grade subsidized commodities conveniently through scheduled appointments.”',
    },
  };

  const theme = cardThemes[card.cardType] || cardThemes.PHH;
  const totalFamilyMembers = (card.members?.length || 0) + 1;

  // Monthly commodities breakdown
  const quotaItems = [
    {
      name: t('rice'),
      nameTa: 'அரிசி',
      amount: card.monthlyEntitlement?.riceKg || 20,
      unit: 'kg',
      price: 'Free (₹0)',
      savings: '₹640 saved',
      progress: isCollectedThisMonth ? 100 : 0,
      color: 'bg-blue-600',
      icon: '🌾',
    },
    {
      name: t('wheat'),
      nameTa: 'கோதுமை',
      amount: card.monthlyEntitlement?.wheatKg || 5,
      unit: 'kg',
      price: '₹2 / kg',
      savings: '₹140 saved',
      progress: isCollectedThisMonth ? 100 : 0,
      color: 'bg-amber-600',
      icon: '🥖',
    },
    {
      name: t('sugar'),
      nameTa: 'சர்க்கரை',
      amount: card.monthlyEntitlement?.sugarKg || 2,
      unit: 'kg',
      price: '₹13.50 / kg',
      savings: '₹60 saved',
      progress: isCollectedThisMonth ? 100 : 0,
      color: 'bg-teal-600',
      icon: '🧂',
    },
    {
      name: t('kerosene'),
      nameTa: 'மண்ணெண்ணெய்',
      amount: card.monthlyEntitlement?.keroseneLitre || 1,
      unit: 'L',
      price: '₹15 / L',
      savings: '₹55 saved',
      progress: isCollectedThisMonth ? 100 : 0,
      color: 'bg-cyan-600',
      icon: '🪔',
    },
    {
      name: t('dal'),
      nameTa: 'துவரம் பருப்பு',
      amount: card.monthlyEntitlement?.dalKg || 1,
      unit: 'kg',
      price: '₹30 / kg',
      savings: '₹120 saved',
      progress: isCollectedThisMonth ? 100 : 0,
      color: 'bg-indigo-600',
      icon: '🥣',
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/80 overflow-hidden space-y-0">
      {/* 1. FIGMA PERSONA HEADER: CITIZEN PROFILE & MOTTO */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/80 via-white to-white border-b border-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Persona Avatar */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md border-2 border-white ring-2 ring-blue-100">
                {card.headOfFamily?.name ? card.headOfFamily.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"
                title="Active & Verified"
              >
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            {/* Persona Identity & Demographics */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {t('headOfFamily')}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${theme.badge}`}
                >
                  {card.cardType}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {card.headOfFamily?.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-mono">
                  Aadhaar: XXXX-XXXX-{card.headOfFamily?.aadhaarLast4 || 'XXXX'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  {totalFamilyMembers} {language === 'ta' ? 'உறுப்பினர்கள்' : 'Family Members'}
                </span>
              </p>
            </div>
          </div>

          {/* Monthly Collection Pill Indicator */}
          <div className="flex-shrink-0 self-start sm:self-center">
            <div
              className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-xs border ${
                isCollectedThisMonth
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {isCollectedThisMonth ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ta' ? 'இம்மாத ஒதுக்கீடு பெறப்பட்டது' : 'Quota Collected for Month'}</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{language === 'ta' ? 'இம்மாத ஒதுக்கீடு தயார்' : 'Ready for Slot Booking'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Persona Quote Banner (Hiking App Persona style quote) */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs italic flex items-start gap-2.5">
          <span className="text-lg leading-none select-none text-blue-500">“</span>
          <p className="flex-1 font-medium leading-relaxed">{theme.quote}</p>
        </div>

        {/* Persona Demographic Pill Badges */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>{theme.tag}</span>
          </span>
          {card.fpsId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {card.fpsId.taluk}, {card.fpsId.district}
              </span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aadhaar Biometric Linked</span>
          </span>
        </div>
      </div>

      {/* 2. DIGITAL SMART CARD SURFACE GRAPHIC */}
      <div className="p-6 sm:p-8 bg-slate-50/50">
        <div className="max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-gov-navy to-blue-950 p-6 text-white shadow-xl relative overflow-hidden border border-slate-700">
          {/* Subtle Watermark Overlay */}
          <div className="absolute right-2 -bottom-4 text-8xl opacity-5 select-none pointer-events-none">
            🌾
          </div>
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Top Row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-7 rounded bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-200 flex items-center justify-center p-0.5 shadow">
                <div className="w-full h-full border border-amber-700/60 rounded-xs grid grid-cols-2 gap-0.5">
                  <div className="border-r border-b border-amber-700/60"></div>
                  <div className="border-b border-amber-700/60"></div>
                  <div className="border-r border-amber-700/60"></div>
                  <div></div>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-blue-200">
                  Government of Tamil Nadu
                </p>
                <p className="text-xs font-extrabold tracking-wide text-white">
                  SMART FAMILY RATION CARD
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-md border border-white/30 uppercase tracking-wider">
              {card.cardType}
            </span>
          </div>

          {/* 12-Digit Smart Card Number */}
          <div className="mt-6 mb-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-300 uppercase tracking-widest font-mono">
                {t('cardNumber')}
              </span>
              <button
                type="button"
                onClick={handleCopyCard}
                className="flex items-center gap-1 text-[11px] text-blue-200 hover:text-white transition px-2 py-0.5 rounded-md hover:bg-white/10"
                title="Copy Card Number"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white mt-0.5 drop-shadow">
              {formatCardNumber(card.cardNumber)}
            </p>
          </div>

          {/* Card Footer Strip: Head of family & FPS code */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/15 text-[11px] relative z-10">
            <div>
              <p className="text-white/60 uppercase text-[9px] font-medium">{t('headOfFamily')}</p>
              <p className="font-bold text-white truncate">{card.headOfFamily?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 uppercase text-[9px] font-medium">Fair Price Shop ID</p>
              <p className="font-mono font-bold text-emerald-300">
                {card.fpsId?.fpsCode || 'FPS-TN-DEFAULT'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FIGMA PERSONA SECTION: MONTHLY ENTITLEMENT ALLOCATION & SAVINGS */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('monthlyQuota')} & Subsidized Welfare</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Guaranteed food commodities allocated per household under the National Food Security Act (NFSA)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Total Subsidized Payable:</span>
            <span className="text-sm font-black text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              ₹{card.monthlyEntitlement?.subsidizedTotalAmount || 40}
            </span>
          </div>
        </div>

        {/* Commodity Cards with Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {quotaItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-300 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.price}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-xs">
                  {language === 'ta' ? item.nameTa : item.name}
                </h5>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">{item.amount}</span>
                  <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>Status</span>
                  <span
                    className={
                      isCollectedThisMonth ? 'text-emerald-600 font-bold' : 'text-blue-700'
                    }
                  >
                    {isCollectedThisMonth ? 'Collected' : 'Allocated'}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      isCollectedThisMonth ? 'bg-emerald-500' : 'bg-blue-600'
                    } rounded-full transition-all duration-500`}
                    style={{ width: isCollectedThisMonth ? '100%' : '100%' }}
                  ></div>
                </div>
                <p className="text-[10px] font-bold text-emerald-600 text-right mt-1">
                  {item.savings}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. FIGMA PERSONA SECTION: HOUSEHOLD DEMOGRAPHICS & FAMILY MEMBERS */}
        <div className="pt-2">
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-700" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Registered Household Family Members ({totalFamilyMembers})
                </h5>
              </div>

              <button
                type="button"
                onClick={() => setShowMembers(!showMembers)}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <span>{showMembers ? 'Collapse' : 'View Members'}</span>
                {showMembers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Always display quick avatars row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Head of Family Chip */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-100/70 border border-blue-200 text-xs font-bold text-blue-900">
                <div className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">
                  {card.headOfFamily?.name?.charAt(0) || 'H'}
                </div>
                <span>{card.headOfFamily?.name} (Head)</span>
                <span className="text-[10px] text-blue-600 font-mono">
                  •••• {card.headOfFamily?.aadhaarLast4}
                </span>
              </div>

              {/* Members Preview */}
              {card.members &&
                card.members.map((m, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {m.name?.charAt(0) || 'M'}
                    </div>
                    <span>{m.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">({m.relationship})</span>
                  </div>
                ))}
            </div>

            {/* Expanded Members Table */}
            {showMembers && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="pb-2">Member Name</th>
                      <th className="pb-2">Relationship</th>
                      <th className="pb-2">Aadhaar Status</th>
                      <th className="pb-2 text-right">Biometric Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="font-semibold text-slate-900">
                      <td className="py-2.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        {card.headOfFamily?.name}
                      </td>
                      <td className="py-2.5 text-blue-700 font-bold">Head of Household</td>
                      <td className="py-2.5 font-mono text-slate-600">
                        XXXX-XXXX-{card.headOfFamily?.aadhaarLast4}
                      </td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">Verified</td>
                    </tr>
                    {card.members?.map((m, i) => (
                      <tr key={i} className="text-slate-700">
                        <td className="py-2.5 pl-4">{m.name}</td>
                        <td className="py-2.5 capitalize">{m.relationship}</td>
                        <td className="py-2.5 font-mono text-slate-500">
                          XXXX-XXXX-{m.aadhaarLast4}
                        </td>
                        <td className="py-2.5 text-right text-emerald-600 font-semibold">
                          Verified
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 5. FIGMA PERSONA SECTION: LINKED FAIR PRICE SHOP CARD */}
        {card.fpsId && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-slate-50 border border-blue-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-blue-950 text-sm">
                    {card.fpsId.shopName}
                  </span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-200/70 text-blue-900">
                    {card.fpsId.fpsCode}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                  {card.fpsId.address} • {card.fpsId.taluk}, {card.fpsId.district}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span className="text-[11px] font-bold text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
                Operating 09:00 - 18:00
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RationCardCard;