import { useState, useEffect, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Search, Loader2, Save, UserPlus, Download, Upload, ToggleLeft, ToggleRight, Eye, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import collegeLogo from '@/assets/college-logo.png';
import { VisibilityToggle } from '@/components/VisibilityToggle';

interface StaffPortalUser {
  id?: string;
  username: string;
  password_hash?: string;
  user_type: 'staff';
  full_name: string;
  email?: string;
  department?: string | null;
  is_active: boolean;
  plain_password?: string;
}

export default function PortalAdminStaff() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<StaffPortalUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<StaffPortalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffPortalUser | null>(null);
  const [password, setPassword] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('portal_users')
      .select('id, username, user_type, full_name, email, department, is_active, user_id, password_hash')
      .eq('user_type', 'staff')
      .order('full_name');

    if (error) {
      console.error('Error fetching staff portal users:', error);
      toast({ title: 'Error', description: 'Failed to load staff portal users', variant: 'destructive' });
    } else {
      setUsers((data || []) as any as StaffPortalUser[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    let result = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((u) =>
        u.username.toLowerCase().includes(query) ||
        u.full_name.toLowerCase().includes(query) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.department && u.department.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((u) => (statusFilter === 'active' ? u.is_active : !u.is_active));
    }

    if (departmentFilter !== 'all') {
      result = result.filter((u) => u.department === departmentFilter);
    }

    // Sort by department
    result = result.sort((a, b) => {
      const deptA = a.department || '';
      const deptB = b.department || '';
      return deptA.localeCompare(deptB);
    });

    setFilteredUsers(result);
  }, [users, searchQuery, statusFilter, departmentFilter]);

  const handleSave = async () => {
    if (!editingUser?.username || !editingUser?.full_name) {
      toast({ title: 'Error', description: 'Username and full name are required', variant: 'destructive' });
      return;
    }

    if (!editingUser.id && !password) {
      toast({ title: 'Error', description: 'Password is required for new users', variant: 'destructive' });
      return;
    }

    const userData: any = {
      username: editingUser.username,
      full_name: editingUser.full_name,
      user_type: 'staff',
      email: editingUser.email || null,
      department: editingUser.department || null,
      is_active: editingUser.is_active ?? true,
    };

    // Store password as plain text in password_hash field for admin visibility
    if (password) {
      userData.password_hash = password;
    }

    if (editingUser.id) {
      const { error } = await supabase.from('portal_users').update(userData).eq('id', editingUser.id);
      if (error) {
        console.error('Error updating staff portal user:', error);
        toast({ title: 'Error', description: 'Failed to update staff', variant: 'destructive' });
        return;
      }
      toast({ title: 'Updated!', description: 'Staff updated successfully' });
    } else {
      const userId = crypto.randomUUID();
      const { error } = await supabase.from('portal_users').insert({ ...userData, user_id: userId });
      if (error) {
        console.error('Error inserting staff portal user:', error);
        toast({ title: 'Error', description: 'Failed to add staff', variant: 'destructive' });
        return;
      }
      toast({ title: 'Added!', description: 'Staff added successfully' });
    }

    setIsDialogOpen(false);
    setEditingUser(null);
    setPassword('');
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    const { error } = await supabase.from('portal_users').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete staff', variant: 'destructive' });
      return;
    }
    toast({ title: 'Deleted!', description: 'Staff deleted' });
    fetchUsers();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('portal_users').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
      return;
    }
    fetchUsers();
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        Username: 'staff001',
        Password: 'Staff@2024',
        'Full Name': 'Dr. Alice Johnson',
        Email: 'alice.johnson@example.com',
        Department: 'Mathematics',
        Active: 'Yes',
      },
      {
        Username: 'staff002',
        Password: 'Teacher@123',
        'Full Name': 'Mr. Bob Williams',
        Email: 'bob.williams@example.com',
        Department: 'Science',
        Active: 'Yes',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    XLSX.writeFile(workbook, 'staff_portal_users_sample.xlsx');
  };

  const exportStaff = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      toast({ title: 'Error', description: 'No staff data to export', variant: 'destructive' });
      return;
    }

    const exportData = filteredUsers.map(user => ({
      Username: user.username || '',
      'Full Name': user.full_name || '',
      Email: user.email || '',
      Department: user.department || '',
      Active: user.is_active ? 'Yes' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    XLSX.writeFile(workbook, `staff_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: 'Exported!', description: `Exported ${exportData.length} staff members` });
  };

  const handleImportExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<any>(worksheet);

      if (!rows.length) {
        toast({ title: 'No data', description: 'Excel file is empty', variant: 'destructive' });
        return;
      }

      const usernames = rows
        .map((row) => String(row.Username || '').trim())
        .filter((u) => u.length > 0);

      if (!usernames.length) {
        toast({ title: 'Error', description: 'No valid Username values found in Excel', variant: 'destructive' });
        return;
      }

      const { data: existing, error: fetchError } = await supabase
        .from('portal_users')
        .select('username, user_id')
        .in('username', usernames)
        .eq('user_type', 'staff');

      if (fetchError) {
        console.error('Error fetching existing staff:', fetchError);
        toast({ title: 'Error', description: 'Failed to validate existing staff', variant: 'destructive' });
        return;
      }

      const existingMap = new Map<string, string>();
      (existing || []).forEach((u) => {
        existingMap.set((u as any).username, (u as any).user_id);
      });

      const records = rows.map((row) => {
        const username = String(row.Username || '').trim();
        if (!username) return null;

        const fullName = String(row['Full Name'] || '').trim();
        if (!fullName) return null;

        const password = row.Password ? String(row.Password).trim() : null;
        const email = row.Email ? String(row.Email).trim() : null;
        const department = row.Department ? String(row.Department).trim() : null;
        const activeRaw = String(row.Active || '').toLowerCase();
        const isActive = activeRaw === 'yes' || activeRaw === 'true' || activeRaw === '1';

        const existingUserId = existingMap.get(username) || crypto.randomUUID();

        return {
          username,
          full_name: fullName,
          email,
          department,
          is_active: isActive,
          user_type: 'staff' as const,
          user_id: existingUserId,
          ...(password && { password_hash: password }),
        };
      });

      const validRecords = records.filter(Boolean) as any[];

      if (!validRecords.length) {
        toast({ title: 'Error', description: 'No valid rows to import from Excel', variant: 'destructive' });
        return;
      }

      const { error: upsertError } = await supabase
        .from('portal_users')
        .upsert(validRecords, { onConflict: 'username' });

      if (upsertError) {
        console.error('Error importing staff from Excel:', upsertError);
        toast({ title: 'Error', description: 'Failed to import staff', variant: 'destructive' });
        return;
      }

      toast({ title: 'Imported!', description: `Imported / updated ${validRecords.length} staff from Excel` });
      fetchUsers();
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
              <img src={collegeLogo} alt="Admin avatar" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-base leading-tight">Staff Portal User Management</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/portal-students">
              <Button variant="outline" size="sm" className="gap-2">
                <Users size={16} />
                <span>Manage Students</span>
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Home size={16} />
                <span>Main Admin</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2" onClick={signOut}>
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                <Badge variant="default" className="bg-green-600">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-muted-foreground">{stats.inactive}</div>
                <Badge variant="secondary">Inactive</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Staff Portal Users (Login Credentials)</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={exportStaff}>
                  <Download size={14} className="mr-1" /> Export All
                </Button>
                <Button size="sm" variant="outline" onClick={downloadSampleExcel}>
                  <Download size={14} className="mr-1" /> Sample Excel
                </Button>
                <div className="flex items-center gap-2">
                  <input
                    id="staff-import"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleImportExcel}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('staff-import')?.click()}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <Upload size={14} className="mr-1" />
                    )}
                    Import Excel
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingUser({
                      username: '',
                      full_name: '',
                      user_type: 'staff',
                      is_active: true,
                    });
                    setPassword('');
                    setIsDialogOpen(true);
                  }}
                >
                  <UserPlus size={14} className="mr-1" /> Add Staff
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username, name, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-[150px] border border-input bg-background rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-[150px] border border-input bg-background rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Departments</option>
                {Array.from(new Set(users.map(u => u.department).filter(Boolean))).sort().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No staff portal users found.</div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((portalUser) => (
                      <TableRow key={portalUser.id}>
                        <TableCell className="font-medium">{portalUser.username}</TableCell>
                        <TableCell>{portalUser.full_name}</TableCell>
                        <TableCell>{portalUser.department || '-'}</TableCell>
                        <TableCell className="text-sm">{portalUser.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={portalUser.is_active ? 'default' : 'secondary'}>
                            {portalUser.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <VisibilityToggle
                                     checked={portalUser.is_active}
                                     onChange={() => toggleActive(portalUser.id!, portalUser.is_active)}
                                   />
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   {portalUser.is_active ? 'Active' : 'Inactive'}
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingUser(portalUser);
                                setPassword(portalUser.password_hash || '');
                                setIsDialogOpen(true);
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleDelete(portalUser.id!)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser?.id ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input
                  value={editingUser?.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser!, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={editingUser?.full_name || ''}
                onChange={(e) => setEditingUser({ ...editingUser!, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser!, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={editingUser?.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser!, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save size={14} className="mr-1" /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
