import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ContentProvider } from "@/contexts/ContentContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense, useEffect } from "react";

const Index = lazy(() => import("./pages/Index"));
const Academics = lazy(() => import("./pages/Academics"));
const Gallery = lazy(() => import("./pages/Gallery"));
const CampusLife = lazy(() => import("./pages/CampusLife"));
const About = lazy(() => import("./pages/About"));
const Admission = lazy(() => import("./pages/Admission"));
const Admin = lazy(() => import("./pages/Admin"));
const Staff = lazy(() => import("./pages/Staff"));
const StaffAdmin = lazy(() => import("./pages/StaffAdmin"));
const PortalAdmin = lazy(() => import("./pages/PortalAdmin"));
const PortalAdminStudents = lazy(
  () => import("./pages/PortalAdminStudents"),
);
const PortalAdminStaff = lazy(() => import("./pages/PortalAdminStaff"));
const Auth = lazy(() => import("./pages/Auth"));
const PortalLogin = lazy(() => import("./pages/PortalLogin"));
const Portal = lazy(() => import("./pages/Portal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PortalStaffLayout = lazy(() => import("./pages/PortalStaffLayout"));
const PortalStaffDashboard = lazy(
  () => import("./pages/PortalStaffDashboard"),
);
const PortalLectures = lazy(() => import("./pages/PortalLectures"));
const PortalStaffAttendance = lazy(
  () => import("./pages/PortalStaffAttendance"),
);
const PortalStaffExam = lazy(() => import("./pages/PortalStaffExam"));
const PortalStaffRatings = lazy(() => import("./pages/PortalStaffRatings"));
const News = lazy(() => import("./pages/News"));

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ContentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <span className="animate-pulse text-sm tracking-wide">
                    Loading page…
                  </span>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/academics" element={<Academics />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/campus-life" element={<CampusLife />} />
                <Route path="/about" element={<About />} />
                <Route path="/admission" element={<Admission />} />
                <Route path="/news" element={<News />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/staff" element={<StaffAdmin />} />
                <Route path="/admin/portal" element={<PortalAdmin />} />
                <Route
                  path="/admin/portal-students"
                  element={<PortalAdminStudents />}
                />
                <Route
                  path="/admin/portal-staff"
                  element={<PortalAdminStaff />}
                />
                <Route path="/staff" element={<Staff />} />
                <Route path="/portal-login" element={<PortalLogin />} />
                <Route path="/portal" element={<Portal />} />
                <Route path="/portal/staff" element={<PortalStaffLayout />}>
                  <Route index element={<PortalStaffDashboard />} />
                  <Route path="lectures" element={<PortalLectures />} />
                  <Route
                    path="attendance"
                    element={<PortalStaffAttendance />}
                  />
                  <Route path="exam" element={<PortalStaffExam />} />
                  <Route path="ratings" element={<PortalStaffRatings />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ContentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
