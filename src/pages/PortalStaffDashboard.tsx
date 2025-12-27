import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  Bell,
  CalendarDays,
  NotebookPen,
  BookOpenCheck,
  Megaphone,
  Edit,
  Save,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { PortalStaffOutletContext } from './PortalStaffLayout';

interface UpdateItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

export default function PortalStaffDashboard() {
  const { user, sidebarOpen, setSidebarOpen } = useOutletContext<PortalStaffOutletContext>();
  const [notices, setNotices] = useState<UpdateItem[]>([]);
  const [events, setEvents] = useState<UpdateItem[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: user.full_name,
    email: user.email || '',
    department: user.department || '',
    password: '',
  });

  useEffect(() => {
    document.title = 'Staff Portal Dashboard';
  }, []);

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoadingUpdates(true);
      const { data, error } = await supabase
        .from('updates')
        .select('id, title, description, category, date, is_published')
        .eq('is_published', true)
        .order('date', { ascending: false })
        .limit(10);

      if (!error && data) {
        const mapped = (data as any[]).map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category,
          date: row.date,
        }));

        setNotices(mapped.filter((u) => u.category?.toLowerCase() === 'notice'));
        setEvents(mapped.filter((u) => u.category?.toLowerCase() === 'event'));
      }

      setLoadingUpdates(false);
    };

    fetchUpdates();
  }, []);

  const handleProfileUpdate = async () => {
    if (!editedProfile.full_name) {
      toast({ title: 'Error', description: 'Full name is required', variant: 'destructive' });
      return;
    }

    const updateData: any = {
      full_name: editedProfile.full_name,
      email: editedProfile.email || null,
      department: editedProfile.department || null,
    };

    if (editedProfile.password) {
      updateData.password_hash = editedProfile.password;
    }

    const { error } = await supabase
      .from('portal_users')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
      return;
    }

    toast({ title: 'Success!', description: 'Profile updated successfully' });
    
    // Update local storage
    const updatedUser = { ...user, ...updateData };
    localStorage.setItem('portal_user', JSON.stringify(updatedUser));
    
    setIsEditProfileOpen(false);
    window.location.reload(); // Refresh to show updated info
  };

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

      {/* Welcome card with Edit Profile */}
      <Card className="shadow-sm border bg-card/80">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 px-5">
          <div className="space-y-2 text-center md:text-left flex-1">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <p className="text-2xl md:text-3xl font-bold tracking-wide text-primary uppercase">
              {user.full_name}
            </p>
            {user.department && (
              <p className="text-xs text-muted-foreground">{user.department} Department</p>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => {
                setEditedProfile({
                  full_name: user.full_name,
                  email: user.email || '',
                  department: user.department || '',
                  password: '',
                });
                setIsEditProfileOpen(true);
              }}
            >
              <Edit size={14} className="mr-2" />
              Edit Profile
            </Button>
          </div>
          <div className="w-40 h-24 md:w-52 md:h-28 rounded-xl bg-gradient-to-tr from-primary/10 via-primary/5 to-secondary/20 flex items-center justify-center">
            <BookOpenCheck className="text-primary" size={40} />
          </div>
        </CardContent>
      </Card>

      {/* Timetable + right control panel grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
        {/* Lectures timetable inspired by Klartopedia scheduler */}
        <Card className="shadow-sm border bg-card/80">
          <CardHeader className="pb-3 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Class</span>
              <span className="text-xs">&gt;</span>
              <span className="font-medium text-foreground">Timetable</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                  Week
                </button>
                <button className="px-3 py-1 rounded-md bg-muted text-foreground/80">Day</button>
                <button className="px-3 py-1 rounded-md bg-muted text-foreground/80">Month</button>
                <button className="px-3 py-1 rounded-md bg-muted text-foreground/80">Agenda</button>

                <div className="h-4 w-px bg-border mx-2 hidden sm:block" />

                <button className="px-2 py-1 rounded-md border text-xs flex items-center gap-1 text-foreground/80">
                  <span>{'<'}</span>
                  <span>{'>'}</span>
                </button>

                <span className="text-muted-foreground text-xs">
                  December 25 - 31, 2025
                </span>
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

        {/* Right-side control panel similar to Klartopedia */}
        <Card className="shadow-sm border bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Schedule Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-medium text-[11px] text-muted-foreground uppercase mb-1">Filters</p>
                <div className="space-y-1">
                  <p className="text-foreground">
                    Class: <span className="font-semibold">XI - Computer Science</span>
                  </p>
                  <p className="text-foreground">
                    Section: <span className="font-semibold">A</span>
                  </p>
                  <p className="text-foreground">
                    Room: <span className="font-semibold">Lab 1</span>
                  </p>
                </div>
              </div>
              <div>
                <p className="font-medium text-[11px] text-muted-foreground uppercase mb-1">Summary</p>
                <div className="space-y-1">
                  <p className="text-foreground">
                    Total Lectures: <span className="font-semibold">6</span>
                  </p>
                  <p className="text-foreground">
                    Lab Hours: <span className="font-semibold">3</span>
                  </p>
                  <p className="text-foreground">
                    Theory Hours: <span className="font-semibold">3</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <p className="font-medium text-[11px] text-muted-foreground uppercase">Legend</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Computer Science</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  <span>Computer Science Lab</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <p className="font-medium text-[11px] text-muted-foreground uppercase">Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="h-7 text-[11px] px-2">
                  Add Lecture
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[11px] px-2">
                  Copy Week
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notice Board + Events from backend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="text-primary" size={20} />
              Notice Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUpdates ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading notices...</p>
            ) : notices.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Stay Tuned! New Notices will Appear Here.
              </p>
            ) : (
              <ul className="space-y-3">
                {notices.map((notice) => (
                  <li key={notice.id} className="border rounded-md px-3 py-2 bg-background/60">
                    <p className="text-sm font-medium">{notice.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notice.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                      <CalendarDays size={12} />
                      <span>{new Date(notice.date).toLocaleDateString()}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="text-primary" size={20} />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUpdates ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No Events Scheduled Yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(event.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{event.title}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={editedProfile.full_name}
                onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editedProfile.email}
                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={editedProfile.department}
                onChange={(e) => setEditedProfile({ ...editedProfile, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password (leave blank to keep current)</Label>
              <Input
                type="password"
                value={editedProfile.password}
                onChange={(e) => setEditedProfile({ ...editedProfile, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProfileUpdate}>
              <Save size={14} className="mr-1" /> Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
