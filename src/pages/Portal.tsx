import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, CalendarDays, NotebookPen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PortalUser {
  id: string;
  username: string;
  full_name: string;
  user_type: string;
  email?: string;
  department?: string;
  class?: string;
  section?: string;
}

export default function Portal() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('portal_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as PortalUser;
      setUser(parsed);
    } else {
      navigate('/portal-login');
    }
  }, [navigate]);

  useEffect(() => {
    document.title = user?.user_type === 'student' ? 'Student Portal Dashboard' : 'Portal';
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('portal_user');
    navigate('/portal-login');
  };

  if (!user) {
    return null;
  }

  const isStaff = user.user_type === 'staff';

  if (isStaff) {
    navigate('/portal/staff');
    return null;
  }

  // Fetch timetable entries for the student
  const { data: timetableEntries } = useQuery({
    queryKey: ['timetable', user.class, user.section],
    queryFn: async () => {
      if (!user.class || !user.section) return [];
      
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('class', user.class)
        .eq('section', user.section)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user.class && !!user.section
  });

  // Fetch published notices/updates
  const { data: notices } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    }
  });

  // Group timetable by day
  const timetableByDay = timetableEntries?.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) {
      acc[entry.day_of_week] = [];
    }
    acc[entry.day_of_week].push(entry);
    return acc;
  }, {} as Record<string, typeof timetableEntries>);

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sortedDays = dayOrder.filter(day => timetableByDay?.[day]?.length);

  // Student / non-staff view keeps the simple profile but without global Layout
  return (
    <div className="min-h-screen bg-background">
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome, {user.full_name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            {user.user_type === 'staff' ? 'Staff Portal' : 'Student Portal'}
          </p>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 space-y-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="text-primary" size={24} />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{user.user_type}</p>
                  </div>
                  {user.department && (
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{user.department}</p>
                    </div>
                  )}
                  {user.email && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" onClick={handleLogout} className="gap-2">
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student timetable + notices section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="shadow-sm border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="text-primary" size={20} />
                  Your Weekly Timetable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-xs text-muted-foreground mb-2">
                  Your class schedule for the week.
                </p>
                {!timetableEntries || timetableEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No timetable available yet.</p>
                ) : (
                  <div className="border rounded-md overflow-hidden bg-background">
                    <div className="divide-y divide-border text-xs">
                      {sortedDays.map((day) => (
                        <div key={day} className="grid grid-cols-[80px,1fr]">
                          <div className="bg-muted/60 px-3 py-2 font-medium text-muted-foreground">
                            {day.slice(0, 3)}
                          </div>
                          <div className="px-3 py-2 flex flex-wrap gap-2">
                            {timetableByDay[day]?.slice(0, 3).map((entry, idx) => (
                              <span 
                                key={entry.id}
                                className={`px-2 py-1 rounded-md ${
                                  idx % 2 === 0 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'bg-secondary/10 text-secondary-foreground'
                                }`}
                              >
                                {entry.subject} • {entry.start_time}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <NotebookPen className="text-primary" size={20} />
                  Notices for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {!notices || notices.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No notices available at the moment. Check back later for updates.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {notices.map((notice) => (
                      <li key={notice.id} className="border-l-2 border-primary pl-3">
                        <p className="text-sm font-medium text-foreground">{notice.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notice.description}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {new Date(notice.date).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
