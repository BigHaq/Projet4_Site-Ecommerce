import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { ToastContainer } from './components/ui/Toast.jsx';
import { ProtectedRoute, GuestRoute } from './components/routing/ProtectedRoute.jsx';
import { Suspense, lazy } from 'react';
import { FullPageSpinner } from './components/ui/Spinner.jsx';

// Lazy loading des pages
const Home = lazy(() => import('./pages/Home.jsx'));
const Catalogue = lazy(() => import('./pages/Catalogue.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const PaymentWaiting = lazy(() => import('./pages/PaymentWaiting.jsx'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Layout principal avec Navbar + Footer
function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-var(--nav-height))]">{children}</div>
      <Footer />
    </>
  );
}

// Layout minimaliste sans Footer (checkout, paiement)
function MinimalLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-var(--nav-height))]">{children}</div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          {/* Pages publiques avec layout complet */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/catalogue" element={<MainLayout><Catalogue /></MainLayout>} />
          <Route path="/produit/:id" element={<MainLayout><ProductDetail /></MainLayout>} />

          {/* Authentification — pleine page sans Navbar/Footer */}
          <Route path="/auth" element={
            <GuestRoute><Auth /></GuestRoute>
          } />

          {/* Pages protégées — checkout */}
          <Route path="/checkout" element={
            <ProtectedRoute><MinimalLayout><Checkout /></MinimalLayout></ProtectedRoute>
          } />

          {/* Paiement en attente — sans Footer */}
          <Route path="/payment-waiting/:orderId" element={
            <ProtectedRoute><PaymentWaiting /></ProtectedRoute>
          } />

          {/* Confirmation commande */}
          <Route path="/order-confirmation/:orderId" element={
            <ProtectedRoute><MainLayout><OrderConfirmation /></MainLayout></ProtectedRoute>
          } />

          {/* Dashboard utilisateur */}
          <Route path="/dashboard" element={
            <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
          } />
          <Route path="/dashboard/orders" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard initialTab="orders" />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
