import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import type { ReactNode } from "react";
import { AppProvider } from "@/context/AppContext";
import { ToastContainer } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";

import { Landing } from "@/pages/Landing";
import { StudentLogin } from "@/pages/student/Login";
import { StudentSignup } from "@/pages/student/Signup";
import { StudentOnboarding } from "@/pages/student/Onboarding";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import { CompanyLogin } from "@/pages/company/Login";
import { CompanyDetail } from "@/pages/company/Detail";
import { CompanyDashboard } from "@/pages/company/Dashboard";
import { AdminLogin } from "@/pages/admin/Login";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminCompanyReview } from "@/pages/admin/CompanyReview";
import { AdminAddCompany } from "@/pages/admin/AddCompany";
import { Explore } from "@/pages/student/Explore";
import { StudentProfile } from "@/pages/student/Profile";
import { InstitutionRegister } from "@/pages/institution/Register";
import { UniversityDashboard } from "@/pages/university/Dashboard";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { PlaceholderPage } from "@/pages/Placeholder";

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500 text-sm">Loading…</div>
    </div>
  );
}

function SessionGuard({ children }: { children: ReactNode }) {
  const { firebaseUser, role, loading, emailVerified } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) return <FullScreenLoader />;
  if (!firebaseUser) return <>{children}</>;

  // Admin bypasses email verification
  if (role === "admin") {
    if (path === "/" || path === "/admin/login") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Unverified non-admin users: only allow certain paths
  if (!emailVerified) {
    const unverifiedAllowedPaths = [
      "/",
      "/student/signup",
      "/verify-email",
      "/institution/register",
      "/student/login",
      "/company/login",
      "/admin/login",
      "/terms",
      "/privacy",
    ];
    if (!unverifiedAllowedPaths.includes(path)) {
      return <Navigate to="/verify-email" replace />;
    }
    return <>{children}</>;
  }

  // Verified non-admin user redirects
  if (role === "student") {
    if (
      path === "/" ||
      path.startsWith("/student/login") ||
      path.startsWith("/student/signup") ||
      path === "/verify-email"
    ) {
      return <Navigate to="/explore" replace />;
    }
  }

  if (role === "company") {
    if (path === "/" || path.startsWith("/company/login") || path === "/verify-email") {
      return <Navigate to="/company/dashboard" replace />;
    }
  }

  if (role === "university") {
    if (path === "/" || path === "/verify-email") {
      return <Navigate to="/university/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

function RequireRole({
  allowedRoles,
  children,
}: {
  allowedRoles: Array<"student" | "company" | "university" | "admin">;
  children: ReactNode;
}) {
  const { firebaseUser, role, loading, emailVerified } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!firebaseUser) return <Navigate to="/" replace state={{ from: location }} />;

  if (!role) return <FullScreenLoader />;

  // Admin bypasses email verification
  if (role === "admin") {
    if (allowedRoles.includes("admin")) {
      return <>{children}</>;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Non-admin: require email verification
  if (!emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!allowedRoles.includes(role)) {
    if (role === "company") return <Navigate to="/company/dashboard" replace />;
    if (role === "university") return <Navigate to="/university/dashboard" replace />;
    return <Navigate to="/explore" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <SessionGuard>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/signup" element={<StudentSignup />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/student/onboarding" element={<StudentOnboarding />} />
            <Route path="/company/login" element={<CompanyLogin />} />
            <Route path="/institution/register" element={<InstitutionRegister />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Student routes */}
            <Route
              path="/explore"
              element={
                <RequireRole allowedRoles={["student", "university"]}>
                  <Explore />
                </RequireRole>
              }
            />
            <Route
              path="/company/:id"
              element={
                <RequireRole allowedRoles={["student", "university", "admin"]}>
                  <CompanyDetail />
                </RequireRole>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireRole allowedRoles={["student"]}>
                  <StudentProfile />
                </RequireRole>
              }
            />

            {/* Company routes */}
            <Route
              path="/company/dashboard"
              element={
                <RequireRole allowedRoles={["company"]}>
                  <CompanyDashboard />
                </RequireRole>
              }
            />
                        <Route
              path="/company/profile/complete"
              element={
                <RequireRole allowedRoles={["company"]}>
                  <InstitutionRegister mode="complete" />
                </RequireRole>
              }
            />

            {/* University routes */}
            <Route
              path="/university/dashboard"
              element={
                <RequireRole allowedRoles={["university"]}>
                  <UniversityDashboard />
                </RequireRole>
              }
            />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/admin/company/:id"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <AdminCompanyReview />
                </RequireRole>
              }
            />
            <Route
              path="/admin/add-company"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <AdminAddCompany />
                </RequireRole>
              }
            />

            {/* Placeholder */}
            <Route
              path="/university/:id"
              element={
                <RequireRole allowedRoles={["student", "university", "admin"]}>
                  <PlaceholderPage
                    title="University profile"
                    description="Public university profile page."
                    ctaLabel="Back to home"
                    ctaTo="/"
                  />
                </RequireRole>
              }
            />
          </Routes>
        </SessionGuard>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;