import { useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/src/context/AuthContext';
import { AppStateProvider } from '@/src/context/AppStateContext';
import { AppErrorBoundary } from '@/src/components/shared/StatePanels';
import { GeminiChatDrawer } from '@/src/components/shared/GeminiChatDrawer';
import { PublicLayout } from '@/src/layouts/PublicLayout';
import { CustomerLayout } from '@/src/layouts/CustomerLayout';
import {
  AdminLayout,
  ManagerLayout,
} from '@/src/layouts/WorkspaceSidebarLayout';
import { Button } from '@/src/components/ui/button';

// Public pages
import { HomePage } from '@/src/pages/public/HomePage';
import { ExplorePage } from '@/src/pages/public/ExplorePage';
import { HotelDetailPage } from '@/src/pages/public/HotelDetailPage';
import { AiDiscoverPage } from '@/src/pages/public/AiDiscoverPage';
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
} from '@/src/pages/public/AuthPages';
import {
  AboutPage,
  CancellationPolicyPage,
  ContactPage,
  HelpPage,
  PrivacyPage,
  TermsPage,
} from '@/src/pages/public/InfoPages';

// Customer pages
import {
  BookingConfirmationPage,
  CheckoutPage,
  PaymentPage,
} from '@/src/pages/customer/CheckoutPages';
import {
  CustomerBookingDetailPage,
  CustomerBookingsPage,
  CustomerDashboardPage,
  CustomerNotificationsPage,
  CustomerPaymentsPage,
  CustomerProfilePage,
  CustomerRecentPage,
  CustomerSavedPage,
  CustomerSettingsPage,
} from '@/src/pages/customer/CustomerDashboardPages';

// Manager pages
import {
  ManagerAvailabilityPage,
  ManagerOnboardingPage,
  ManagerOverviewPage,
  ManagerPricingPage,
  ManagerRoomsPage,
} from '@/src/pages/manager/ManagerCorePages';
import {
  ManagerAiInsightsPage,
  ManagerBookingsPage,
  ManagerGuestsPage,
  ManagerPromotionsPage,
  ManagerRevenuePage,
  ManagerReviewsPage,
  ManagerSettingsPage,
  ManagerStaffPage,
} from '@/src/pages/manager/ManagerOperationsPages';

// Admin pages
import {
  AdminAnalyticsPage,
  AdminBookingsPage,
  AdminHotelsPage,
  AdminUsersPage,
  AdminVerificationPage,
} from '@/src/pages/admin/AdminCorePages';
import {
  AdminCommissionPage,
  AdminComplaintsPage,
  AdminHealthAuditPage,
  AdminPaymentsPage,
  AdminRefundsPage,
} from '@/src/pages/admin/AdminGovernancePages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="font-tabular text-xs font-medium text-primary">404</div>
      <h1 className="mt-2 font-display text-3xl font-medium text-navy">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The StayAI route you requested does not exist or has moved.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/explore">Explore Stays</Link>
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppStateProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster position="bottom-right" richColors />
            <Routes>
              {/* Public & Shared Discovery / Checkout Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/hotels/:id" element={<HotelDetailPage />} />
                <Route path="/ai-discover" element={<AiDiscoverPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route
                  path="/cancellation-policy"
                  element={<CancellationPolicyPage />}
                />
                {/* Customer transactional routes */}
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment/:bookingId" element={<PaymentPage />} />
                <Route
                  path="/booking-confirmation/:bookingId"
                  element={<BookingConfirmationPage />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Customer Account Portal */}
              <Route path="/account" element={<CustomerLayout />}>
                <Route index element={<CustomerDashboardPage />} />
                <Route path="bookings" element={<CustomerBookingsPage />} />
                <Route
                  path="bookings/:bookingId"
                  element={<CustomerBookingDetailPage />}
                />
                <Route path="saved" element={<CustomerSavedPage />} />
                <Route path="recently-viewed" element={<CustomerRecentPage />} />
                <Route path="payments" element={<CustomerPaymentsPage />} />
                <Route
                  path="notifications"
                  element={<CustomerNotificationsPage />}
                />
                <Route path="profile" element={<CustomerProfilePage />} />
                <Route path="settings" element={<CustomerSettingsPage />} />
              </Route>

              {/* Hotel Manager Workspace */}
              <Route path="/manager" element={<ManagerLayout />}>
                <Route index element={<ManagerOverviewPage />} />
                <Route path="onboarding" element={<ManagerOnboardingPage />} />
                <Route path="rooms" element={<ManagerRoomsPage />} />
                <Route path="availability" element={<ManagerAvailabilityPage />} />
                <Route path="pricing" element={<ManagerPricingPage />} />
                <Route path="bookings" element={<ManagerBookingsPage />} />
                <Route path="guests" element={<ManagerGuestsPage />} />
                <Route path="reviews" element={<ManagerReviewsPage />} />
                <Route path="revenue" element={<ManagerRevenuePage />} />
                <Route path="promotions" element={<ManagerPromotionsPage />} />
                <Route path="staff" element={<ManagerStaffPage />} />
                <Route path="ai-insights" element={<ManagerAiInsightsPage />} />
                <Route path="settings" element={<ManagerSettingsPage />} />
              </Route>

              {/* Admin Governance Console */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminAnalyticsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="hotels" element={<AdminHotelsPage />} />
                <Route path="verification" element={<AdminVerificationPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="refunds" element={<AdminRefundsPage />} />
                <Route path="complaints" element={<AdminComplaintsPage />} />
                <Route path="commission" element={<AdminCommissionPage />} />
                <Route path="health" element={<AdminHealthAuditPage />} />
              </Route>
            </Routes>
            <GeminiChatDrawer />
          </BrowserRouter>
        </AppStateProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
