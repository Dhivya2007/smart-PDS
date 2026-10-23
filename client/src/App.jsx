import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Public Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Beneficiary Pages
import BeneficiaryDashboard from './pages/beneficiary/BeneficiaryDashboard.jsx';
import CardVerificationPage from './pages/beneficiary/CardVerificationPage.jsx';
import BookSlotPage from './pages/beneficiary/BookSlotPage.jsx';
import MyBookingsPage from './pages/beneficiary/MyBookingsPage.jsx';
import PurchaseHistoryPage from './pages/beneficiary/PurchaseHistoryPage.jsx';

// Shop Owner Pages
import ShopDashboard from './pages/shop/ShopDashboard.jsx';
import VerifyDistributePage from './pages/shop/VerifyDistributePage.jsx';
import StockManagementPage from './pages/shop/StockManagementPage.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageUsersPage from './pages/admin/ManageUsersPage.jsx';
import ManageShopsPage from './pages/admin/ManageShopsPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Beneficiary protected routes */}
                  <Route
                    path="/beneficiary/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                        <BeneficiaryDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/beneficiary/verify-card"
                    element={
                      <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                        <CardVerificationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/beneficiary/book-slot"
                    element={
                      <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                        <BookSlotPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/beneficiary/my-bookings"
                    element={
                      <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                        <MyBookingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/beneficiary/purchase-history"
                    element={
                      <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                        <PurchaseHistoryPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shop Owner protected routes */}
                  <Route
                    path="/shop/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                        <ShopDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shop/verify"
                    element={
                      <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                        <VerifyDistributePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shop/stock"
                    element={
                      <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
                        <StockManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin protected routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <ManageUsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/shops"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <ManageShopsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <ReportsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
