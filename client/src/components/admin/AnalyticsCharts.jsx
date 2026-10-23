import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#d97706', '#2563eb', '#059669', '#7c3aed', '#db2777'];

const AnalyticsCharts = ({ charts }) => {
  if (!charts) return null;

  const { cardsByType = [], commodityBreakdown = [], dailyDistributionTrend = [] } = charts;

  const commodityData = commodityBreakdown.map((item) => ({
    commodity: item._id,
    quantity: item.totalQuantity,
    unit: item.unit,
  }));

  const cardData = cardsByType.map((item) => ({
    name: item.type,
    value: item.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Daily Distribution Trend */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90">
        <h3 className="font-black text-sm text-slate-900 mb-1">Daily Distribution Activity</h3>
        <p className="text-xs text-slate-500 mb-5">
          Beneficiary collections across Fair Price Shops over the recent 7-day period
        </p>
        <div className="h-64">
          {dailyDistributionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyDistributionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="distributions"
                  name="Distributions"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No recent distribution data to plot
            </div>
          )}
        </div>
      </div>

      {/* 2. Commodity Volume Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90">
        <h3 className="font-black text-sm text-slate-900 mb-1">
          Commodity Volume Disbursed (Current Month)
        </h3>
        <p className="text-xs text-slate-500 mb-5">Total aggregate metric quantities distributed by commodity</p>
        <div className="h-64">
          {commodityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commodityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="commodity" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantity" name="Quantity Distributed" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No commodity distribution data for this month
            </div>
          )}
        </div>
      </div>

      {/* 3. Ration Card Type Distribution */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 lg:col-span-2">
        <h3 className="font-black text-sm text-slate-900 mb-1">Ration Cards by Category</h3>
        <p className="text-xs text-slate-500 mb-5">
          Breakdown of Antyodaya Anna Yojana (AAY), Priority Household (PHH), Non-Priority Household (NPHH)
        </p>
        <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cardData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {cardData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;