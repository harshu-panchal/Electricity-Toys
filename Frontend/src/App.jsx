import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';

// Layouts
import { UserLayout } from './modules/user/layout/UserLayout';
import AdminLayout from './modules/admin/layout/AdminLayout';

// Module: User Pages
import { Home } from './modules/user/pages/Home';
import { Products } from './modules/user/pages/Products';
import { ProductDetail } from './modules/user/pages/ProductDetail';
import { Cart } from './modules/user/pages/Cart';
import { Wishlist } from './modules/user/pages/Wishlist';
import { About } from './modules/user/pages/About';
import { Contact } from './modules/user/pages/Contact';
import { Gallery } from './modules/user/pages/Gallery';
import { Experience } from './modules/user/pages/Experience';
import { Login } from './modules/user/pages/Auth/Login';
import { Signup } from './modules/user/pages/Auth/Signup';
import { VerifyOtp } from './modules/user/pages/Auth/VerifyOtp';
import { ForgotPassword } from './modules/user/pages/Auth/ForgotPassword';
import { VerifyResetOtp } from './modules/user/pages/Auth/VerifyResetOtp';
import { ResetPassword } from './modules/user/pages/Auth/ResetPassword';
import { Checkout } from './modules/user/pages/Checkout';
import { MyOrders } from './modules/user/pages/MyOrders';
import { OrderSuccess } from './modules/user/pages/OrderSuccess';
import PrivacyPolicy from './modules/user/pages/PrivacyPolicy';
import TermsOfService from './modules/user/pages/TermsOfService';
import RefundPolicy from './modules/user/pages/RefundPolicy';
import { Profile as UserProfile } from './modules/user/pages/Profile';
import { ToastManager } from './modules/user/components/Toast';
import ScrollToTop from './components/ScrollToTop';

// Module: Admin Pages
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import ProductList from './modules/admin/pages/Products/ProductList';
import ProductForm from './modules/admin/pages/Products/ProductForm';
import CategoryManager from './modules/admin/pages/Products/CategoryManager';
import OrderList from './modules/admin/pages/Orders/OrderList';
import OrderDetail from './modules/admin/pages/Orders/OrderDetail';
import ShippingSettings from './modules/admin/pages/ShippingSettings';
import Analytics from './modules/admin/pages/Analytics';
import Profile from './modules/admin/pages/Profile';
import Notifications from './modules/admin/pages/Notifications';
import AdminLogin from './modules/admin/pages/Auth/AdminLogin';
import AdminForgotPassword from './modules/admin/pages/Auth/AdminForgotPassword';
import AdminVerifyResetOtp from './modules/admin/pages/Auth/AdminVerifyResetOtp';
import AdminResetPassword from './modules/admin/pages/Auth/AdminResetPassword';

// Content Management
import { HomeContent } from './modules/admin/pages/Content/HomeContent';
import { AboutContent } from './modules/admin/pages/Content/AboutContent';

import { ContactContent } from './modules/admin/pages/Content/ContactContent';
import { ExperienceContent } from './modules/admin/pages/Content/ExperienceContent';
import LegalPagesManager from './modules/admin/pages/Content/LegalPagesManager';

// Placeholder for missing components
const Placeholder = ({ title, emoji = '🚧' }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center p-8">
    <span className="text-6xl animate-bounce">{emoji}</span>
    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-primary">{title}</h2>
    <p className="text-muted-foreground font-medium">This page is currently under construction.</p>
  </div>
);

const AboutContentEditor = () => <AboutContent />;
const ContactContentEditor = () => <ContactContent />;
const ExperienceContentEditor = () => <ExperienceContent />;

import { socket } from './lib/socket';
import { useAuthStore } from './modules/user/store/authStore';
import { useAdminAuthStore } from './modules/admin/store/adminAuthStore';
import { useNotificationStore } from './modules/user/store/notificationStore';
import UserNotifications from './modules/user/pages/Notifications';

// ================= ROUTE GUARDS =================
const RequireUserAuth = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

const RequireAdminAuth = ({ children }) => {
  const { isAuthenticated, admin } = useAdminAuthStore();
  const location = useLocation();

  // Strict check: must be authenticated AND have admin role
  if (!isAuthenticated || !admin || admin.role !== 'admin') {
    console.warn("Unauthorized access to admin route redirected to login");
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

const PublicAdminRoute = ({ children }) => {
  const { isAuthenticated, admin } = useAdminAuthStore();

  if (isAuthenticated && admin?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { addNotification, fetchNotifications } = useNotificationStore();

  React.useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Only connect if not already connected (or check logic)
      // socket.io-client auto-reconnects, but we need to ensure 'join'
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit("join", user._id);
      fetchNotifications();

      const handleNotification = (data) => {
        addNotification(data);
        // You could add a toast here
      };

      socket.on("notification", handleNotification);

      return () => {
        socket.off("notification", handleNotification);
      };
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [isAuthenticated, user]);

  return (
    <ToastManager>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<PublicAdminRoute><AdminLogin /></PublicAdminRoute>} />
          <Route path="/admin/forgot-password" element={<PublicAdminRoute><AdminForgotPassword /></PublicAdminRoute>} />
          <Route path="/admin/verify-reset-otp" element={<PublicAdminRoute><AdminVerifyResetOtp /></PublicAdminRoute>} />
          <Route path="/admin/reset-password" element={<PublicAdminRoute><AdminResetPassword /></PublicAdminRoute>} />

          {/* Admin Routes (Protected) */}
          <Route
            path="/admin"
            element={
              <RequireAdminAuth>
                <AdminLayout />
              </RequireAdminAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="shipping" element={<ShippingSettings />} />
            <Route path="analytics" element={<Analytics />} />

            {/* Content Management */}
            <Route path="content/home" element={<HomeContent />} />
            <Route path="content/about" element={<AboutContentEditor />} />
            <Route path="content/contact" element={<ContactContentEditor />} />

            <Route path="content/legal" element={<LegalPagesManager />} />

            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* User Routes */}
          <Route path="/" element={<UserLayout><Outlet /></UserLayout>}>
            <Route index element={<Experience />} />
            <Route path="home" element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route
              path="wishlist"
              element={
                <RequireUserAuth>
                  <Wishlist />
                </RequireUserAuth>
              }
            />
            <Route
              path="cart"
              element={
                <RequireUserAuth>
                  <Cart />
                </RequireUserAuth>
              }
            />
            <Route path="gallery" element={<Gallery />} />
            <Route path="experience" element={<Experience />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="verify-reset-otp" element={<VerifyResetOtp />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route
              path="checkout"
              element={
                <RequireUserAuth>
                  <Checkout />
                </RequireUserAuth>
              }
            />
            <Route
              path="orders"
              element={
                <RequireUserAuth>
                  <MyOrders />
                </RequireUserAuth>
              }
            />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="refund-policy" element={<RefundPolicy />} />
            <Route
              path="profile"
              element={
                <RequireUserAuth>
                  <UserProfile />
                </RequireUserAuth>
              }
            />
            <Route
              path="notifications"
              element={
                <RequireUserAuth>
                  <UserNotifications />
                </RequireUserAuth>
              }
            />
            <Route path="*" element={<Placeholder title="404 - Not Found" emoji="😵" />} />
          </Route>
        </Routes>
      </Router>
    </ToastManager>
  );
}

export default App;
