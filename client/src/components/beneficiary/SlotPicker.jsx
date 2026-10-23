import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { Calendar, Clock, AlertCircle, CheckCircle2, Users, Check } from 'lucide-react';

const SlotPicker = ({ shopId, selectedSlot, onSelectSlot }) => {
  const { language, t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [slotsData, setSlotsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shopId || !selectedDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/shops/${shopId}/slots?date=${selectedDate}`);
        if (res.data.success) {
          setSlotsData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load available slots for this date.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [shopId, selectedDate]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateStr = maxDate.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Date Selector Container */}
      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
          {t('date')}
        </label>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="date"
            min={todayStr}
            max={maxDateStr}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              onSelectSlot(null, e.target.value);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs"
          />
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'அடுத்த 14 நாட்களுக்குள் 15 நிமிட நேர இடைவெளியைத் தேர்ந்தெடுக்கலாம்.'
              : 'Choose a date within the next 14 days to view open 15-minute collection windows.'}
          </p>
        </div>
      </div>

      {/* Slots Loading / Error States */}
      {loading && <LoadingSpinner size="md" text="Loading 15-minute slot capacity..." />}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Slots Grid */}
      {!loading && !error && slotsData && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>{t('slotTime')}</span>
              <span className="text-[11px] font-normal text-slate-500 normal-case">
                ({slotsData.slots.filter((s) => s.isAvailable).length} available windows)
              </span>
            </h4>

            {/* Legend */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>{t('available')}</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Selected</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span>Full</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {slotsData.slots.map((slot) => {
              const isSelected = selectedSlot === slot.slotTime;
              const isAvailable = slot.isAvailable;

              return (
                <button
                  key={slot.slotTime}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onSelectSlot(slot.slotTime, selectedDate)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600 border-blue-700 text-white shadow-md ring-2 ring-blue-300'
                      : isAvailable
                      ? 'bg-emerald-50/50 hover:bg-emerald-100/70 border-emerald-200 text-slate-800 hover:border-emerald-400 cursor-pointer shadow-2xs'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs sm:text-sm font-mono tracking-tight">
                      {slot.slotTime}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        isSelected ? 'text-blue-100' : isAvailable ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>
                        {isAvailable ? `${slot.remainingCapacity} spots left` : 'Full'}
                      </span>
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">
                      Max {slot.totalCapacity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;