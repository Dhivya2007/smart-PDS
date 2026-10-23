import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { Store, PlusCircle, Search, Edit3, X, CheckCircle2, AlertCircle } from 'lucide-react';

const ManageShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editShop, setEditShop] = useState(null);
  const [formData, setFormData] = useState({
    fpsCode: '',
    shopName: '',
    shopNameTa: '',
    address: '',
    taluk: '',
    district: 'Chennai',
    pincode: '',
    contactNumber: '',
    slotCapacity: 6,
    open: '09:00',
    close: '18:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shops?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setShops(res.data.shops);
      }
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleOpenCreate = () => {
    setEditShop(null);
    setFormData({
      fpsCode: '',
      shopName: '',
      shopNameTa: '',
      address: '',
      taluk: '',
      district: 'Chennai',
      pincode: '',
      contactNumber: '',
      slotCapacity: 6,
      open: '09:00',
      close: '18:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (shop) => {
    setEditShop(shop);
    setFormData({
      fpsCode: shop.fpsCode,
      shopName: shop.shopName,
      shopNameTa: shop.shopNameTa || '',
      address: shop.address,
      taluk: shop.taluk,
      district: shop.district,
      pincode: shop.pincode,
      contactNumber: shop.contactNumber,
      slotCapacity: shop.slotCapacity || 6,
      open: shop.operatingHours?.open || '09:00',
      close: shop.operatingHours?.close || '18:00',
      lunchStart: shop.operatingHours?.lunchStart || '13:00',
      lunchEnd: shop.operatingHours?.lunchEnd || '14:00',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      fpsCode: formData.fpsCode,
      shopName: formData.shopName,
      shopNameTa: formData.shopNameTa,
      address: formData.address,
      taluk: formData.taluk,
      district: formData.district,
      pincode: formData.pincode,
      contactNumber: formData.contactNumber,
      slotCapacity: parseInt(formData.slotCapacity, 10),
      operatingHours: {
        open: formData.open,
        close: formData.close,
        lunchStart: formData.lunchStart,
        lunchEnd: formData.lunchEnd,
      },
    };

    try {
      if (editShop) {
        const res = await api.put(`/shops/${editShop._id}`, payload);
        if (res.data.success) {
          setSuccessMsg('Fair Price Shop updated successfully');
          setModalOpen(false);
          fetchShops();
        }
      } else {
        const res = await api.post('/shops', payload);
        if (res.data.success) {
          setSuccessMsg('New Fair Price Shop registered successfully');
          setModalOpen(false);
          fetchShops();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save shop details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </span>
            <span>Fair Price Shop Network Governance</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register and configure distribution centers, 15-minute slot capacity, and operating schedules
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Shop</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Search and Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchShops()}
              placeholder="Search shops by FPS Code, name, or taluk..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>
          <button
            onClick={fetchShops}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition"
          >
            Search
          </button>
        </div>

        {loading ? (
          <LoadingSpinner size="md" text="Loading shops..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">FPS Code</th>
                  <th className="py-3.5 px-4">Shop Name</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Slot Capacity</th>
                  <th className="py-3.5 px-4">Operating Hours</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-mono font-black text-blue-900">{s.fpsCode}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {s.shopName}
                      {s.shopNameTa && (
                        <p className="text-[11px] text-slate-500 font-normal">{s.shopNameTa}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {s.taluk}, {s.district}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{s.contactNumber}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <span className="bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        {s.slotCapacity || 6} / 15m
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {s.operatingHours?.open} - {s.operatingHours?.close}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 inline-flex"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Shop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
            <div className="bg-gov-navy text-white p-5 flex items-center justify-between">
              <h3 className="font-black text-sm">
                {editShop ? 'Edit Fair Price Shop Configuration' : 'Register New Fair Price Shop'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">FPS Code</label>
                  <input
                    type="text"
                    disabled={!!editShop}
                    value={formData.fpsCode}
                    onChange={(e) => setFormData({ ...formData, fpsCode: e.target.value })}
                    placeholder="e.g. FPS-TN-04-003"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Slot Capacity (Per 15 Min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.slotCapacity}
                    onChange={(e) => setFormData({ ...formData, slotCapacity: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Shop Name (English)</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="e.g. Fair Price Shop No. 12"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Shop Name (Tamil)</label>
                <input
                  type="text"
                  value={formData.shopNameTa}
                  onChange={(e) => setFormData({ ...formData, shopNameTa: e.target.value })}
                  placeholder="e.g. நியாய விலைக் கடை எண் 12"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street name, landmark..."
                  rows="2"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Taluk</label>
                  <input
                    type="text"
                    value={formData.taluk}
                    onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                    placeholder="e.g. Velachery"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="600042"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g. 044-22441122"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition"
                >
                  {submitting ? 'Saving...' : editShop ? 'Update Configuration' : 'Create FPS Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShopsPage;