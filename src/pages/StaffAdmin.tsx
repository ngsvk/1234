import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Plus, Trash2, Eye, ToggleLeft, ToggleRight, Search, Loader2, Save, PieChart, BarChart3 } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import collegeLogo from '@/assets/college-logo.png';
import { VisibilityToggle } from '@/components/VisibilityToggle';

interface Staff {
  id: string;
  full_name: string;
  designation: string;
  department: string | null;
  email: string;
  phone: string | null;
  qualifications: string | null;
  photo_url: string | null;
  is_active: boolean | null;
  display_order: number | null;
  experience_years: number | null;
  joining_date: string | null;
}

interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  byDepartment: { department: string; count: number }[];
  byExperience: { range: string; count: number }[];
}

export default function StaffAdmin() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [editingStaff, setEditingStaff] = useState<Partial<Staff> | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [stats, setStats] = useState<StaffStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byDepartment: [],
    byExperience: []
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching staff:', error);
      toast({ title: "Error", description: "Failed to load staff", variant: "destructive" });
    } else {
      setStaff(data || []);
      calculateStats(data || []);
    }
    setIsLoading(false);
  };

  const calculateStats = (staffData: Staff[]) => {
    const active = staffData.filter(s => s.is_active).length;
    const inactive = staffData.filter(s => !s.is_active).length;
    
    // Group by department
    const deptMap = new Map<string, number>();
    staffData.forEach(s => {
      const dept = s.department || 'Other';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    const byDepartment = Array.from(deptMap.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    // Group by experience
    const expRanges = [
      { range: '0-2 years', min: 0, max: 2 },
      { range: '3-5 years', min: 3, max: 5 },
      { range: '6-10 years', min: 6, max: 10 },
      { range: '10+ years', min: 11, max: 999 }
    ];
    const byExperience = expRanges.map(({ range, min, max }) => ({
      range,
      count: staffData.filter(s => {
        const exp = s.experience_years || 0;
        return exp >= min && exp <= max;
      }).length
    }));

    setStats({
      total: staffData.length,
      active,
      inactive,
      byDepartment,
      byExperience
    });
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
    }
  }, [isAdmin]);

  useEffect(() => {
    let result = staff;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.full_name.toLowerCase().includes(query) ||
        s.designation.toLowerCase().includes(query) ||
        (s.department && s.department.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query))
      );
    }

    if (departmentFilter !== 'all') {
      result = result.filter(s => 
        departmentFilter === 'other' 
          ? !s.department 
          : s.department === departmentFilter
      );
    }

    setFilteredStaff(result);
  }, [staff, searchQuery, departmentFilter]);

  const handleSave = async () => {
    if (!editingStaff?.full_name || !editingStaff?.designation || !editingStaff?.email) {
      toast({ title: "Error", description: "Name, designation, and email are required", variant: "destructive" });
      return;
    }

    const staffData = {
      full_name: editingStaff.full_name,
      designation: editingStaff.designation,
      department: editingStaff.department || null,
      email: editingStaff.email,
      phone: editingStaff.phone || null,
      qualifications: editingStaff.qualifications || null,
      photo_url: editingStaff.photo_url || null,
      is_active: editingStaff.is_active ?? true,
      display_order: editingStaff.display_order ?? 0,
      experience_years: editingStaff.experience_years || null,
      joining_date: editingStaff.joining_date || null,
    };

    if (editingStaff.id) {
      const { error } = await supabase.from('staff').update(staffData).eq('id', editingStaff.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update staff", variant: "destructive" });
        return;
      }
      toast({ title: "Updated!", description: "Staff member updated successfully" });
    } else {
      const { error } = await supabase.from('staff').insert([staffData]);
      if (error) {
        toast({ title: "Error", description: "Failed to add staff", variant: "destructive" });
        return;
      }
      toast({ title: "Added!", description: "Staff member added successfully" });
    }

    setIsEditDialogOpen(false);
    setEditingStaff(null);
    fetchStaff();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete staff", variant: "destructive" });
      return;
    }
    toast({ title: "Deleted!", description: "Staff member deleted" });
    fetchStaff();
  };

  const toggleActive = async (id: string, isActive: boolean | null) => {
    const { error } = await supabase.from('staff').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      return;
    }
    fetchStaff();
  };

  const uniqueDepartments = Array.from(new Set(staff.map(s => s.department).filter(Boolean)));

  const exportStaffToCSV = () => {
    if (!filteredStaff.length) {
      toast({ title: "No data", description: "There are no staff records to export", variant: "destructive" });
      return;
    }

    const headers = [
      'Full Name',
      'Designation',
      'Department',
      'Email',
      'Phone',
      'Status',
      'Experience (years)',
      'Joining Date',
    ];

    const rows = filteredStaff.map(member => [
      member.full_name,
      member.designation,
      member.department || '',
      member.email,
      member.phone || '',
      member.is_active ? 'Active' : 'Inactive',
      member.experience_years ?? '',
      member.joining_date ?? '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staff_directory.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportStaffToExcel = () => {
    if (!filteredStaff.length) {
      toast({ title: "No data", description: "There are no staff records to export", variant: "destructive" });
      return;
    }

    const worksheetData = filteredStaff.map(member => ({
      'Full Name': member.full_name,
      'Designation': member.designation,
      'Department': member.department || '',
      'Email': member.email,
      'Phone': member.phone || '',
      'Status': member.is_active ? 'Active' : 'Inactive',
      'Experience (years)': member.experience_years ?? '',
      'Joining Date': member.joining_date ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    XLSX.writeFile(workbook, 'staff_directory.xlsx');
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
              <h1 className="font-semibold text-base leading-tight">Staff Management</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.byDepartment.length}</div>
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Staff by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.byDepartment.slice(0, 5).map(({ department, count }) => (
                  <div key={department} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{department}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Experience Distribution
              </CardTitle>
            </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
              <Button size="sm" variant="outline" onClick={exportStaffToCSV}>
                Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={exportStaffToExcel}>
                Export Excel
              </Button>
            </div>

              <div className="space-y-2">
                {stats.byExperience.map(({ range, count }) => (
                  <div key={range} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{range}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Management Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Staff Directory</CardTitle>
              <Button size="sm" onClick={() => { setEditingStaff({ is_active: true }); setIsEditDialogOpen(true); }}>
                <Plus size={14} className="mr-1" /> Add Staff
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, designation, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStaff.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No staff members found.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>{member.designation}</TableCell>
                        <TableCell>{member.department || '-'}</TableCell>
                        <TableCell className="text-sm">{member.email}</TableCell>
                        <TableCell>{member.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={member.is_active ? 'default' : 'secondary'}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <VisibilityToggle
                                     checked={!!member.is_active}
                                     onChange={() => toggleActive(member.id, !!member.is_active)}
                                   />
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   {member.is_active ? 'Active' : 'Inactive'}
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0" 
                              onClick={() => { setViewingStaff(member); setIsViewDialogOpen(true); }}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0" 
                              onClick={() => { setEditingStaff(member); setIsEditDialogOpen(true); }}
                            >
                              <Save size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-destructive" 
                              onClick={() => handleDelete(member.id)}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaff?.id ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input 
                  value={editingStaff?.full_name || ''} 
                  onChange={(e) => setEditingStaff(prev => ({ ...prev, full_name: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={editingStaff?.email || ''} 
                  onChange={(e) => setEditingStaff(prev => ({ ...prev, email: e.target.value }))} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Designation *</Label>
                <Input 
                  value={editingStaff?.designation || ''} 
                  onChange={(e) => setEditingStaff(prev => ({ ...prev, designation: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input 
                  value={editingStaff?.department || ''} 
                  onChange={(e) => setEditingStaff(prev => ({ ...prev, department: e.target.value }))} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={editingStaff?.phone || ''} 
                  onChange={(e) => setEditingStaff(prev => ({ ...prev, phone: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input 
                  type="number"
                  value={editingStaff?.experience_years || ''} 
                  onChange={(e) => setEditingStaff(prev => ({ ...prev, experience_years: parseInt(e.target.value) || null }))} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input 
                  type="date"
                  value={editingStaff?.joining_date || ''} 
                  onChange={(e) => setEditingStaff(prev => ({ ...prev, joining_date: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input 
                  type="number"
                  value={editingStaff?.display_order || 0} 
                  onChange={(e) => setEditingStaff(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Qualifications</Label>
              <Input 
                value={editingStaff?.qualifications || ''} 
                onChange={(e) => setEditingStaff(prev => ({ ...prev, qualifications: e.target.value }))} 
                placeholder="e.g., M.Sc. Computer Science, B.Ed"
              />
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input 
                value={editingStaff?.photo_url || ''} 
                onChange={(e) => setEditingStaff(prev => ({ ...prev, photo_url: e.target.value }))} 
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}><Save size={14} className="mr-1" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {viewingStaff && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                {viewingStaff.photo_url ? (
                  <img 
                    src={viewingStaff.photo_url} 
                    alt={viewingStaff.full_name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{viewingStaff.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{viewingStaff.designation}</p>
                  <Badge variant={viewingStaff.is_active ? 'default' : 'secondary'} className="mt-2">
                    {viewingStaff.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">{viewingStaff.department || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Experience</Label>
                  <p className="font-medium">{viewingStaff.experience_years ? `${viewingStaff.experience_years} years` : '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium text-sm">{viewingStaff.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{viewingStaff.phone || '-'}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Qualifications</Label>
                <p className="font-medium">{viewingStaff.qualifications || '-'}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Joining Date</Label>
                <p className="font-medium">
                  {viewingStaff.joining_date 
                    ? new Date(viewingStaff.joining_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : '-'}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewDialogOpen(false);
                setEditingStaff(viewingStaff);
                setIsEditDialogOpen(true);
              }}
            >
              Edit
            </Button>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
