import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Calendar, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useContent } from '@/contexts/ContentContext';

type AcademicProgram = {
  id: string;
  name: string;
  description: string | null;
};

interface AcademicCalendarEvent {
  event: string;
  date: string;
}

export default function Academics() {
  const { content } = useContent();
  const [intro, setIntro] = useState<{ title?: string | null; description?: string | null }>({});
  const [streams, setStreams] = useState<AcademicProgram[]>([]);
  const [calendar, setCalendar] = useState<{ title: string; events: AcademicCalendarEvent[] }>(
    { title: 'Academic Calendar', events: [] },
  );
  const [loading, setLoading] = useState(true);
  
  const academicsSettings = content.academicsSettings || { showLoginButton: true };

  useEffect(() => {
    const loadAcademics = async () => {
      const [contentResult, programsResult] = await Promise.all([
        supabase.from('academics_content').select('*').limit(1).maybeSingle(),
        supabase
          .from('academic_programs')
          .select('id, name, description, is_visible, display_order')
          .eq('is_visible', true)
          .order('display_order', { ascending: true }),
      ]);

      const contentRow: any = contentResult.data || null;
      if (contentRow) {
        setIntro({ title: contentRow.hero_title, description: contentRow.hero_description });

        const events = Array.isArray(contentRow.calendar_events)
          ? (contentRow.calendar_events as AcademicCalendarEvent[])
          : [];
        setCalendar({
          title: contentRow.calendar_title || 'Academic Calendar',
          events,
        });
      }

      const programRows = (programsResult.data || []) as any[];
      setStreams(
        programRows.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
        })),
      );

      setLoading(false);
    };

    loadAcademics();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{intro.title ?? 'Academics'}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">{intro.description ?? ''}</p>
          {academicsSettings.showLoginButton && (
            <Link to="/portal-login">
              <Button size="sm" variant="outline" className="gap-2">
                <LogIn size={16} />
                Staff & Student Login
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Streams */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Academic Streams</h2>
            <p className="section-subtitle">Choose the path that aligns with your aspirations</p>
          </div>

          <div className="space-y-8">
            {streams.map((stream: any, index: number) => (
              <Card key={index} className="overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="text-primary" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{stream?.name}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">{stream?.description}</p>

                    <h4 className="font-semibold text-foreground mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {(stream?.features ?? []).map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="text-primary flex-shrink-0" size={18} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-muted p-6 md:p-8">
                    <h4 className="font-semibold text-foreground mb-4">Subjects Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {(stream?.subjects ?? []).map((subject: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-card rounded-full text-sm text-foreground border border-border"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Calendar */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">{calendar.title ?? 'Academic Calendar'}</h2>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead className="text-right">Month</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(calendar.events ?? []).map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-primary" size={18} />
                            {item?.event}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{item?.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join our community of learners and excel in your chosen field with our comprehensive academic programs.
          </p>
          <a href="/admission" className="inline-block bg-primary-foreground text-primary px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
            Apply Now
          </a>
        </div>
      </section>
    </Layout>
  );
}
