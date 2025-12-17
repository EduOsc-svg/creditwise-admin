import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CustomerMaster from "./pages/CustomerMaster";
import CollectorManagement from "./pages/CollectorManagement";
import CouponIssuance from "./pages/CouponIssuance";
import CollectionBilling from "./pages/CollectionBilling";
import FinancialReports from "./pages/FinancialReports";
import CustomerHistory from "./pages/CustomerHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerMaster />} />
          <Route path="/collectors" element={<CollectorManagement />} />
          <Route path="/coupons" element={<CouponIssuance />} />
          <Route path="/collection" element={<CollectionBilling />} />
          <Route path="/reports" element={<FinancialReports />} />
          <Route path="/history" element={<CustomerHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
