import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, CalendarDays } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PortalStaffOutletContext } from './PortalStaffLayout';

export default function PortalLectures() {
  const { user, sidebarOpen, setSidebarOpen } = useOutletContext<PortalStaffOutletContext>();

  useEffect(() => {
    document.title = 'Staff Portal · Lectures';
  }, []);

  return (
    <>
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

      <div className="rounded-md bg-accent text-accent-foreground text-xs px-4 py-2 font-medium mt-4">
        1 selected
      </div>

      <Card className="shadow-sm border bg-card/80 mt-4">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Class</span>
            <span className="text-xs">&gt;</span>
            <span className="font-medium text-foreground">Timetable</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button className="px-3 py-1 rounded-md bg-muted text-foreground/80">Day</button>
              <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                Week
              </button>
              <button className="px-3 py-1 rounded-md bg-muted text-foreground/80">Month</button>
              <button className="px-3 py-1 rounded-md bg-muted text-foreground/80">Agenda</button>

              <div className="h-4 w-px bg-border mx-2 hidden sm:block" />

              <button className="px-2 py-1 rounded-md border text-xs flex items-center gap-1 text-foreground/80">
                <span>{'<'}</span>
                <span>{'>'}</span>
              </button>

              <span className="text-muted-foreground text-xs">December 25 - 31, 2025</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">View</span>
              <select className="rounded-md bg-background border px-2 py-1 outline-none min-w-[120px] text-xs">
                <option>Week</option>
                <option>Day</option>
                <option>Month</option>
                <option>Agenda</option>
              </select>
              <Button variant="outline" size="sm" className="h-7 text-[11px] px-2 hidden sm:inline-flex">
                Print
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px] px-2 hidden sm:inline-flex">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="border rounded-md overflow-hidden bg-background">
            <div className="max-h-[460px] overflow-auto divide-y divide-border text-sm">
              {['Monday','Tuesday','Wednesday','Thursday','Friday'].map((day) => (
                <div key={day} className="grid grid-cols-[80px,1fr]">
                  <div className="bg-muted/70 px-4 py-4 text-xs font-medium text-muted-foreground border-r border-border flex items-start">
                    <span>{day.slice(0,3)}</span>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Timetable entries will appear here once configured in the backend.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
