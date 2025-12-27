import { useEffect, useState } from 'react';
import { Mail, Phone, GraduationCap } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface StaffMember {
  id: string;
  name: string;
  designation: string;
  department: string | null;
  qualification: string | null;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  staff_type: string;
}

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      const mapped = (data as any[]).map((row) => ({
        id: row.id,
        name: row.full_name || row.name,
        designation: row.designation,
        department: row.department,
        qualification: row.qualifications || row.qualification,
        email: row.email,
        phone: row.phone,
        image_url: row.photo_url || row.image_url,
        staff_type: row.staff_type || 'lecturer',
      }));
      setStaff(mapped);
    }
    setLoading(false);
  };

  const administrators = staff.filter(s => s.staff_type === 'administrator');
  const lecturers = staff.filter(s => s.staff_type === 'lecturer');
  const nonTeaching = staff.filter(s => s.staff_type === 'non-teaching');

  const StaffTable = ({ members, emptyMessage, title }: { members: StaffMember[]; emptyMessage: string; title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <GraduationCap className="text-primary" size={24} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {members.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <GraduationCap className="text-primary" size={20} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-primary">{member.designation}</TableCell>
                    <TableCell>{member.department || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.qualification || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {member.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail size={14} />
                            <span className="text-xs">{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone size={14} />
                            <span className="text-xs">{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Staff Directory</h1>
          <p className="text-muted-foreground">
            Meet our dedicated team of educators and administrators committed to excellence
          </p>
        </div>
      </section>

      {/* Staff Sections */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">Loading staff directory...</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <StaffTable 
                members={administrators} 
                emptyMessage="No administrators to display" 
                title="Administrative Staff"
              />
              
              <StaffTable 
                members={lecturers} 
                emptyMessage="No teaching staff to display" 
                title="Teaching Staff"
              />
              
              <StaffTable 
                members={nonTeaching} 
                emptyMessage="No support staff to display" 
                title="Support Staff"
              />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}