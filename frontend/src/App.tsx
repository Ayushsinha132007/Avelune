import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { AssistantProvider } from './context/AssistantContext';
import { RootLayout } from './layouts/RootLayout';
import { AccountLayout } from './layouts/AccountLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CartPage } from './pages/CartPage';
import { OffersPage } from './pages/OffersPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailedPage } from './pages/PaymentFailedPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { GoogleCallbackPage } from './pages/GoogleCallbackPage';

// Authenticated Pages
import { AccountHomePage } from './pages/account/AccountHomePage';
import { OrdersPage } from './pages/account/OrdersPage';
import { WishlistPage } from './pages/account/WishlistPage';
import { ProfilePage } from './pages/account/ProfilePage';

// Admin Executive Suite
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

import { CategoryType } from './types';
import { scrollToSection } from './utils/scroll';

export const AppContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  const handleNavigateSection = (sectionId: string) => {
    scrollToSection(sectionId, 80);
  };

  return (
    <Routes>
      {/* Public Storefront Home Route */}
      <Route
        path="/"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <HomePage
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onClearCategory={handleClearCategory}
            />
          </RootLayout>
        }
      />

      {/* Dedicated Collections & Catalogue Explorer Route */}
      <Route
        path="/collections"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <CollectionsPage />
          </RootLayout>
        }
      />
      <Route
        path="/collections/:gender"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <CollectionsPage />
          </RootLayout>
        }
      />

      {/* Shopping Bag / Cart Route */}
      <Route
        path="/cart"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <CartPage />
          </RootLayout>
        }
      />

      {/* Offers & Special Picks Route */}
      <Route
        path="/offers"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <OffersPage />
          </RootLayout>
        }
      />

      {/* Production-Ready Secure Checkout & Payment Routes */}
      <Route
        path="/checkout"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <CheckoutPage />
          </RootLayout>
        }
      />
      <Route
        path="/payment/success"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <PaymentSuccessPage />
          </RootLayout>
        }
      />
      <Route
        path="/payment/failed"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <PaymentFailedPage />
          </RootLayout>
        }
      />

      {/* Guest-Only Authentication Routes (Redirect to /account/home if already signed in) */}
      <Route
        path="/login"
        element={
          <ProtectedRoute guestOnly>
            <LoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <ProtectedRoute guestOnly>
            <SignupPage />
          </ProtectedRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* Authenticated Account Routes (Protected - Redirect to /login if unauthenticated) */}
      <Route
        path="/account/home"
        element={
          <ProtectedRoute>
            <AccountLayout>
              <AccountHomePage />
            </AccountLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/orders"
        element={
          <ProtectedRoute>
            <AccountLayout>
              <OrdersPage />
            </AccountLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/wishlist"
        element={
          <ProtectedRoute>
            <AccountLayout>
              <WishlistPage />
            </AccountLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/profile"
        element={
          <ProtectedRoute>
            <AccountLayout>
              <ProfilePage />
            </AccountLayout>
          </ProtectedRoute>
        }
      />

      {/* Account Root Redirect */}
      <Route path="/account" element={<Navigate to="/account/home" replace />} />

      {/* Atelier Director Suite (Strictly restricted to ayushsinha53467@gmail.com) */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        }
      />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

      {/* Fallback Route */}
      <Route
        path="*"
        element={
          <RootLayout
            onSelectCategory={handleSelectCategory}
            onNavigateSection={handleNavigateSection}
          >
            <HomePage
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onClearCategory={handleClearCategory}
            />
          </RootLayout>
        }
      />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider>
          <AssistantProvider>
            <AppContent />
          </AssistantProvider>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
