import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductFormPage } from '@/pages/ProductFormPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { POSPage } from '@/pages/POSPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import {
  StockEtatPage,
  StockAlertesPage,
  StockMouvementsPage,
  StockScannerPage,
  StockReceptionPage,
  StockInventairesPage,
  StockCommandesPage,
} from '@/pages/stock';

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products/new"
          element={
            <ProtectedRoute>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products/:id/edit"
          element={
            <ProtectedRoute>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        {/* Gestion Stock - Routes avec sidebar interne */}
        <Route
          path="/dashboard/gestion-stock"
          element={
            <ProtectedRoute>
              <StockEtatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gestion-stock/alertes"
          element={
            <ProtectedRoute>
              <StockAlertesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gestion-stock/mouvements"
          element={
            <ProtectedRoute>
              <StockMouvementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gestion-stock/scanner"
          element={
            <ProtectedRoute>
              <StockScannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gestion-stock/inventaires"
          element={
            <ProtectedRoute>
              <StockInventairesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gestion-stock/commandes"
          element={
            <ProtectedRoute>
              <StockCommandesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/gestion-stock/reception"
          element={
            <ProtectedRoute>
              <StockReceptionPage />
            </ProtectedRoute>
          }
        />
        {/* Fournisseurs */}
        <Route
          path="/dashboard/suppliers"
          element={
            <ProtectedRoute>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />
        {/* Redirects pour anciennes URLs */}
        <Route path="/dashboard/stock" element={<Navigate to="/dashboard/gestion-stock" replace />} />
        <Route path="/dashboard/inventory" element={<Navigate to="/dashboard/gestion-stock/inventaires" replace />} />
        <Route path="/dashboard/commandes-fournisseur" element={<Navigate to="/dashboard/gestion-stock/commandes" replace />} />
        <Route
          path="/dashboard/pos"
          element={
            <ProtectedRoute>
              <POSPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
