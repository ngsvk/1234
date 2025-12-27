import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Home, BookOpen, Image, Users, Info, FileText, RotateCcw, Save, Plus, Trash2, ClipboardList, Loader2, Eye, Check, X, Download, Navigation, PanelBottom, ToggleLeft, ToggleRight, LogIn, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { useContent, defaultContent } from '@/contexts/ContentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import collegeLogo from '@/assets/college-logo.png';
import { VisibilityToggle } from '@/components/VisibilityToggle';

function LoginForm() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({ title: "Account created!", description: "You can now sign in." });
        setIsSignUp(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: "Welcome!", description: "You have logged in successfully." });
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Authentication failed", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={collegeLogo} alt="Logo" className="h-20 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl">{isSignUp ? 'Create Account' : 'Admin Login'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create an account to access admin features' : 'Enter your credentials to access the admin panel'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Note: Admin access requires an admin to assign you the admin role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface Submission {
  id: string;
  student_name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  email: string;
  address: string;
  parent_name: string;
  parent_contact: string;
  stream: string;
  previous_school: string;
  sslc_result: string;
  preferred_language: string;
  status: string | null;
  submitted_at: string;
}

function SubmissionsViewer() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('admission_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      toast({ title: "Error", description: "Failed to load submissions", variant: "destructive" });
    } else {
      setSubmissions((data || []) as any as Submission[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('admission_submissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Status updated to ${status}` });
      fetchSubmissions();
    }
  };

  const exportToExcel = () => {
    if (submissions.length === 0) {
      toast({ title: "No data", description: "No submissions to export", variant: "destructive" });
      return;
    }

    const exportData = submissions.map(sub => ({
      'Date': new Date(sub.submitted_at).toLocaleDateString(),
      'Student Name': sub.student_name,
      'Date of Birth': sub.date_of_birth,
      'Gender': sub.gender,
      'Contact Number': sub.contact_number,
      'Email': sub.email,
      'Address': sub.address,
      'Parent Name': sub.parent_name,
      'Parent Contact': sub.parent_contact,
      'Stream': sub.stream,
      'Previous School': sub.previous_school,
      'SSLC Result': sub.sslc_result,
      'Preferred Language': sub.preferred_language,
      'Status': sub.status || 'pending',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admissions');
    XLSX.writeFile(workbook, `admissions_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: "Exported!", description: "Excel file downloaded successfully" });
  };

  const deleteAllSubmissions = async () => {
    if (!confirm('Are you sure you want to delete ALL submissions? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const { error } = await supabase
      .from('admission_submissions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error deleting submissions:', error);
      toast({ title: "Error", description: "Failed to delete submissions", variant: "destructive" });
    } else {
      toast({ title: "Deleted!", description: "All submissions have been deleted" });
      fetchSubmissions();
    }
    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-lg">Admission Submissions ({submissions.length})</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={exportToExcel} disabled={submissions.length === 0}>
            <Download size={16} className="mr-2" /> Export Excel
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteAllSubmissions} disabled={submissions.length === 0 || isDeleting}>
            {isDeleting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
            Delete All
          </Button>
          <Button size="sm" variant="outline" onClick={fetchSubmissions}>
            Refresh
          </Button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No submissions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{sub.student_name}</TableCell>
                  <TableCell>{sub.stream}</TableCell>
                  <TableCell>{sub.contact_number}</TableCell>
                  <TableCell>
                    <Badge variant={
                      sub.status === 'approved' ? 'default' :
                      sub.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedSubmission(sub)}>
                        <Eye size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => updateStatus(sub.id, 'approved')}>
                        <Check size={16} className="text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => updateStatus(sub.id, 'rejected')}>
                        <X size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Student Name</Label>
                  <p className="font-medium">{selectedSubmission.student_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date of Birth</Label>
                  <p className="font-medium">{selectedSubmission.date_of_birth}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gender</Label>
                  <p className="font-medium capitalize">{selectedSubmission.gender}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact Number</Label>
                  <p className="font-medium">{selectedSubmission.contact_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stream</Label>
                  <p className="font-medium">{selectedSubmission.stream}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Parent Name</Label>
                  <p className="font-medium">{selectedSubmission.parent_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Parent Contact</Label>
                  <p className="font-medium">{selectedSubmission.parent_contact}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Previous School</Label>
                  <p className="font-medium">{selectedSubmission.previous_school}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">SSLC Result</Label>
                  <p className="font-medium">{selectedSubmission.sslc_result}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Preferred Language</Label>
                  <p className="font-medium capitalize">{selectedSubmission.preferred_language}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={
                    selectedSubmission.status === 'approved' ? 'default' :
                    selectedSubmission.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {selectedSubmission.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">{selectedSubmission.address}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => { updateStatus(selectedSubmission.id, 'approved'); setSelectedSubmission(null); }}>
                  <Check size={16} className="mr-2" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => { updateStatus(selectedSubmission.id, 'rejected'); setSelectedSubmission(null); }}>
                  <X size={16} className="mr-2" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HomeEditor() {
  const { content, updateContent } = useContent() as any;
  const { toast } = useToast();

  const initialHome = content.home || {};
  const [homeData, setHomeData] = useState({
    heroSection: initialHome.heroSection || {},
    videoSection: initialHome.videoSection || {},
    aboutSection: initialHome.aboutSection || {},
    founderSection: initialHome.founderSection || {},
    updatesSection:
      initialHome.updatesSection || {
        title: 'Updates',
        description:
          'Stay updated with the latest happenings, breakthroughs, and events at SSSBPUC.',
      },
    statistics: initialHome.statistics || { title: '', description: '', items: [] },
    facilities:
      initialHome.facilities || { title: '', description: '', readMorePath: '', items: [] },
    campusLifeGallery:
      initialHome.campusLifeGallery || defaultContent.home.campusLifeGallery || { title: '', description: '', items: [] },
    sisterInstitutes: initialHome.sisterInstitutes || { title: '', items: [] },
    whyUs: initialHome.whyUs || { title: '', description: '', points: [] },
    announcements: initialHome.announcements || [],
  });

  const handleSave = () => {
    updateContent('home', homeData);
    toast({ title: "Saved!", description: "Home page content updated successfully." });
  };

  const updateAnnouncement = (index: number, field: string, value: string) => {
    const newAnnouncements = [...homeData.announcements];
    newAnnouncements[index] = { ...newAnnouncements[index], [field]: value };
    setHomeData({ ...homeData, announcements: newAnnouncements });
  };

  const addAnnouncement = () => {
    setHomeData({
      ...homeData,
      announcements: [...homeData.announcements, { title: 'New Announcement', date: 'Date', description: 'Description' }]
    });
  };

  const removeAnnouncement = (index: number) => {
    setHomeData({
      ...homeData,
      announcements: homeData.announcements.filter((_, i) => i !== index)
    });
  };

  const updateStatistic = (index: number, field: string, value: string) => {
    const newItems = [...(homeData.statistics?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setHomeData({ ...homeData, statistics: { ...homeData.statistics, items: newItems } });
  };

  const updateFacility = (index: number, field: string, value: string) => {
    const newItems = [...(homeData.facilities?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setHomeData({ ...homeData, facilities: { ...homeData.facilities, items: newItems } });
  };

  const addFacilityItem = () => {
    const items = homeData.facilities?.items || [];
    const next = [
      ...items,
      {
        label: 'New Facility',
        name: 'New Facility',
        icon: '🏫',
        imageUrl: '',
        description: '',
        url: '',
      },
    ];
    setHomeData({
      ...homeData,
      facilities: {
        ...homeData.facilities,
        items: next,
      },
    });
  };

  const removeFacilityItem = (index: number) => {
    const items = homeData.facilities?.items || [];
    setHomeData({
      ...homeData,
      facilities: {
        ...homeData.facilities,
        items: items.filter((_, i) => i !== index),
      },
    });
  };

  const updateSisterInstitute = (index: number, field: string, value: string) => {
    const items = homeData.sisterInstitutes?.items || [];
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setHomeData({
      ...homeData,
      sisterInstitutes: {
        ...homeData.sisterInstitutes,
        items: next,
      },
    });
  };

  const updateCampusLifeItem = (index: number, field: string, value: string) => {
    const items = homeData.campusLifeGallery?.items || [];
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setHomeData({
      ...homeData,
      campusLifeGallery: {
        ...homeData.campusLifeGallery,
        items: next,
      },
    });
  };

  const addCampusLifeItem = () => {
    const items = homeData.campusLifeGallery?.items || [];
    setHomeData({
      ...homeData,
      campusLifeGallery: {
        ...homeData.campusLifeGallery,
        items: [
          ...items,
          {
            label: 'New Campus Highlight',
            imageUrl: '',
            alt: '',
          },
        ],
      },
    });
  };

  const removeCampusLifeItem = (index: number) => {
    const items = homeData.campusLifeGallery?.items || [];
    setHomeData({
      ...homeData,
      campusLifeGallery: {
        ...homeData.campusLifeGallery,
        items: items.filter((_, i) => i !== index),
      },
    });
  };
  return (
    <div className="space-y-6">
      {/* Hero Text Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Hero Quote</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Quote Text</Label>
            <Textarea
              rows={3}
              value={homeData.heroSection?.quote || ''}
              onChange={(e) =>
                setHomeData({
                  ...homeData,
                  heroSection: { ...homeData.heroSection, quote: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Subtext (optional)</Label>
            <Input
              value={homeData.heroSection?.subtext || ''}
              onChange={(e) =>
                setHomeData({
                  ...homeData,
                  heroSection: { ...homeData.heroSection, subtext: e.target.value },
                })
              }
              placeholder="Short supporting line under the quote"
            />
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Video Section</h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="videoEnabled"
            checked={homeData.videoSection?.enabled || false}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                videoSection: { ...homeData.videoSection, enabled: e.target.checked },
              })
            }
          />
          <Label htmlFor="videoEnabled">Enable Video Hero</Label>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>YouTube Video ID</Label>
            <Input
              value={homeData.videoSection?.youtubeVideoId || ''}
              onChange={(e) =>
                setHomeData({
                  ...homeData,
                  videoSection: { ...homeData.videoSection, youtubeVideoId: e.target.value },
                })
              }
              placeholder="e.g., zKz4QQKx_jo"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">About Section</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Section Title</Label>
            <Input 
              value={homeData.aboutSection?.title || ''} 
              onChange={(e) => setHomeData({ ...homeData, aboutSection: { ...homeData.aboutSection, title: e.target.value } })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input 
              value={homeData.aboutSection?.heading || ''} 
              onChange={(e) => setHomeData({ ...homeData, aboutSection: { ...homeData.aboutSection, heading: e.target.value } })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={homeData.aboutSection?.description || ''} 
              onChange={(e) => setHomeData({ ...homeData, aboutSection: { ...homeData.aboutSection, description: e.target.value } })}
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Founder Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Founder Section</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium">Founder</h4>
              <Input 
                placeholder="Name" 
                value={homeData.founderSection?.founder?.name || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, founder: { ...homeData.founderSection?.founder, name: e.target.value } } })} 
              />
              <Input 
                placeholder="Title" 
                value={homeData.founderSection?.founder?.title || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, founder: { ...homeData.founderSection?.founder, title: e.target.value } } })} 
              />
              <Textarea 
                placeholder="Description" 
                value={homeData.founderSection?.founder?.description || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, founder: { ...homeData.founderSection?.founder, description: e.target.value } } })} 
              />
              <Input 
                placeholder="Image URL" 
                value={homeData.founderSection?.founder?.imageUrl || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, founder: { ...homeData.founderSection?.founder, imageUrl: e.target.value } } })} 
              />
              <Input
                placeholder="Read more URL (e.g. /about)"
                value={homeData.founderSection?.founder?.readMorePath || ''}
                onChange={(e) =>
                  setHomeData({
                    ...homeData,
                    founderSection: {
                      ...homeData.founderSection,
                      founder: {
                        ...homeData.founderSection?.founder,
                        readMorePath: e.target.value,
                      },
                    },
                  })
                }
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium">Blessings</h4>
              <Input 
                placeholder="Name" 
                value={homeData.founderSection?.blessings?.name || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, blessings: { ...homeData.founderSection?.blessings, name: e.target.value } } })} 
              />
              <Input 
                placeholder="Title" 
                value={homeData.founderSection?.blessings?.title || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, blessings: { ...homeData.founderSection?.blessings, title: e.target.value } } })} 
              />
              <Textarea 
                placeholder="Description" 
                value={homeData.founderSection?.blessings?.description || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, blessings: { ...homeData.founderSection?.blessings, description: e.target.value } } })} 
              />
              <Input 
                placeholder="Image URL" 
                value={homeData.founderSection?.blessings?.imageUrl || ''} 
                onChange={(e) => setHomeData({ ...homeData, founderSection: { ...homeData.founderSection, blessings: { ...homeData.founderSection?.blessings, imageUrl: e.target.value } } })} 
              />
              <Input
                placeholder="Read more URL (e.g. /about)"
                value={homeData.founderSection?.blessings?.readMorePath || ''}
                onChange={(e) =>
                  setHomeData({
                    ...homeData,
                    founderSection: {
                      ...homeData.founderSection,
                      blessings: {
                        ...homeData.founderSection?.blessings,
                        readMorePath: e.target.value,
                      },
                    },
                  })
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Announcements / Updates Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Updates Section</h3>
        </div>
        <div className="space-y-2">
          <Label>Section Title</Label>
          <Input
            value={homeData.updatesSection?.title || ''}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                updatesSection: { ...homeData.updatesSection, title: e.target.value },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Section Description</Label>
          <Textarea
            rows={3}
            value={homeData.updatesSection?.description || ''}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                updatesSection: { ...homeData.updatesSection, description: e.target.value },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <h3 className="font-semibold text-lg">Homepage Announcements (optional)</h3>
          <Button size="sm" onClick={addAnnouncement}>
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
        {(homeData.announcements || []).map((ann, index) => (
          <Card key={index}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Announcement {index + 1}</span>
                <Button size="sm" variant="ghost" onClick={() => removeAnnouncement(index)}>
                  <Trash2 size={16} />
                </Button>
              </div>
              <Input
                placeholder="Title"
                value={ann.title}
                onChange={(e) => updateAnnouncement(index, 'title', e.target.value)}
              />
              <Input
                placeholder="Date"
                value={ann.date}
                onChange={(e) => updateAnnouncement(index, 'date', e.target.value)}
              />
              <Textarea
                placeholder="Description"
                value={ann.description}
                onChange={(e) => updateAnnouncement(index, 'description', e.target.value)}
              />
              <Input
                placeholder="YouTube URL (optional)"
                value={ann.youtubeUrl || ''}
                onChange={(e) => updateAnnouncement(index, 'youtubeUrl', e.target.value)}
              />
              <Input
                placeholder="Read More URL (optional)"
                value={ann.readMoreUrl || ''}
                onChange={(e) => updateAnnouncement(index, 'readMoreUrl', e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Statistics Section</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={homeData.statistics?.title || ''} 
            onChange={(e) => setHomeData({ ...homeData, statistics: { ...homeData.statistics, title: e.target.value } })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input 
            value={homeData.statistics?.description || ''} 
            onChange={(e) => setHomeData({ ...homeData, statistics: { ...homeData.statistics, description: e.target.value } })} 
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {homeData.statistics?.items?.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-2">
                <Input placeholder="Value" value={stat.value} onChange={(e) => updateStatistic(index, 'value', e.target.value)} />
                <Input placeholder="Label" value={stat.label} onChange={(e) => updateStatistic(index, 'label', e.target.value)} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Facilities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Facilities Section</h3>
          <Button size="sm" variant="outline" onClick={addFacilityItem}>
            <Plus size={16} className="mr-1" /> Add Facility
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={homeData.facilities?.title || ''}
            onChange={(e) => setHomeData({ ...homeData, facilities: { ...homeData.facilities, title: e.target.value } })}
          />
        </div>
        <div className="space-y-2">
          <Label>Section Description</Label>
          <Textarea
            rows={3}
            value={homeData.facilities?.description || ''}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                facilities: { ...homeData.facilities, description: e.target.value },
              })
            }
          />
        </div>
        <div className="grid gap-4">
          {homeData.facilities?.items?.map((facility, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 grid md:grid-cols-2 gap-2">
                    <Input
                      placeholder="Label (small pill text)"
                      value={facility.label || ''}
                      onChange={(e) => updateFacility(index, 'label', e.target.value)}
                    />
                    <Input
                      placeholder="Name (card title)"
                      value={facility.name}
                      onChange={(e) => updateFacility(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Image URL"
                      value={facility.imageUrl}
                      onChange={(e) => updateFacility(index, 'imageUrl', e.target.value)}
                      className="md:col-span-2"
                    />
                  <Textarea
                    placeholder="Description"
                    value={facility.description}
                    onChange={(e) => updateFacility(index, 'description', e.target.value)}
                    className="md:col-span-2"
                  />
                  <Input
                    placeholder="Learn More URL (optional)"
                    value={facility.url || ''}
                    onChange={(e) => updateFacility(index, 'url', e.target.value)}
                    className="md:col-span-2"
                  />
                </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive mt-1"
                    onClick={() => removeFacilityItem(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sister Institutes */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Sister Institutes</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={homeData.sisterInstitutes?.title || ''} 
            onChange={(e) => setHomeData({ ...homeData, sisterInstitutes: { ...homeData.sisterInstitutes, title: e.target.value } })} 
          />
        </div>
        <div className="grid gap-4">
          {homeData.sisterInstitutes?.items?.map((institute, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={institute.name}
                    onChange={(e) => updateSisterInstitute(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Image URL"
                    value={institute.imageUrl}
                    onChange={(e) => updateSisterInstitute(index, 'imageUrl', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Campus Life (Homepage) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Campus Life (Homepage)</h3>
          <Button size="sm" variant="outline" onClick={addCampusLifeItem}>
            <Plus size={16} className="mr-1" /> Add Campus Item
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={homeData.campusLifeGallery?.title || ''}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                campusLifeGallery: {
                  ...(homeData.campusLifeGallery || { items: [] }),
                  title: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={homeData.campusLifeGallery?.description || ''}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                campusLifeGallery: {
                  ...(homeData.campusLifeGallery || { items: [] }),
                  description: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="grid gap-4">
          {homeData.campusLifeGallery?.items?.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 grid md:grid-cols-2 gap-2">
                    <Input
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) => updateCampusLifeItem(index, 'label', e.target.value)}
                    />
                    <Input
                      placeholder="Image URL"
                      value={item.imageUrl}
                      onChange={(e) => updateCampusLifeItem(index, 'imageUrl', e.target.value)}
                      className="md:col-span-2"
                    />
                    <Input
                      placeholder="Alt text (for accessibility/SEO)"
                      value={item.alt || ''}
                      onChange={(e) => updateCampusLifeItem(index, 'alt', e.target.value)}
                      className="md:col-span-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => {
                        setHomeData((prev: any) => {
                          const items = prev.campusLifeGallery?.items || [];
                          if (index === 0 || index >= items.length) return prev;
                          const next = [...items];
                          const [moved] = next.splice(index, 1);
                          next.splice(index - 1, 0, moved);
                          return {
                            ...prev,
                            campusLifeGallery: {
                              ...prev.campusLifeGallery,
                              items: next,
                            },
                          };
                        });
                      }}
                      aria-label="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={index === (homeData.campusLifeGallery?.items?.length || 0) - 1}
                      onClick={() => {
                        setHomeData((prev: any) => {
                          const items = prev.campusLifeGallery?.items || [];
                          if (index >= items.length - 1) return prev;
                          const next = [...items];
                          const [moved] = next.splice(index, 1);
                          next.splice(index + 1, 0, moved);
                          return {
                            ...prev,
                            campusLifeGallery: {
                              ...prev.campusLifeGallery,
                              items: next,
                            },
                          };
                        });
                      }}
                      aria-label="Move down"
                    >
                      ↓
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeCampusLifeItem(index)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Why SSSBPUC Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Why SSSBPUC Section</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={homeData.whyUs?.title || ''}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                whyUs: { ...(homeData.whyUs || { points: [] }), title: e.target.value },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={homeData.whyUs?.description || ''}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                whyUs: { ...(homeData.whyUs || { points: [] }), description: e.target.value },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Points (one per line)</Label>
          <Textarea
            value={(homeData.whyUs?.points || []).join('\n')}
            onChange={(e) =>
              setHomeData({
                ...homeData,
                whyUs: {
                  ...(homeData.whyUs || {}),
                  points: e.target.value.split('\n').filter((p) => p.trim()),
                },
              })
            }
            rows={4}
          />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full">
        <Save size={16} className="mr-2" /> Save Changes
      </Button>
    </div>
  );
}

function AcademicsEditor() {
  const { toast } = useToast();
  const [intro, setIntro] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });
  const [calendar, setCalendar] = useState<{ title: string; events: { event: string; date: string }[] }>(
    { title: 'Academic Calendar', events: [] },
  );
  const [programs, setPrograms] = useState<any[]>([]);
  const [contentId, setContentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [contentResult, programsResult] = await Promise.all([
        supabase.from('academics_content').select('*').limit(1).maybeSingle(),
        supabase.from('academic_programs').select('*').order('display_order', { ascending: true }),
      ]);

      const contentRow: any = contentResult.data || null;
      if (contentRow) {
        setContentId(contentRow.id);
        setIntro({
          title: contentRow.hero_title || '',
          description: contentRow.hero_description || '',
        });
        const events = Array.isArray(contentRow.calendar_events)
          ? (contentRow.calendar_events as { event: string; date: string }[])
          : [];
        setCalendar({
          title: contentRow.calendar_title || 'Academic Calendar',
          events,
        });
      }

      setPrograms((programsResult.data as any[]) || []);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      const payload: any = {
        hero_title: intro.title || null,
        hero_description: intro.description || null,
        calendar_title: calendar.title || null,
        calendar_events: calendar.events || [],
      };

      if (contentId) {
        const { error } = await supabase.from('academics_content').update(payload).eq('id', contentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('academics_content')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        setContentId(data.id);
      }

      toast({ title: 'Saved!', description: 'Academics introduction and calendar updated successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to save academics content', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProgram = (index: number, field: string, value: any) => {
    setPrograms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addProgram = () => {
    setPrograms((prev) => [
      ...prev,
      {
        id: undefined,
        name: '',
        description: '',
        icon: null,
        display_order: prev.length + 1,
        is_visible: true,
      },
    ]);
  };

  const removeProgram = async (index: number) => {
    const program = programs[index];
    if (program?.id) {
      if (!window.confirm('Delete this program?')) return;
      const { error } = await supabase.from('academic_programs').delete().eq('id', program.id);
      if (error) {
        toast({ title: 'Error', description: 'Failed to delete program', variant: 'destructive' });
        return;
      }
    }
    setPrograms((prev) => prev.filter((_, i) => i !== index));
  };

  const savePrograms = async () => {
    setIsSaving(true);
    try {
      for (const program of programs) {
        if (!program.name) continue;

        const payload: any = {
          name: program.name,
          description: program.description || null,
          icon: program.icon || null,
          display_order: program.display_order ?? 0,
          is_visible: program.is_visible ?? true,
        };

        if (program.id) {
          const { error } = await supabase.from('academic_programs').update(payload).eq('id', program.id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('academic_programs')
            .insert(payload)
            .select('id')
            .single();
          if (error) throw error;
          program.id = data.id;
        }
      }

      toast({ title: 'Saved!', description: 'Academic programs updated successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to save programs', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateCalendarField = (field: 'title', value: string) => {
    setCalendar((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCalendarEvent = (index: number, field: 'event' | 'date', value: string) => {
    setCalendar((prev) => {
      const events = prev.events || [];
      const nextEvents = [...events];
      nextEvents[index] = { ...nextEvents[index], [field]: value };
      return { ...prev, events: nextEvents };
    });
  };

  const addCalendarEvent = () => {
    setCalendar((prev) => ({
      ...prev,
      events: [...(prev.events || []), { event: 'New Event', date: '' }],
    }));
  };

  const removeCalendarEvent = (index: number) => {
    setCalendar((prev) => ({
      ...prev,
      events: (prev.events || []).filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AcademicsLoginSettings />
      
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Introduction</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={intro.title}
            onChange={(e) => setIntro((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={intro.description}
            onChange={(e) => setIntro((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <Button type="button" size="sm" onClick={handleSaveContent} disabled={isSaving}>
          {isSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
          Save Intro & Calendar
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Academic Programs / Streams</h3>
          <Button type="button" size="sm" variant="outline" onClick={addProgram}>
            <Plus size={14} className="mr-1" /> Add Program
          </Button>
        </div>

        {programs.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No programs yet. Click "Add Program" to create one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {programs.map((program, index) => (
              <Card key={program.id ?? index}>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        value={program.name || ''}
                        onChange={(e) => updateProgram(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Icon key (optional)</Label>
                      <Input
                        value={program.icon || ''}
                        onChange={(e) => updateProgram(index, 'icon', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Display order</Label>
                      <Input
                        type="number"
                        value={program.display_order ?? index + 1}
                        onChange={(e) => updateProgram(index, 'display_order', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <VisibilityToggle
                               checked={program.is_visible !== false}
                               onChange={() => updateProgram(index, 'is_visible', !program.is_visible)}
                             />
                           </TooltipTrigger>
                           <TooltipContent>
                             {program.is_visible !== false ? 'Visible' : 'Hidden'}
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={program.description || ''}
                        onChange={(e) => updateProgram(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeProgram(index)}
                    >
                      <Trash2 size={14} className="mr-1" /> Remove Program
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button type="button" size="sm" onClick={savePrograms} disabled={isSaving}>
          {isSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
          Save Programs
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Academic Calendar</h3>
        <div className="space-y-2">
          <Label>Calendar Title</Label>
          <Input
            value={calendar.title}
            onChange={(e) => updateCalendarField('title', e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {(calendar.events || []).map((item, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-3 items-start">
              <div className="space-y-1">
                <Label>Event</Label>
                <Input
                  value={item.event || ''}
                  onChange={(e) => updateCalendarEvent(index, 'event', e.target.value)}
                  placeholder="e.g. Semester Examinations"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label>Month / Date</Label>
                  <Input
                    value={item.date || ''}
                    onChange={(e) => updateCalendarEvent(index, 'date', e.target.value)}
                    placeholder="e.g. March 2025"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive mb-0.5"
                  onClick={() => removeCalendarEvent(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addCalendarEvent}>
          <Plus size={14} className="mr-1" /> Add Calendar Event
        </Button>
      </div>
    </div>
  );
}

function AcademicsLoginSettings() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();

  const initialSettings: any = content.academicsSettings || { showLoginButton: true };
  const [showLoginButton, setShowLoginButton] = useState(initialSettings.showLoginButton ?? true);

  const handleSave = () => {
    updateContent('academicsSettings', { showLoginButton });
    toast({ title: "Saved!", description: "Academics login settings updated successfully." });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Login Button Settings</h3>
        <p className="text-sm text-muted-foreground">
          Control whether the Staff & Student Login button is visible on the Academics page.
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label className="text-base">Show Login Button</Label>
            <p className="text-sm text-muted-foreground">
              Display Staff & Student Login button on Academics page
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={showLoginButton ? "visibility" : "visibilityOff"}
                  size="icon"
                  className="ml-4 h-7 w-7"
                  onClick={() => setShowLoginButton(!showLoginButton)}
                >
                  <Eye size={14} className={!showLoginButton ? 'opacity-50' : ''} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showLoginButton ? 'Visible' : 'Hidden'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button type="button" size="sm" onClick={handleSave}>
          <Save size={14} className="mr-1" />
          Save Settings
        </Button>
      </div>
    </Card>
  );
}

function GalleryEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();

  const initialGallery: any = content.gallery || {};
  const [data, setData] = useState({
    title: initialGallery.title || '',
    description: initialGallery.description || '',
    images: initialGallery.images || [],
  });

  const handleSave = () => {
    updateContent('gallery', data);
    toast({ title: "Saved!", description: "Gallery content updated successfully." });
  };

  const updateImage = (index: number, field: string, value: string) => {
    const images = data.images || [];
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setData({ ...data, images: newImages });
  };

  const addImage = () => {
    const images = data.images || [];
    setData({
      ...data,
      images: [
        ...images,
        {
          url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
          caption: 'New Image',
          category: 'Events',
        },
      ],
    });
  };

  const removeImage = (index: number) => {
    const images = data.images || [];
    setData({ ...data, images: images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Gallery Settings</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Images</h3>
          <Button size="sm" onClick={addImage}>
            <Plus size={16} className="mr-1" /> Add Image
          </Button>
        </div>
        <div className="grid gap-4">
          {(data.images || []).map((img: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  <img src={img.url} alt={img.caption} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Image URL"
                      value={img.url}
                      onChange={(e) => updateImage(index, 'url', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Caption"
                        value={img.caption}
                        onChange={(e) => updateImage(index, 'caption', e.target.value)}
                      />
                      <Input
                        placeholder="Category"
                        value={img.category}
                        onChange={(e) => updateImage(index, 'category', e.target.value)}
                        className="w-32"
                      />
                      <Button size="icon" variant="ghost" onClick={() => removeImage(index)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} className="w-full">
        <Save size={16} className="mr-2" /> Save Changes
      </Button>
    </div>
  );
}

function CampusLifeEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();

  const initialCampus: any = content.campusLife || {};
  const [data, setData] = useState({
    title: initialCampus.title || '',
    description: initialCampus.description || '',
    sections: initialCampus.sections || [],
    saturdayActivities: initialCampus.saturdayActivities || [],
  });

  const [facilities, setFacilities] = useState<any[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [isSavingFacilities, setIsSavingFacilities] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      const { data, error } = await (supabase as any)
        .from('facilities')
        .select('id, name, description, icon, display_order, is_visible, url')
        .order('display_order', { ascending: true });


      if (error) {
        console.error('Error loading facilities', error);
        toast({ title: 'Error', description: 'Failed to load facilities', variant: 'destructive' });
      } else {
        setFacilities((data || []) as any[]);
      }
      setIsLoadingFacilities(false);
    };

    fetchFacilities();
  }, [toast]);

  const handleSave = () => {
    updateContent('campusLife', data);
    toast({ title: 'Saved!', description: 'Campus Life content updated successfully.' });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const sections = data.sections || [];
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setData({ ...data, sections: newSections });
  };

  const updateFacility = (index: number, field: string, value: any) => {
    const next = [...facilities];
    next[index] = { ...next[index], [field]: value };
    setFacilities(next);
  };

  const addFacility = () => {
    setFacilities([
      ...facilities,
      {
        id: undefined,
        name: '',
        description: '',
        icon: '',
        display_order: facilities.length + 1,
        is_visible: true,
      },
    ]);
  };

  const removeFacility = async (index: number) => {
    const facility = facilities[index];
    if (facility?.id) {
      if (!window.confirm('Delete this facility?')) return;
      const { error } = await (supabase as any).from('facilities').delete().eq('id', facility.id);
      if (error) {
        toast({ title: 'Error', description: 'Failed to delete facility', variant: 'destructive' });
        return;
      }
    }
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  const saveFacilities = async () => {
    setIsSavingFacilities(true);
    try {
      for (const facility of facilities) {
        if (!facility.name) continue;
 
        const payload: any = {
          name: facility.name,
          description: facility.description || null,
          icon: facility.icon || null,
          display_order: facility.display_order ?? 0,
          is_visible: facility.is_visible ?? true,
          url: facility.url || null,
        };

        if (facility.id) {
          const { error } = await (supabase as any)
            .from('facilities')
            .update(payload)
            .eq('id', facility.id);
          if (error) throw error;
        } else {
          const { data, error } = await (supabase as any)
            .from('facilities')
            .insert(payload)
            .select('id')
            .single();
          if (error) throw error;
          facility.id = data.id;
        }
      }
      toast({ title: 'Saved!', description: 'Facilities updated successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to save facilities', variant: 'destructive' });
    } finally {
      setIsSavingFacilities(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Page Header</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
          />
        </div>
      </div>

      {(data.sections || []).map((section: any, index: number) => (
        <div key={index} className="space-y-2 p-4 border rounded-lg">
          <Label>{section?.title}</Label>
          <Textarea
            value={section?.description || ''}
            onChange={(e) => updateSection(index, 'description', e.target.value)}
          />
        </div>
      ))}

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Saturday Activities</h3>
        <Textarea
          value={(data.saturdayActivities || []).join('\n')}
          onChange={(e) =>
            setData({
              ...data,
              saturdayActivities: e.target.value
                .split('\n')
                .filter((a) => a.trim()),
            })
          }
          rows={5}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Facilities (backend table)</h3>
        <p className="text-sm text-muted-foreground">
          These items power the Our Facilities cards on the Campus Life page.
        </p>

        {isLoadingFacilities ? (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            Loading facilities...
          </div>
        ) : facilities.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No facilities yet. Click &quot;Add Facility&quot; to create one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {facilities.map((facility, index) => (
              <Card key={facility.id ?? index}>
                <CardContent className="pt-4 space-y-2">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        value={facility.name || ''}
                        onChange={(e) => updateFacility(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Icon key (e.g. flask, book, trophy)</Label>
                      <Input
                        value={facility.icon || ''}
                        onChange={(e) => updateFacility(index, 'icon', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Display order</Label>
                      <Input
                        type="number"
                        value={facility.display_order ?? index + 1}
                        onChange={(e) => updateFacility(index, 'display_order', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <VisibilityToggle
                               checked={facility.is_visible !== false}
                               onChange={() => updateFacility(index, 'is_visible', !facility.is_visible)}
                             />
                           </TooltipTrigger>
                           <TooltipContent>
                             {facility.is_visible !== false ? 'Visible' : 'Hidden'}
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={facility.description || ''}
                        onChange={(e) => updateFacility(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Read more URL (optional)</Label>
                      <Input
                        placeholder="https://... or /about, /campus"
                        value={facility.url || ''}
                        onChange={(e) => updateFacility(index, 'url', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeFacility(index)}
                    >
                      <Trash2 size={14} className="mr-1" /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addFacility}>
            <Plus size={14} className="mr-1" /> Add Facility
          </Button>
          <Button type="button" size="sm" onClick={saveFacilities} disabled={isSavingFacilities}>
            {isSavingFacilities ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : (
              <Save size={14} className="mr-1" />
            )}
            Save Facilities
          </Button>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full">
        <Save size={16} className="mr-2" /> Save Campus Life Text
      </Button>
    </div>
  );
}

function AboutEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.about);

  const handleSave = () => {
    updateContent('about', data);
    toast({ title: "Saved!", description: "About content updated successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">History</h3>
        <Textarea value={data.history} onChange={(e) => setData({ ...data, history: e.target.value })} rows={4} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Vision</h3>
        <Textarea value={data.vision} onChange={(e) => setData({ ...data, vision: e.target.value })} rows={3} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Mission (one per line)</h3>
        <Textarea value={(data.mission || []).join('\n')} onChange={(e) => setData({ ...data, mission: e.target.value.split('\n').filter(m => m.trim()) })} rows={4} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Principal's Message</h3>
        <Textarea value={data.principalMessage} onChange={(e) => setData({ ...data, principalMessage: e.target.value })} rows={4} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Contact Information</h3>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={data.contact?.address || ''} onChange={(e) => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={data.contact?.phone || ''} onChange={(e) => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={data.contact?.email || ''} onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Google Maps Embed URL</Label>
          <Input 
            value={data.contact?.mapUrl || ''} 
            onChange={(e) => setData({ ...data, contact: { ...data.contact, mapUrl: e.target.value } })} 
            placeholder="Paste Google Maps embed URL here"
          />
          <p className="text-xs text-muted-foreground">Get embed URL: Go to Google Maps → Share → Embed a map → Copy HTML → Paste the src URL</p>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function NavbarEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.navbar);

  const handleSave = () => {
    updateContent('navbar', data);
    toast({ title: "Saved!", description: "Navbar content updated successfully." });
  };

  const updateLink = (index: number, field: string, value: string | boolean) => {
    const newLinks = [...data.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setData({ ...data, links: newLinks });
  };

  const addLink = () => {
    setData({ ...data, links: [...data.links, { name: "New Link", path: "/new-page", enabled: true }] });
  };

  const removeLink = (index: number) => {
    setData({ ...data, links: data.links.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">College Info</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>College Name</Label>
            <Input value={data.collegeName} onChange={(e) => setData({ ...data, collegeName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Logos</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Left Logo URL</Label>
            <Input value={data.leftLogoUrl} onChange={(e) => setData({ ...data, leftLogoUrl: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Left Logo Link (href)</Label>
            <Input value={data.leftLogoHref || '/'} onChange={(e) => setData({ ...data, leftLogoHref: e.target.value })} placeholder="/" />
          </div>
          <div className="space-y-2">
            <Label>Right Logo URL</Label>
            <Input value={data.rightLogoUrl} onChange={(e) => setData({ ...data, rightLogoUrl: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Right Logo Link (href)</Label>
            <Input value={data.rightLogoHref || '/'} onChange={(e) => setData({ ...data, rightLogoHref: e.target.value })} placeholder="/" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Admission Button</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input value={data.admissionButtonText} onChange={(e) => setData({ ...data, admissionButtonText: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <VisibilityToggle
                     checked={data.admissionButtonEnabled !== false}
                     onChange={() =>
                       setData({
                         ...data,
                         admissionButtonEnabled:
                           data.admissionButtonEnabled === false ? true : false,
                       })
                     }
                   />
                 </TooltipTrigger>
                 <TooltipContent>
                   {data.admissionButtonEnabled !== false ? 'Visible' : 'Hidden'}
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Navigation Links</h3>
          <Button size="sm" variant="outline" onClick={addLink}><Plus size={14} className="mr-1" /> Add</Button>
        </div>
        {data.links.map((link, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Link Name</Label>
                    <Input value={link.name} onChange={(e) => updateLink(index, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Path</Label>
                    <Input value={link.path} onChange={(e) => updateLink(index, 'path', e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <VisibilityToggle
                             checked={link.enabled !== false}
                             onChange={() =>
                               updateLink(
                                 index,
                                 'enabled',
                                 link.enabled === false ? true : false,
                               )
                             }
                           />
                         </TooltipTrigger>
                         <TooltipContent>
                           {link.enabled !== false ? 'On' : 'Off'}
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </div>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => removeLink(index)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} size="sm" className="w-full"><Save size={14} className="mr-1" /> Save Changes</Button>
    </div>
  );
}

function FooterEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();
  const [data, setData] = useState(content.footer);

  const handleSave = () => {
    updateContent('footer', data);
    toast({ title: "Saved!", description: "Footer content updated successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Basic Info</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>College Name</Label>
            <Input value={data.collegeName} onChange={(e) => setData({ ...data, collegeName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input value={data.logoUrl} onChange={(e) => setData({ ...data, logoUrl: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tagline</Label>
          <Textarea value={data.tagline} onChange={(e) => setData({ ...data, tagline: e.target.value })} rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Copyright Text</Label>
          <Input value={data.copyright} onChange={(e) => setData({ ...data, copyright: e.target.value })} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Contact Information</h3>
        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea value={data.contact.address} onChange={(e) => setData({ ...data, contact: { ...data.contact, address: e.target.value } })} rows={2} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={data.contact.phone} onChange={(e) => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={data.contact.email} onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">College Hours</h3>
        <div className="space-y-2">
          <Label>Weekdays</Label>
          <Input value={data.hours.weekdays} onChange={(e) => setData({ ...data, hours: { ...data.hours, weekdays: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Saturday</Label>
          <Input value={data.hours.saturday} onChange={(e) => setData({ ...data, hours: { ...data.hours, saturday: e.target.value } })} />
        </div>
        <div className="space-y-2">
          <Label>Sunday</Label>
          <Input value={data.hours.sunday} onChange={(e) => setData({ ...data, hours: { ...data.hours, sunday: e.target.value } })} />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function AdmissionEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();

  const initialAdmission: any = content.admission || {};
  const [data, setData] = useState({
    title: initialAdmission.title || '',
    description: initialAdmission.description || '',
    eligibility: initialAdmission.eligibility || [],
    documents: initialAdmission.documents || [],
    instructions: initialAdmission.instructions || '',
    streams: initialAdmission.streams || [],
  });

  const handleSave = () => {
    updateContent('admission', data);
    toast({ title: "Saved!", description: "Admission content updated successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Page Header</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Eligibility (one per line)</h3>
        <Textarea
          value={(data.eligibility || []).join('\n')}
          onChange={(e) =>
            setData({
              ...data,
              eligibility: e.target.value.split('\n').filter((el) => el.trim()),
            })
          }
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Required Documents (one per line)</h3>
        <Textarea
          value={(data.documents || []).join('\n')}
          onChange={(e) =>
            setData({
              ...data,
              documents: e.target.value.split('\n').filter((d) => d.trim()),
            })
          }
          rows={6}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Streams</h3>
        <div className="space-y-2">
          {(data.streams || []).map((stream: string, index: number) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={stream}
                onChange={(e) => {
                  const updated = [...(data.streams || [])];
                  updated[index] = e.target.value;
                  setData({ ...data, streams: updated });
                }}
                placeholder="e.g. Science (PCMB)"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => {
                  setData({
                    ...data,
                    streams: (data.streams || []).filter((_, i) => i !== index),
                  });
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setData({ ...data, streams: [...(data.streams || []), ""] })}
        >
          <Plus size={14} className="mr-1" /> Add Stream
        </Button>
      </div>
 
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Instructions</h3>
        <Textarea value={data.instructions} onChange={(e) => setData({ ...data, instructions: e.target.value })} rows={3} />
      </div>
 
      <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2" /> Save Changes</Button>
    </div>
  );
}

function PortalSettingsEditor() {
  const { content, updateContent } = useContent();
  const { toast } = useToast();

  const initialPortal: any = content.portal || { staffLoginEnabled: true, studentLoginEnabled: true };
  const [data, setData] = useState({
    staffLoginEnabled: initialPortal.staffLoginEnabled ?? true,
    studentLoginEnabled: initialPortal.studentLoginEnabled ?? true,
  });

  const handleSave = () => {
    updateContent('portal', data);
    toast({ title: "Saved!", description: "Portal settings updated successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Portal Login Options</h3>
        <p className="text-sm text-muted-foreground">
          Control which login buttons are visible on the portal login page.
        </p>
        
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Staff Login</Label>
                <p className="text-sm text-muted-foreground">
                  Allow staff members to log in to the portal
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={data.staffLoginEnabled ? "visibility" : "visibilityOff"}
                      size="icon"
                      onClick={() => setData({ ...data, staffLoginEnabled: !data.staffLoginEnabled })}
                      className="ml-4 h-7 w-7"
                    >
                      <Eye size={14} className={!data.staffLoginEnabled ? 'opacity-50' : ''} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {data.staffLoginEnabled ? 'Enabled' : 'Disabled'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label className="text-base">Student Login</Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to log in to the portal
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={data.studentLoginEnabled ? "visibility" : "visibilityOff"}
                      size="icon"
                      onClick={() => setData({ ...data, studentLoginEnabled: !data.studentLoginEnabled })}
                      className="ml-4 h-7 w-7"
                    >
                      <Eye size={14} className={!data.studentLoginEnabled ? 'opacity-50' : ''} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {data.studentLoginEnabled ? 'Enabled' : 'Disabled'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>
      </div>

      <Button onClick={handleSave} className="w-full">
        <Save size={16} className="mr-2" /> Save Changes
      </Button>
    </div>
  );
}

function AdminAccessManager() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles with role information
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const usersWithRoles = (profilesData || []).map(profile => ({
        id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        isAdmin: rolesData?.some(r => r.user_id === profile.user_id && r.role === 'admin') || false,
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const grantAdminAccess = async (userId: string, email: string) => {
    setActioningUserId(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        // If it's a unique constraint error, the role already exists
        if (error.code === '23505') {
          toast({ 
            title: 'Already Admin', 
            description: `${email} already has admin access` 
          });
          // Refresh to show correct status
          await fetchUsers();
          return;
        }
        throw error;
      }

      toast({ 
        title: 'Success!', 
        description: `Admin access granted to ${email}` 
      });
      
      // Refresh user list from database to ensure sync
      await fetchUsers();
    } catch (error: any) {
      console.error('Error granting admin:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to grant admin access',
        variant: 'destructive' 
      });
    } finally {
      setActioningUserId(null);
    }
  };

  const revokeAdminAccess = async (userId: string, email: string) => {
    if (!window.confirm(`Revoke admin access for ${email}?`)) return;
    
    setActioningUserId(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast({ 
        title: 'Success!', 
        description: `Admin access revoked for ${email}` 
      });
      
      // Refresh user list from database to ensure sync
      await fetchUsers();
    } catch (error: any) {
      console.error('Error revoking admin:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to revoke admin access',
        variant: 'destructive' 
      });
    } finally {
      setActioningUserId(null);
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete ${email}? This action cannot be undone.`)) return;
    
    setActioningUserId(userId);
    try {
      // Call edge function to properly delete user from auth system
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      toast({ 
        title: 'Success!', 
        description: `User ${email} has been deleted` 
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete user',
        variant: 'destructive' 
      });
    } finally {
      setActioningUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Admin Access Management</h3>
        <p className="text-sm text-muted-foreground">
          Admin access is automatically granted to admin@admin.com upon signup. View all registered users below.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Automatic Admin Access</p>
              <p className="text-sm text-muted-foreground">Logged in as: {currentUser?.email}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Admin access is automatically granted when admin@admin.com signs up</p>
            <p>✓ No manual configuration needed</p>
            <p>✓ Full admin panel access enabled</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="default" className="text-xs">
                          <Shield size={12} className="mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!user.isAdmin ? (
                          <Button
                            onClick={() => grantAdminAccess(user.id, user.email)}
                            disabled={actioningUserId === user.id}
                            variant="outline"
                            size="sm"
                          >
                            {actioningUserId === user.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Shield size={14} className="mr-1" />
                                Grant Admin
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => revokeAdminAccess(user.id, user.email)}
                            disabled={actioningUserId === user.id || user.id === currentUser?.id}
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700"
                          >
                            {actioningUserId === user.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <X size={14} className="mr-1" />
                                Revoke
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteUser(user.id, user.email)}
                          disabled={actioningUserId === user.id || user.id === currentUser?.id}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/90"
                        >
                          {actioningUserId === user.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Staff and Portal management moved to dedicated admin pages at /admin/staff and /admin/portal

function NewsEditor() {
  const { toast } = useToast();
  const { content, updateContent } = useContent() as any;
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initialNews = (content && content.news) || {};
  const [pageTitle, setPageTitle] = useState<string>(
    initialNews.title || 'College News & Updates'
  );
  const [pageDescription, setPageDescription] = useState<string>(
    initialNews.description ||
      'Browse all published announcements, events, and important updates from Sri Sathya Sai Baba PU College.'
  );

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('updates')
        .select('id, title, description, date, is_published, read_more_url, youtube_url')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading news', error);
        toast({ title: 'Error', description: 'Failed to load news items', variant: 'destructive' });
      } else {
        setItems(data || []);
      }
      setIsLoading(false);
    };

    load();
  }, [toast]);

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      {
        id: undefined,
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        is_published: false,
        read_more_url: '',
        youtube_url: '',
      },
      ...prev,
    ]);
  };

  const removeItem = async (index: number) => {
    const item = items[index];
    if (item?.id) {
      if (!window.confirm('Delete this news item?')) return;
      const { error } = await supabase.from('updates').delete().eq('id', item.id);
      if (error) {
        toast({ title: 'Error', description: 'Failed to delete news item', variant: 'destructive' });
        return;
      }
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    setIsSaving(true);
    try {
      // Save page-level News header content
      updateContent('news', {
        title: pageTitle,
        description: pageDescription,
      });

      for (const item of items) {
        if (!item.title) continue;

        const payload: any = {
          title: item.title,
          description: item.description || null,
          date: item.date || new Date().toISOString().slice(0, 10),
          is_published: item.is_published ?? false,
          read_more_url: item.read_more_url || null,
          youtube_url: item.youtube_url || null,
        };

        if (item.id) {
          const { error } = await supabase.from('updates').update(payload).eq('id', item.id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('updates')
            .insert(payload)
            .select('id')
            .single();
          if (error) throw error;
          item.id = data.id;
        }
      }

      toast({ title: 'Saved!', description: 'News page content and items updated successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to save news', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border pb-4">
        <h3 className="font-semibold text-lg">News Page Header</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Page title</Label>
            <Input
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="College News & Updates"
            />
          </div>
          <div className="space-y-1">
            <Label>Intro description</Label>
            <Textarea
              rows={3}
              value={pageDescription}
              onChange={(e) => setPageDescription(e.target.value)}
              placeholder="Browse all published announcements, events, and important updates..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg">News & Updates Items</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only items marked as <span className="font-medium">Published</span> are visible on the public <span className="font-mono">/news</span> page.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus size={14} className="mr-1" /> Add News
          </Button>
        </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No news items yet. Click "Add News" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id ?? index} className="border border-border/70 shadow-sm">
              <CardContent className="pt-4 pb-5 px-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Announcement {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/5"
                    onClick={() => removeItem(index)}
                    aria-label="Remove announcement"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="New Announcement"
                    value={item.title || ''}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="Date"
                    value={item.date || ''}
                    onChange={(e) => updateItem(index, 'date', e.target.value)}
                  />
                  <Textarea
                    rows={3}
                    placeholder="Description"
                    value={item.description || ''}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                  <Input
                    placeholder="YouTube URL (optional)"
                    value={item.youtube_url || ''}
                    onChange={(e) => updateItem(index, 'youtube_url', e.target.value)}
                  />
                  <Input
                    placeholder="Read More URL (optional)"
                    value={item.read_more_url || ''}
                    onChange={(e) => updateItem(index, 'read_more_url', e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Status:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant={item.is_published ? 'visibility' : 'visibilityOff'}
                            onClick={() => updateItem(index, 'is_published', !item.is_published)}
                            className="h-7 w-7"
                          >
                            <Eye size={14} className={!item.is_published ? 'opacity-50' : ''} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {item.is_published ? 'Published' : 'Draft'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button type="button" size="sm" onClick={saveAll} disabled={isSaving} className="mt-2">
        {isSaving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
        Save News
      </Button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { signOut, user, isAdmin } = useAuth();
  const { resetContent } = useContent();
  const { toast } = useToast();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all content to defaults?')) {
      resetContent();
      toast({ title: "Reset Complete", description: "All content has been reset to defaults." });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-lg border border-border/60 shadow-sm">
          <CardContent className="pt-10 pb-8 px-10 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <X size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You don&apos;t have admin privileges. Please contact an administrator to request access.
            </p>
            <p className="text-xs text-muted-foreground mb-6">Logged in as: {user?.email}</p>
            <div className="flex gap-3 justify-center">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2 px-5">
                  <Home size={16} />
                  <span>Go Home</span>
                </Button>
              </Link>
              <Button onClick={signOut} size="sm" className="gap-2 px-5">
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
              <h1 className="font-semibold text-base leading-tight">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/staff">
              <Button variant="outline" size="sm" className="gap-2">
                <Users size={16} />
                <span>Staff Admin</span>
              </Button>
            </Link>
            <Link to="/admin/portal">
              <Button variant="outline" size="sm" className="gap-2">
                <Users size={16} />
                <span>Portal Admin</span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home size={16} />
                <span>View Site</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
              <RotateCcw size={16} />
              <span>Reset All</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={signOut}>
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="submissions">
          <div className="bg-background border border-border rounded-lg px-3 py-2 mb-6 flex flex-wrap gap-2">
            <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 h-auto w-full">
              <TabsTrigger value="submissions" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <ClipboardList size={14} /> <span>Submissions</span>
              </TabsTrigger>
              <TabsTrigger value="navbar" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <Navigation size={14} /> <span>Navbar</span>
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <PanelBottom size={14} /> <span>Footer</span>
              </TabsTrigger>
              <TabsTrigger value="home" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <Home size={14} /> <span>Home</span>
              </TabsTrigger>
              <TabsTrigger value="academics" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <BookOpen size={14} /> <span>Academics</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <Image size={14} /> <span>Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="campus" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <Users size={14} /> <span>Campus</span>
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <FileText size={14} /> <span>News</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <Info size={14} /> <span>About</span>
              </TabsTrigger>
              <TabsTrigger value="admission" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <FileText size={14} /> <span>Admission</span>
              </TabsTrigger>
              <TabsTrigger value="portal" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                <LogIn size={14} /> <span>Portal Settings</span>
              </TabsTrigger>
              {user?.email === 'admin@admin.com' && (
                <TabsTrigger value="adminAccess" className="flex items-center gap-1 text-xs px-3 py-1 rounded-md">
                  <Shield size={14} /> <span>Admin Access</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <Card className="shadow-sm border-border">
            <CardContent className="pt-6">
              <TabsContent value="submissions"><SubmissionsViewer /></TabsContent>
              <TabsContent value="navbar"><NavbarEditor /></TabsContent>
              <TabsContent value="footer"><FooterEditor /></TabsContent>
              <TabsContent value="home"><HomeEditor /></TabsContent>
              <TabsContent value="academics"><AcademicsEditor /></TabsContent>
              <TabsContent value="gallery"><GalleryEditor /></TabsContent>
              <TabsContent value="campus"><CampusLifeEditor /></TabsContent>
              <TabsContent value="news"><NewsEditor /></TabsContent>
              <TabsContent value="about"><AboutEditor /></TabsContent>
              <TabsContent value="admission"><AdmissionEditor /></TabsContent>
              <TabsContent value="portal"><PortalSettingsEditor /></TabsContent>
              <TabsContent value="adminAccess"><AdminAccessManager /></TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </main>
    </div>
  );
}

export default function Admin() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
}
