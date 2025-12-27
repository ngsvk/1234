import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, CalendarDays } from "lucide-react";

interface StaffUser {
  id: string;
  username: string;
  full_name: string;
  user_type: string;
  email?: string;
  department?: string;
}

interface StaffSidebarProps {
  user: StaffUser;
  variant: "dashboard" | "lectures";
  sidebarOpen: boolean;
  attendanceOpen: boolean;
  examOpen: boolean;
  studentsRatingOpen: boolean;
  onToggleAttendance: () => void;
  onToggleExam: () => void;
  onToggleStudentsRating: () => void;
  onGoDashboard: () => void;
  onGoLectures: () => void;
  onGoAttendance?: () => void;
  onGoExam?: () => void;
  onGoStudentsRating?: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export function StaffSidebar(props: StaffSidebarProps) {
  const {
    user,
    variant,
    sidebarOpen,
    attendanceOpen,
    examOpen,
    studentsRatingOpen,
    onToggleAttendance,
    onToggleExam,
    onToggleStudentsRating,
    onGoDashboard,
    onGoLectures,
    onGoAttendance,
    onGoExam,
    onGoStudentsRating,
    onCloseMobile,
    onLogout,
  } = props;

  const isDashboard = variant === "dashboard";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card rounded-xl shadow-sm border overflow-hidden">
        {/* User panel */}
        <div className="px-3 pt-4 pb-3 border-b bg-muted/40">
          <div className="rounded-2xl bg-background shadow-sm px-4 py-4 flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary overflow-hidden">
              <span className="uppercase truncate">{user.full_name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.full_name}</p>
              {user.department && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {user.department} Department
                </p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 text-sm overflow-y-auto">
          {/* Main header + search */}
          <div className="px-4 mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Main
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="Search menu..."
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Top-level items */}
          <div className="space-y-1">
            <button
              className={
                "w-full flex items-center gap-3 px-4 py-2 text-left rounded-md text-[13px] transition-colors " +
                (isDashboard
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/70")
              }
              onClick={onGoDashboard}
            >
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Dashboard</span>
            </button>

            <button
              className={
                "w-full flex items-center gap-3 px-4 py-2 text-left rounded-md text-[13px] transition-colors " +
                (!isDashboard
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/70")
              }
              onClick={onGoLectures}
            >
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Lectures</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Time Table</span>
            </button>

            {/* Attendance group - different inner content per variant */}
            <div className="pt-1">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors"
                onClick={onToggleAttendance}
              >
                <span className="flex items-center gap-3">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Attendance</span>
                </span>
                <span className="text-xs text-muted-foreground">{attendanceOpen ? (variant === "dashboard" ? "−" : "-") : "+"}</span>
              </button>

              {attendanceOpen && (
                isDashboard ? (
                  <div className="pl-10 pr-4 py-1 space-y-1 text-[12px] text-muted-foreground">
                    <button
                      className="block w-full text-left hover:text-foreground"
                      onClick={onGoAttendance}
                    >
                      Attendance
                    </button>
                    <button className="block w-full text-left hover:text-foreground">Approve Leave</button>
                  </div>
                ) : (
                  <div className="mt-1 space-y-1 pl-11 pr-2 text-[12px]">
                    <button
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-muted/70"
                      onClick={onGoAttendance}
                    >
                      Daily Attendance
                    </button>
                    <button className="w-full text-left px-2 py-1 rounded-md hover:bg-muted/70">
                      Monthly Attendance
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Assignment */}
            <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Assignment</span>
            </button>

            {/* Worklog */}
            <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Worklog</span>
            </button>

            {/* Syllabus Tracker */}
            <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Syllabus Tracker</span>
            </button>

            {/* Exam group - inner list differs */}
            <div className="pt-1">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors"
                onClick={onToggleExam}
              >
                <span className="flex items-center gap-3">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Exam</span>
                </span>
                <span className="text-xs text-muted-foreground">{examOpen ? (variant === "dashboard" ? "−" : "-") : "+"}</span>
              </button>

              {examOpen && (
                isDashboard ? (
                  <div className="pl-10 pr-4 py-1 space-y-1 text-[12px] text-muted-foreground">
                    <button
                      className="block w-full text-left hover:text-foreground"
                      onClick={onGoExam}
                    >
                      All Exam
                    </button>
                    <button className="block w-full text-left hover:text-foreground">Add Exam</button>
                    <button className="block w-full text-left hover:text-foreground">Exam Schedule</button>
                    <button className="block w-full text-left hover:text-foreground">Exam Result</button>
                    <button className="block w-full text-left hover:text-foreground">Add Exam Result</button>
                    <button className="block w-full text-left hover:text-foreground">Internal Marks</button>
                    <button className="block w-full text-left hover:text-foreground">Exam Ratings</button>
                  </div>
                ) : (
                  <div className="mt-1 space-y-1 pl-11 pr-2 text-[12px]">
                    <button
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-muted/70"
                      onClick={onGoExam}
                    >
                      Internal Exams
                    </button>
                    <button className="w-full text-left px-2 py-1 rounded-md hover:bg-muted/70">
                      Final Exam Schedule
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Holidays */}
            <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Holidays</span>
            </button>

            {/* Students Rating group */}
            <div className="pt-1">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors"
                onClick={onToggleStudentsRating}
              >
                <span className="flex items-center gap-3">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Students Rating</span>
                </span>
                <span className="text-xs text-muted-foreground">{studentsRatingOpen ? (variant === "dashboard" ? "−" : "-") : "+"}</span>
              </button>

              {studentsRatingOpen && (
                isDashboard ? (
                  <div className="pl-10 pr-4 py-1 space-y-1 text-[12px] text-muted-foreground">
                    <button
                      className="block w-full text-left hover:text-foreground"
                      onClick={onGoStudentsRating}
                    >
                      Monthly Ratings
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 space-y-1 pl-11 pr-2 text-[12px]">
                    <button
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-muted/70"
                      onClick={onGoStudentsRating}
                    >
                      Class Feedback
                    </button>
                    <button className="w-full text-left px-2 py-1 rounded-md hover:bg-muted/70">
                      Term Feedback
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Remaining items */}
            <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Live Bus Tracker</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
              <span className="material-icons text-base" aria-hidden="true" />
              <span>Leave Request</span>
            </button>

            {isDashboard && (
              <>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Courses</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Library</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Events</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Noticeboard</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Gallery</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Teacher Payroll</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-muted/70 text-[13px] transition-colors">
                  <span className="material-icons text-base" aria-hidden="true" />
                  <span>Ask Me</span>
                </button>

                <div className="flex items-center justify-between px-4 py-2 text-[13px] rounded-md hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-base" aria-hidden="true" />
                    <span>Voice Bot</span>
                  </div>
                  <span className="rounded-full bg-primary/10 text-primary text-[10px] px-2 py-0.5">Preview</span>
                </div>

                <div className="px-4 pt-3 pb-1 text-[11px] text-muted-foreground border-t mt-2">
                  Version 2.12.2
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="border-t px-4 py-3 flex justify-between items-center text-[13px] bg-card/95">
          <span className="text-muted-foreground">Portal</span>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-1 h-8 text-xs px-3">
            <LogOut size={14} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-background/60" onClick={onCloseMobile} />
          <aside className="relative z-50 h-full w-64 bg-card shadow-xl border-r flex flex-col">
            <div className="px-3 pt-4 pb-3 border-b bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-base font-semibold text-primary overflow-hidden">
                  <span className="uppercase truncate">{user.full_name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.full_name}</p>
                  {user.department && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user.department} Department
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onCloseMobile}>
                <span className="material-icons text-base">close</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 text-sm">
              <div className="px-4 mb-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Main</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search menu..."
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <button
                  className={
                    "w-full flex items-center gap-3 px-4 py-2 text-left rounded-md text-[13px] transition-colors " +
                    (isDashboard
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/70")
                  }
                  onClick={onGoDashboard}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  className={
                    "w-full flex items-center gap-3 px-4 py-2 text-left rounded-md text-[13px] transition-colors " +
                    (!isDashboard
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/70")
                  }
                  onClick={onGoLectures}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Lectures</span>
                </button>

                {/* Other items simplified on mobile for now */}
              </div>
            </div>

            <div className="border-t px-4 py-3 flex justify-between items-center text-[13px] bg-card/95">
              <span className="text-muted-foreground">Portal</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-1 h-8 text-xs px-3">
                <LogOut size={14} />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
