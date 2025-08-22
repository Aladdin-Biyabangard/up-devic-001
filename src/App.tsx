import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/layout/Navigation";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import CourseDetailPage from "./pages/CourseDetailPage";
import LessonPage from "./pages/LessonPage";
import TeacherPanelPage from "./pages/TeacherPanelPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import StudentPanelPage from "./pages/StudentPanelPage";
import WishlistPage from "./pages/WishlistPage";
import DashboardPage from "./pages/DashboardPage";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import { TeacherProfile } from "./components/teacher/TeacherProfile";
import { WishlistProvider } from "./contexts/WishlistContext";
import { NavigationUtils } from "@/utils/navigation";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types/user";

const queryClient = new QueryClient();

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuToggle={() => setSidebarOpen(true)}
        onSearch={(query) => {
          NavigationUtils.searchCourses(query, navigate);
        }}
      />
      
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0">
          <SidebarNavigation onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/teachers/:teacherId" element={<TeacherProfilePage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/payment/status" element={<PaymentStatusPage />} />
          <Route path="/teacher" element={<TeacherPanelPage />} />
          <Route path="/student" element={<StudentPanelPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminRoute user={user} />} />
          <Route path="/profile" element={<TeacherProfile />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/auth" element={<AuthPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

function AdminRoute({ user }: { user: User | null }) {
  const roles: string[] = Array.isArray(user?.role)
    ? (user?.role as string[])
    : (user?.roles || JSON.parse(localStorage.getItem('auth_roles') || '[]'));
  if (!user || !roles.includes('ROLE_ADMIN')) {
    return <Navigate to="/auth" replace />;
  }
  return <AdminPanelPage />;
}
