import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  Bell,
  Languages,
  LogOut,
  Menu,
  X,
  User,
  Store,
  ShieldCheck,
  Calendar,
  Package,
  QrCode,
  FileText,
  Home,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isBeneficiary, isShopOwner, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-gov-navy/95 backdrop-blur-md text-white shadow-md border-b border-blue-900/60">
      {/* Top Government Flag Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 border border-blue-400/40 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
              🌾
            </div>
            <div>
              <div className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                <span>Smart PDS</span>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {language === 'ta' ? 'தமிழ்நாடு' : 'Gov.in'}
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 hidden sm:block font-medium">
                {t('systemTitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-white/5 p-1 rounded-full border border-white/10">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('home')}</span>
            </Link>

            {isAuthenticated && isBeneficiary && (
              <>
                <Link
                  to="/beneficiary/dashboard"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive('/beneficiary/dashboard')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/beneficiary/book-slot"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    isActive('/beneficiary/book-slot')
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('bookSlot')}</span>
                </Link>
                <Link
                  to="/beneficiary/my-bookings"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive('/beneficiary/my-bookings')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t('myBookings')}
                </Link>
                <Link
                  to="/beneficiary/purchase-history"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    isActive('/beneficiary/purchase-history')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Receipts</span>
                </Link>
              </>
            )}

            {isAuthenticated && isShopOwner && (
              <>
                <Link
                  to="/shop/dashboard"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive('/shop/dashboard')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/shop/verify"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/shop/verify')
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{t('verifyToken')}</span>
                </Link>
                <Link
                  to="/shop/stock"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    isActive('/shop/stock')
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{t('stockManagement')}</span>
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive('/admin/dashboard')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive('/admin/users')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/shops"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive('/admin/shops')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Fair Price Shops
                </Link>
                <Link
                  to="/admin/reports"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive('/admin/reports')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Reports
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Tools: Language, Notifications, Persona Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Toggle Pill */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-white/10 hover:bg-white/20 text-blue-100 border border-white/15 transition shadow-2xs"
              title="Switch Language / மொழியை மாற்றுக"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 rounded-full hover:bg-white/10 text-blue-200 hover:text-white transition relative border border-transparent hover:border-white/10"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-sm ring-2 ring-gov-navy">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-xs uppercase tracking-wider text-slate-800">
                          {t('notifications')}
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-blue-600 hover:underline font-bold"
                        >
                          {t('markAllRead')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`p-3.5 text-xs hover:bg-slate-50 transition cursor-pointer ${
                              !n.isRead ? 'bg-blue-50/60' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <p className="font-bold text-slate-900 text-xs">
                                {language === 'ta' && n.titleTa ? n.titleTa : n.title}
                              </p>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                              {language === 'ta' && n.messageTa ? n.messageTa : n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: 'short',
                              })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated Persona Profile Chip or Sign-in */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 bg-white/5 pl-2 pr-1 py-1 rounded-full border border-white/10">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left pr-2">
                  <span className="text-xs font-bold text-white truncate max-w-[120px] leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-[9px] text-blue-300 uppercase font-semibold">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-full hover:bg-red-500/20 text-red-300 hover:text-red-100 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition border border-white/15"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-white/10 text-blue-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gov-navy border-t border-blue-900/60 px-4 pt-3 pb-5 space-y-1.5">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
          >
            {t('home')}
          </Link>
          {isAuthenticated && isBeneficiary && (
            <>
              <Link
                to="/beneficiary/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/beneficiary/book-slot"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-emerald-300 hover:bg-blue-800/60"
              >
                {t('bookSlot')}
              </Link>
              <Link
                to="/beneficiary/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
              >
                {t('myBookings')}
              </Link>
              <Link
                to="/beneficiary/purchase-history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
              >
                Digital Receipts
              </Link>
            </>
          )}

          {isAuthenticated && isShopOwner && (
            <>
              <Link
                to="/shop/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/shop/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-emerald-300 hover:bg-blue-800/60"
              >
                {t('verifyToken')}
              </Link>
              <Link
                to="/shop/stock"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-amber-300 hover:bg-blue-800/60"
              >
                {t('stockManagement')}
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/shops"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
              >
                Manage Shops
              </Link>
              <Link
                to="/admin/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-blue-800/60"
              >
                Reports
              </Link>
            </>
          )}

          {isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-300 hover:bg-red-900/40"
            >
              {t('logout')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;