import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { KioskProvider } from "./contexts/KioskContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import KioskOnePage from "./pages/KioskOnePage";
import KioskTwoPage from "./pages/KioskTwoPage";
import KioskThreePage from "./pages/KioskThreePage";

import AdminDashboardPage from "./pages/AdminDashboardPage";

import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <KioskProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route 
                path="/teacher" 
                element={
                  <ProtectedRoute>
                    <TeacherDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/kiosk1" element={<ProtectedRoute><KioskOnePage /></ProtectedRoute>} />
              <Route path="/kiosk2" element={<ProtectedRoute><KioskTwoPage /></ProtectedRoute>} />
              <Route path="/kiosk3" element={<ProtectedRoute><KioskThreePage /></ProtectedRoute>} />
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </KioskProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
