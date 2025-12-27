import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, CalendarDays } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PortalStaffOutletContext } from './PortalStaffLayout';

export default function PortalStaffAttendance() {
  const { user, setSidebarOpen } = useOutletContext<PortalStaffOutletContext>();

  useEffect(() => {
    document.title = 'Staff Portal · Attendance';
  }, []);

  return (
    <>
      {/* Orange top bar */}
      <div className="rounded-xl overflow-hidden shadow-sm border bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="px-3 sm:px-5 py-3 flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-primary/40 bg-primary-foreground/10"
                onClick={() => setSidebarOpen(true)}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary-foreground/15 flex items-center justify-center text-sm font-semibold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs opacity-80">Academic Year</p>
                <div className="mt-1">
                  <select className="text-xs rounded-md bg-primary-foreground/10 border border-primary-foreground/20 px-2 py-1 outline-none">
                    <option>2025-2026</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm">
            <Bell size={16} className="opacity-80" />
            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="font-semibold truncate max-w-[120px] sm:max-w-[140px] md:max-w-xs">
              {user.full_name.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance content */}
      <Card className="shadow-sm border bg-card/80 mt-4">
        <CardHeader>
          <CardTitle className="text-base">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Today&apos;s Attendance</p>
              <p className="text-foreground font-semibold">12 / 30 Present</p>
            </div>
            <div>
              <p className="text-muted-foreground">This Month</p>
              <p className="text-foreground font-semibold">92% Average</p>
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">Recent classes</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>XI - Computer Science</span>
                <span className="text-muted-foreground">Yesterday • 90% Present</span>
              </div>
              <div className="flex items-center justify-between">
                <span>XI - Computer Science Lab</span>
                <span className="text-muted-foreground">Mon • 88% Present</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
