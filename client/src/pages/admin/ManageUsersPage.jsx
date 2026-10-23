import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { Users, Search, UserCheck, UserX, AlertCircle, Shield } from 'lucide-react';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        limit: 15,
        search,
        ...(roleFilter ? { role: roleFilter } : {}),
      });

      const res = await api.get(`/admin/users?${query}`);
      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    setTogglingId(user._id);
    try {
      const res = await api.patch(`/admin/users/${user._id}/toggle-status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: res.data.user.isActive } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </span>
          <span>User & Persona Governance</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, search, authorize, and govern citizen, shop owner, and department administrator accounts
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:w-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by citizen name, email, phone, or 12-digit ration card..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-sm transition"
          >
            Search
          </button>
        </form>

        <div className="w-full sm:w-auto flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500">Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Roles</option>
            <option value="BENEFICIARY">Citizen Beneficiary</option>
            <option value="SHOP_OWNER">FPS Shop Owner</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" text="Loading users..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Name & Persona</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Card / Shop Ref</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{u.phone}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {u.rationCardNumber || (u.shopId ? 'Assigned FPS' : '—')}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'SHOP_OWNER' && !u.isApproved ? (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                          Pending Approval
                        </span>
                      ) : (
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      {u.role === 'SHOP_OWNER' && !u.isApproved && (
                        <button
                          disabled={togglingId === u._id}
                          onClick={async () => {
                            setTogglingId(u._id);
                            try {
                              const res = await api.patch(`/admin/users/${u._id}/approve`);
                              if (res.data.success) {
                                setUsers((prev) =>
                                  prev.map((usr) =>
                                    usr._id === u._id
                                      ? { ...usr, isApproved: true, isActive: true, approvalStatus: 'APPROVED' }
                                      : usr
                                  )
                                );
                              }
                            } catch (err) {
                              alert(err.response?.data?.message || 'Approval failed');
                            } finally {
                              setTogglingId(null);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black shadow-sm transition"
                        >
                          Approve Shop Owner
                        </button>
                      )}
                      {u.role !== 'ADMIN' && (
                        <button
                          disabled={togglingId === u._id}
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition ${
                            u.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {togglingId === u._id
                            ? '...'
                            : u.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl disabled:opacity-50 font-bold"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl disabled:opacity-50 font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;