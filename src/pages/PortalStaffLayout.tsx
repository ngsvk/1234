import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { StaffSidebar } from '@/components/StaffSidebar';

interface PortalUser {
  id: string;
  username: string;
  full_name: string;
  user_type: string;
  email?: string;
  department?: string;
}

export interface PortalStaffOutletContext {
  user: PortalUser;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function PortalStaffLayout() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(true);
  const [examOpen, setExamOpen] = useState(true);
  const [studentsRatingOpen, setStudentsRatingOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('portal_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as PortalUser;
      if (parsed.user_type === 'staff') {
        setUser(parsed);
      } else {
        navigate('/portal');
      }
    } else {
      navigate('/portal-login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      document.title = 'Staff Portal';
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('portal_user');
    navigate('/portal-login');
  };

  if (!user) {
    return null;
  }

  const outletContext: PortalStaffOutletContext = {
    user,
    sidebarOpen,
    setSidebarOpen,
  };

  return (
    <section className="bg-muted min-h-[70vh] py-4 md:py-6">
      <div className="container mx-auto px-2 sm:px-4 flex gap-4 md:gap-6">
        <StaffSidebar
          user={user}
          variant="dashboard"
          sidebarOpen={sidebarOpen}
          attendanceOpen={attendanceOpen}
          examOpen={examOpen}
          studentsRatingOpen={studentsRatingOpen}
          onToggleAttendance={() => setAttendanceOpen((prev) => !prev)}
          onToggleExam={() => setExamOpen((prev) => !prev)}
          onToggleStudentsRating={() => setStudentsRatingOpen((prev) => !prev)}
          onGoDashboard={() => navigate('/portal/staff')}
          onGoLectures={() => navigate('/portal/staff/lectures')}
          onGoAttendance={() => navigate('/portal/staff/attendance')}
          onGoExam={() => navigate('/portal/staff/exam')}
          onGoStudentsRating={() => navigate('/portal/staff/ratings')}
          onCloseMobile={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <div className="flex-1 space-y-4">
          <Outlet context={outletContext} />
        </div>
      </div>
    </section>
  );
}
