import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, BookOpen, Trophy, Music, Heart, Users, Calendar, ArrowRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const iconMap: Record<string, React.ReactNode> = {
  flask: <FlaskConical size={32} />,
  book: <BookOpen size={32} />,
  trophy: <Trophy size={32} />,
  music: <Music size={32} />,
  heart: <Heart size={32} />,
  users: <Users size={32} />,
};

export default function CampusLife() {
  const { content } = useContent();
  const campusLife = content.campusLife || {};

  const [facilities, setFacilities] = useState<any[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);

  const sections = (campusLife.sections || []) as any[];
  const saturdayActivities = (campusLife.saturdayActivities || []) as string[];

  useEffect(() => {
    const fetchFacilities = async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('id, name, description, icon, is_visible, display_order, url')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });
 
      if (!error && data) {
        setFacilities(data as any[]);
      } else {
        setFacilities([]);
      }
      setIsLoadingFacilities(false);
    };

    fetchFacilities();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{campusLife.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{campusLife.description}</p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Facilities</h2>
            <p className="section-subtitle">State-of-the-art facilities for comprehensive learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(!isLoadingFacilities && facilities.length > 0 ? facilities : sections).map((item: any, index: number) => (
              <Card key={item.id ?? index} className="card-hover">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    {iconMap[item.icon as string] || <BookOpen size={32} />}
                  </div>
                  <CardTitle className="text-xl">{item.name ?? item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{item.description}</p>
                  {item.id && (
                    <Link
                      to="/admin"
                      className="text-primary text-sm hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Learn More <ArrowRight size={14} />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Saturday Activities */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Saturday Special Activities</h2>
              <p className="section-subtitle">Beyond regular classes, we offer enriching weekend activities</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {saturdayActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar size={20} />
                      </div>
                      <p className="text-foreground font-medium">{activity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Life at Campus</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80"
                alt="Campus Life"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80"
                alt="Laboratory"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80"
                alt="Sports"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80"
                alt="Cultural"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
