import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { StripeProvider } from "@/components/StripeProvider";

import Index from "./pages/Index";
import SearchPage from "./pages/Search";
import OrderPage from "./pages/Order";
import BookingPage from "./pages/Booking";
import QRMenuPage from "./pages/QRMenu";
import PaymentPage from "./pages/Payment";
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import FavoritesPage from "./pages/Favorites";
import BookingHistoryPage from "./pages/BookingHistory";
import BarDetailsPage from "./pages/BarDetails";
import ContactPage from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useScrollToTop(); // This will handle scroll-to-top on all route changes

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/order/:barId" element={<OrderPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/qr-menu/:barId" element={<QRMenuPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/booking-history" element={<BookingHistoryPage />} />
      <Route path="/bar-details/:barId" element={<BarDetailsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StripeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </StripeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
