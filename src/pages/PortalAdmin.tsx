import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Plus, Trash2, Eye, ToggleLeft, ToggleRight, Search, Loader2, Save, UserPlus } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import collegeLogo from '@/assets/college-logo.png';

// Simple hash function for password - must match edge function
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface PortalUser {
  id?: string;
  username: string;
  password_hash?: string;
  user_type: 'staff' | 'student';
  full_name: string;
  email?: string;
  department?: string;
  is_active: boolean;
}

export default function PortalAdmin() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PortalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('portal_users')
      .select('id, username, user_type, full_name, email, department, is_active')
      .order('full_name');

    if (error) {
      console.error('Error fetching portal users:', error);
      toast({ title: "Error", description: "Failed to load portal users", variant: "destructive" });
    } else {
      setUsers((data || []) as any as PortalUser[]);
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
      result = result.filter(u =>
        u.username.toLowerCase().includes(query) ||
        u.full_name.toLowerCase().includes(query) ||
        (u.department && u.department.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(u => u.user_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(u => 
        statusFilter === 'active' ? u.is_active : !u.is_active
      );
    }

    setFilteredUsers(result);
  }, [users, searchQuery, typeFilter, statusFilter]);

  const handleSave = async () => {
    if (!editingUser?.username || !editingUser?.full_name) {
      toast({ title: "Error", description: "Username and full name are required", variant: "destructive" });
      return;
    }

    if (!editingUser.id && !password) {
      toast({ title: "Error", description: "Password is required for new users", variant: "destructive" });
      return;
    }

    const userData: any = {
      username: editingUser.username,
      full_name: editingUser.full_name,
      user_type: editingUser.user_type,
      email: editingUser.email || null,
      department: editingUser.department || null,
      is_active: editingUser.is_active ?? true,
    };

    if (password) {
      userData.password_hash = await hashPassword(password);
    }

    if (editingUser.id) {
      const { error } = await supabase.from('portal_users').update(userData).eq('id', editingUser.id);
      if (error) {
        console.error('Error updating portal user:', error);
        toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
        return;
      }
      toast({ title: "Updated!", description: "User updated successfully" });
    } else {
      // portal_users.user_id is required in the database schema, so generate a stable id
      const userId = crypto.randomUUID();
      const { error } = await supabase.from('portal_users').insert({ ...userData, user_id: userId });
      if (error) {
        console.error('Error inserting portal user:', error);
        if ((error as any).code === '23505') {
          toast({ title: "Error", description: "Username already exists", variant: "destructive" });
        } else {
          toast({ title: "Error", description: "Failed to add user", variant: "destructive" });
        }
        return;
      }
      toast({ title: "Added!", description: "User added successfully" });
    }

    setIsDialogOpen(false);
    setEditingUser(null);
    setPassword('');
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const { error } = await supabase.from('portal_users').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
      return;
    }
    toast({ title: "Deleted!", description: "User deleted" });
    fetchUsers();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('portal_users').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      return;
    }
    fetchUsers();
  };

  const stats = {
    total: users.length,
    staff: users.filter(u => u.user_type === 'staff').length,
    students: users.filter(u => u.user_type === 'student').length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  };

  const exportPortalUsersToCSV = () => {
    if (!filteredUsers.length) {
      toast({ title: "No data", description: "There are no portal users to export", variant: "destructive" });
      return;
    }

    const headers = [
      'Username',
      'Full Name',
      'Type',
      'Department',
      'Email',
      'Status',
    ];

    const rows = filteredUsers.map(user => [
      user.username,
      user.full_name,
      user.user_type === 'staff' ? 'Staff' : 'Student',
      user.department || '',
      user.email || '',
      user.is_active ? 'Active' : 'Inactive',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portal_users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPortalUsersToExcel = () => {
    if (!filteredUsers.length) {
      toast({ title: "No data", description: "There are no portal users to export", variant: "destructive" });
      return;
    }

    const worksheetData = filteredUsers.map(user => ({
      'Username': user.username,
      'Full Name': user.full_name,
      'Type': user.user_type === 'staff' ? 'Staff' : 'Student',
      'Department': user.department || '',
      'Email': user.email || '',
      'Status': user.is_active ? 'Active' : 'Inactive',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Portal Users');
    XLSX.writeFile(workbook, 'portal_users.xlsx');
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
              <h1 className="font-semibold text-base leading-tight">Portal User Management</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Home size={16} />
                <span>Main Admin</span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home size={16} />
                <span>View Site</span>
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
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.total}</div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Staff Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.staff}</div>
                <Badge variant="outline">Staff</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.students}</div>
                <Badge variant="outline">Student</Badge>
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
                <Badge variant="default" className="bg-green-600">Active</Badge>
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

        {/* Portal Users Management Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Portal Users (Login Credentials)</CardTitle>
              <Button size="sm" onClick={() => { 
                setEditingUser({ 
                  username: '', 
                  full_name: '', 
                  user_type: 'student', 
                  is_active: true 
                }); 
                setPassword(''); 
                setIsDialogOpen(true); 
              }}>
                <UserPlus size={14} className="mr-1" /> Add User
              </Button>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="User type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
              <Button size="sm" variant="outline" onClick={exportPortalUsersToCSV}>
                Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={exportPortalUsersToExcel}>
                Export Excel
              </Button>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No portal users found.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Type</TableHead>
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
                        <TableCell>
                          <Badge variant="outline">
                            {portalUser.user_type === 'staff' ? 'Staff' : 'Student'}
                          </Badge>
                        </TableCell>
                        <TableCell>{portalUser.department || '-'}</TableCell>
                        <TableCell className="text-sm">{portalUser.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={portalUser.is_active ? 'default' : 'secondary'}>
                            {portalUser.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className={`h-8 w-8 p-0 transition-colors ${
                                portalUser.is_active 
                                  ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50' 
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                              onClick={() => toggleActive(portalUser.id!, portalUser.is_active)}
                            >
                              <Eye size={14} className={portalUser.is_active ? '' : 'opacity-40'} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0" 
                              onClick={() => { 
                                setEditingUser(portalUser); 
                                setPassword(''); 
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

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser?.id ? 'Edit User' : 'Add User'}</DialogTitle>
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
                <Label>Password {editingUser?.id ? '(leave blank to keep)' : '*'}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser?.id ? '••••••••' : 'Enter password'}
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
            <div className="space-y-2">
              <Label>User Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={editingUser?.user_type === 'staff' ? 'default' : 'outline'}
                  onClick={() => setEditingUser({ ...editingUser!, user_type: 'staff' })}
                >
                  Staff
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={editingUser?.user_type === 'student' ? 'default' : 'outline'}
                  onClick={() => setEditingUser({ ...editingUser!, user_type: 'student' })}
                >
                  Student
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}><Save size={14} className="mr-1" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
