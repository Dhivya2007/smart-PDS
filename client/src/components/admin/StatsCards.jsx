import React from 'react';
import { Users, Store, CreditCard, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';

const StatsCards = ({ metrics }) => {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Beneficiaries',
      value: metrics.totalBeneficiaries,
      subtext: `${metrics.totalRationCards} Active Cards`,
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Active FPS Shops',
      value: metrics.totalShops,
      subtext: 'Statewide network',
      icon: Store,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Monthly Disbursals',
      value: metrics.monthlyDistributionsCount,
      subtext: `Cycle: ${metrics.currentMonth}`,
      icon: CheckCircle2,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      title: 'Active Slots Today',
      value: metrics.activeBookingsToday,
      subtext: 'Scheduled appointments',
      icon: Calendar,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Revenue Collected',
      value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`,
      subtext: 'Subsidized proceeds',
      icon: CreditCard,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all border border-slate-200/90 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-2xl ${card.iconBg} border flex items-center justify-center`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;