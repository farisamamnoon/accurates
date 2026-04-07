import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Index from "./pages/quotations/Index.tsx";
import QuotationCreate from "./pages/quotations/Create.tsx";
import QuotationViewPage from "./pages/quotations/View.tsx";
import Products from "./pages/products/Index.tsx";
import ProductsCreate from "./pages/products/Create.tsx";
import Navbar from "./components/Layout.tsx";
import DeliveriesPage from "./pages/delivery/Index.tsx";
import DeliveryCreatePage from "./pages/delivery/Create.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Navbar />}>
            {/* ✅ default route */}
            <Route path="/" element={<Navigate to="/quotations" replace />} />

            {/* Quotations */}
            <Route path="/quotations" element={<Index />} />
            <Route path="/quotations/create" element={<QuotationCreate />} />
            <Route path="/quotations/:id" element={<QuotationViewPage />} />

            {/* Products */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/create" element={<ProductsCreate />} />

            {/* Products */}
            <Route path="/delivery" element={<DeliveriesPage />} />
            <Route path="/delivery/create" element={<DeliveryCreatePage />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
