import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedCounter from '@/components/AnimatedCounter';
import { OvalCard } from '@/components/OvalCard';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

// Human Values Logo SVG Component
const HumanValuesLogo = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full">
    {/* Center Om symbol circle */}
    <circle cx="200" cy="200" r="60" fill="#F8BBD9" />
    <text x="200" y="220" textAnchor="middle" fontSize="48" fill="#E91E63" fontWeight="bold">
      ॐ
    </text>

    {/* Petals - representing different values */}
    {/* Top - Pink */}
    <ellipse cx="200" cy="100" rx="50" ry="60" fill="#F48FB1" />
    {/* Top Right - Yellow */}
    <ellipse cx="290" cy="130" rx="50" ry="60" fill="#FFE082" transform="rotate(45 290 130)" />
    {/* Right - Green */}
    <ellipse cx="310" cy="200" rx="60" ry="50" fill="#A5D6A7" />
    {/* Bottom Right - Yellow */}
    <ellipse cx="290" cy="270" rx="50" ry="60" fill="#FFE082" transform="rotate(-45 290 270)" />
    {/* Bottom - Pink */}
    <ellipse cx="200" cy="300" rx="50" ry="60" fill="#F48FB1" />
    {/* Bottom Left - Yellow */}
    <ellipse cx="110" cy="270" rx="50" ry="60" fill="#FFE082" transform="rotate(45 110 270)" />
    {/* Left - Cyan */}
    <ellipse cx="90" cy="200" rx="60" ry="50" fill="#80DEEA" />
    {/* Top Left - Yellow */}
    <ellipse cx="110" cy="130" rx="50" ry="60" fill="#FFE082" transform="rotate(-45 110 130)" />

    {/* Religious symbols on petals */}
    <text x="200" y="110" textAnchor="middle" fontSize="24" fill="#1A237E">
      ✝
    </text>
    <text x="310" y="205" textAnchor="middle" fontSize="24" fill="#1A237E">
      ☪
    </text>
    <text x="200" y="310" textAnchor="middle" fontSize="24" fill="#1A237E">
      🙏
    </text>
    <text x="90" y="205" textAnchor="middle" fontSize="24" fill="#1A237E">
      ☸
    </text>

    {/* Outer figures - representing people */}
    <g fill="#FFA726">
      {/* Top left figure */}
      <circle cx="80" cy="80" r="12" />
      <path
        d="M80 95 L80 130 M65 110 L95 110 M80 130 L65 155 M80 130 L95 155"
        stroke="#FFA726"
        strokeWidth="4"
        fill="none"
      />

      {/* Top right figure */}
      <circle cx="320" cy="80" r="12" />
      <path
        d="M320 95 L320 130 M305 110 L335 110 M320 130 L305 155 M320 130 L335 155"
        stroke="#FFA726"
        strokeWidth="4"
        fill="none"
      />

      {/* Bottom left figure */}
      <circle cx="80" cy="320" r="12" />
      <path
        d="M80 335 L80 370 M65 350 L95 350 M80 370 L65 395 M80 370 L95 395"
        stroke="#FFA726"
        strokeWidth="4"
        fill="none"
        transform="rotate(180 80 355)"
      />

      {/* Bottom right figure */}
      <circle cx="320" cy="320" r="12" />
      <path
        d="M320 335 L320 370 M305 350 L335 350 M320 370 L305 395 M320 370 L335 395"
        stroke="#FFA726"
        strokeWidth="4"
        fill="none"
        transform="rotate(180 320 355)"
      />
    </g>
  </svg>
);

export default function Index() {
  const { content } = useContent();
  const { home } = content;
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Scroll animations for sections
  const aboutSection = useScrollAnimation(0.1);
  const statsSection = useScrollAnimation(0.1);
  const founderSection = useScrollAnimation(0.1);
  const updatesSection = useScrollAnimation(0.1);
  const programsSection = useScrollAnimation(0.1);
  const facilitiesSection = useScrollAnimation(0.1);
  const campusSection = useScrollAnimation(0.1);
  const marqueeSection = useScrollAnimation(0.1);

  // Sister institutes for carousel
  const sisterInstitutes = home.sisterInstitutes?.items || [
    {
      name: 'Alike',
      imageUrl:
        'https://github.com/Satyamurthi/mbw-Photos/blob/main/Sister%20Institutes/Alike.jpg?raw=true',
    },
    {
      name: 'Dharwad',
      imageUrl:
        'https://github.com/Satyamurthi/mbw-Photos/blob/main/Sister%20Institutes/Dharwad%202.jpg?raw=true',
    },
    {
      name: 'Mysuru',
      imageUrl:
        'https://github.com/Satyamurthi/mbw-Photos/blob/main/College%20Photos/College.jpg?raw=true',
    },
  ];
  // Campus life images (homepage) - use content when available, fall back to defaults
  const campusImages =
    (home.campusLifeGallery?.items || []).map((item: any) => ({
      src: item.imageUrl,
      alt: item.alt || item.label,
      label: item.label,
    }))?.filter((item: any) => item.src && item.label) || [
      {
        src: 'https://github.com/Satyamurthi/mbw-Photos/blob/main/image.png?raw=true',
        alt: 'College',
        label: 'College',
      },
      { src: '/placeholder.svg', alt: 'Student Housing', label: 'Student Housing' },
      { src: '/placeholder.svg', alt: 'Sports Facilities', label: 'Sports Facilities' },
      { src: '/placeholder.svg', alt: 'Student Center', label: 'Student Center' },
    ];

  // Updates/News items from backend
  const [updates, setUpdates] = useState<any[]>([]);
  // Facilities from backend
  const [facilities, setFacilities] = useState<any[]>([]);
  // Facilities slider index
  const [facilityIndex, setFacilityIndex] = useState(0);
  // Campus life slider index
  const [campusIndex, setCampusIndex] = useState(0);
 
  useEffect(() => {
     const fetchUpdates = async () => {
       const { data, error } = await supabase
         .from('updates')
         .select('*')
         .eq('is_published', true)
         .order('date', { ascending: false })
         .limit(8);
 
       if (!error && data) {
         setUpdates(data);
       }
     };
 
     fetchUpdates();
   }, []);
  
   useEffect(() => {
     const fetchFacilities = async () => {
       const { data, error } = await supabase
         .from('facilities')
         .select('*')
         .eq('is_visible', true)
         .order('display_order', { ascending: true });
  
       if (!error && data) {
         const defaultImages = [
           'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4033.jpg?raw=true',
           'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4038.jpg?raw=true',
           'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4015.jpg?raw=true',
           'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4006.jpg?raw=true',
           'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4054.jpg?raw=true',
           'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4054.jpg?raw=true',
         ];
  
         setFacilities(
           (data as any[]).map((f, index) => ({
             ...f,
             imageUrl: defaultImages[index % defaultImages.length],
           }))
         );
       }
     };
  
     fetchFacilities();
   }, []);
 
   // Auto-slide facilities
   useEffect(() => {
     const allFacilities =
       (home.facilities?.items?.length ? home.facilities.items : facilities.length ? facilities : []) || [];
 
     if (allFacilities.length <= 1) return;
 
     const interval = setInterval(() => {
       setFacilityIndex((prev) => (prev + 1) % allFacilities.length);
     }, 4000);
 
     return () => clearInterval(interval);
   }, [home.facilities?.items, facilities]);
 
   // Auto-slide campus life images
   useEffect(() => {
     if (campusImages.length <= 1) return;
 
     const interval = setInterval(() => {
       setCampusIndex((prev) => (prev + 1) % campusImages.length);
     }, 4000);
 
     return () => clearInterval(interval);
   }, [campusImages.length]);
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        const heroHeight = heroRef.current.offsetHeight;
        // Only apply parallax while hero is in view
        if (scrolled < heroHeight) {
          setParallaxOffset(scrolled * 0.5); // 0.5 = parallax speed
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout>
      {/* Hero Section with Background Image */}
      <section ref={heroRef} className="relative h-[600px] flex items-center overflow-hidden">
        {/* Background Video/Image Container */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          {home.videoSection?.enabled ? (
            <iframe
              className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 scale-100 pointer-events-none"
              src={`https://www.youtube.com/embed/${home.videoSection.youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${home.videoSection.youtubeVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1&fs=0&playsinline=1`}
              title="School Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920')",
              }}
            />
          )}
        </div>
        
        {/* Subtle pattern overlay for texture */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Blue transparent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/30 to-transparent mix-blend-multiply" />

        {/* Quote Text */}
        <div className="hidden">
          <div className="text-right max-w-lg">
            <h2
              className="text-2xl md:text-4xl lg:text-5xl font-serif italic text-white leading-tight tracking-wide"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {home.heroSection?.quote || 'EDUCATION SHOULD BE FOR LIFE. NOT FOR A LIVING.'}
            </h2>
            {home.heroSection?.subtext && (
              <p className="mt-4 text-base md:text-lg text-white/90">{home.heroSection.subtext}</p>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        ref={aboutSection.elementRef as React.RefObject<HTMLElement>}
        className={`py-16 md:py-24 bg-background transition-all duration-1000 ${
          aboutSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Human Values Logo */}
            <div className="flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80">
                <img
                  src="https://github.com/Satyamurthi/mbw-Photos/blob/main/Logo/sai%20school%20logo%20png.png?raw=true"
                  alt="Human Values Logo"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* About Text */}
            <div>
              <p className="text-orange-500 font-semibold mb-2 uppercase tracking-wide text-sm border-b-2 border-orange-500 inline-block pb-1">
                {home.aboutSection?.title || 'ABOUT US'}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                {home.aboutSection?.heading || (
                  <>
                    Welcome to <span className="text-orange-500">Sri Sathya Sai School &amp; PU College Mysuru</span>
                  </>
                )}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                {home.aboutSection?.description ||
                  "Our school is dedicated to fostering Education in Human Values. Today's education system often prioritizes intellectual and skill development while neglecting the cultivation of good character. We believe that true education extends beyond academics to encompass moral and spiritual growth. Our mission is to nurture students who not only excel academically but also possess compassion, humility, and a sense of service towards society. We strive to instill in our students a deep reverence for righteousness, a steadfast faith in God, and a profound love for their mothers, motherland, mother tongue, and religion. Our goal is to produce individuals who lead meaningful lives guided by principles of truth, righteousness, and service to humanity."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder & Blessings Section - Parallax Background */}
      <section 
        ref={founderSection.elementRef as React.RefObject<HTMLElement>}
        className="relative py-16 md:py-20"
        style={{
          backgroundImage: "url('https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Bhajan%20hall.png?raw=true')",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid gap-10 md:gap-16 md:grid-cols-2 items-center">
            {/* Founder column */}
            <article className="flex items-start md:items-center gap-4 md:gap-6 text-left text-white md:pl-6">
              <div className="egg-mask shrink-0 w-28 h-44 sm:w-32 sm:h-56 overflow-hidden bg-muted/40 border border-white/30">
                <img
                  src={
                    home.founderSection?.founder?.imageUrl ||
                    "https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Sunandamma.png?raw=true"
                  }
                  alt={home.founderSection?.founder?.name || 'Late Smt Sunandamma'}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="max-w-md">
                <span className="block text-[10px] sm:text-xs tracking-[0.35em] uppercase text-white/60 mb-1">
                  founder president
                </span>
                <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-2">
                  {home.founderSection?.founder?.name || 'Late Smt Sunandamma'}
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-white/80 leading-relaxed">
                  {home.founderSection?.founder?.description ||
                    'Deeply influenced by the Bhagvn Sri Satya Sai Baba, Smt Sunandamma, with the help of some dedicated workers, set up yhis educational institution at Mysuru on 1957…...'}{' '}
                  <Link
                    to={home.founderSection?.founder?.readMorePath || '/about'}
                    className="read-more font-medium underline underline-offset-2"
                  >
                    Read more
                  </Link>
                </p>
              </div>
            </article>
 
            {/* Blessings column */}
            <article className="flex items-center gap-6 text-left text-white md:pr-8">
              <div className="egg-mask shrink-0 w-28 h-44 sm:w-32 sm:h-56 overflow-hidden bg-muted/40 border border-white/30">
                <img
                  src={
                    home.founderSection?.blessings?.imageUrl ||
                    "https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Baba%20Cahir.jpg?raw=true"
                  }
                  alt={home.founderSection?.blessings?.name || 'Bhagawan Sri Sathya Sai Baba'}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="max-w-md">
                <span className="block text-[10px] sm:text-xs tracking-[0.35em] uppercase text-white/60 mb-2">
                  blessings
                </span>
                <h4 className="text-lg sm:text-xl font-semibold mb-2">
                  {home.founderSection?.blessings?.name || 'Bhagawan Sri Sathya Sai Baba'}
                </h4>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  {home.founderSection?.blessings?.description ||
                    'Bhagawan Sri Sathya Sai Baba was incarnated in a remote village called Puttaparthi in Anantpur district in Andhra Pradesh in the year 23-11-1926. His parents…...'}{' '}
                  <Link
                    to={home.founderSection?.blessings?.readMorePath || '/about'}
                    className="read-more font-medium underline underline-offset-2"
                  >
                    Read more
                  </Link>
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <section 
        ref={updatesSection.elementRef as React.RefObject<HTMLElement>}
        className={`py-16 bg-background transition-all duration-1000 ${
          updatesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {home.updatesSection?.title || 'Updates'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {home.updatesSection?.description ||
                'Stay updated with the latest happenings, breakthroughs, and events at SSSBPUC.'}
            </p>
          </div>

          {/** Prefer admin-configured homepage announcements; fall back to backend updates table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {(home.announcements && home.announcements.length > 0
              ? home.announcements
              : updates
            ).map((item: any, index: number) => {
              const title = item.title;
              const date = item.date;
              const description = item.description;
              const readMoreUrl = item.readMoreUrl || item.read_more_url;
              const youtubeUrl = item.youtubeUrl || item.youtube_url;

              let videoId: string | null = null;
              if (youtubeUrl) {
                try {
                  const url = new URL(youtubeUrl);
                  videoId =
                    url.searchParams.get('v') ||
                    url.pathname
                      .split('/')
                      .filter(Boolean)
                      .pop() || null;
                } catch {
                  videoId = null;
                }
              }

              const thumbnailUrl = videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : null;

              return (
                <Card
                  key={index}
                  className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group bg-card"
                >
                  {/* Video thumbnail wired to YouTube when available */}
                  {youtubeUrl && thumbnailUrl ? (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-video bg-muted relative overflow-hidden"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={title || 'Announcement video thumbnail'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <div
                            className="w-0 h-0 border-t-6 border-b-6 border-l-10 border-transparent border-l-primary-foreground ml-1"
                            style={{
                              borderTopWidth: '8px',
                              borderBottomWidth: '8px',
                              borderLeftWidth: '12px',
                            }}
                          />
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <div
                            className="w-0 h-0 border-t-6 border-b-6 border-l-10 border-transparent border-l-primary-foreground ml-1"
                            style={{
                              borderTopWidth: '8px',
                              borderBottomWidth: '8px',
                              borderLeftWidth: '12px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-4">
                    {date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{date}</span>
                      </div>
                    )}
                    <h3 className="font-bold text-foreground mb-2 text-sm leading-tight">{title}</h3>
                    {description && (
                      <p className="text-muted-foreground text-xs line-clamp-2">{description}</p>
                    )}
                    {readMoreUrl && (
                      <Link
                        to={readMoreUrl}
                        className="text-primary text-xs mt-3 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Read More <ArrowRight size={12} />
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/news"
              className="inline-flex items-center justify-center px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
            >
              View All News
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section - By the Numbers */}
      <section 
        ref={statsSection.elementRef as React.RefObject<HTMLElement>}
        className={`py-16 bg-blue-950/90 backdrop-blur-md text-white transition-all duration-1000 ${
          statsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">By the Numbers</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Our impact in numbers reflects our commitment to excellence in education and research.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '500+', label: 'Students Enrolled' },
              { value: '35+', label: 'Faculty Members' },
              { value: '6', label: 'Academic Programs' },
              { value: '98%', label: 'Passing Rate' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-white/80 text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section 
        ref={facilitiesSection.elementRef as React.RefObject<HTMLElement>}
        className={`py-16 bg-background transition-all duration-1000 ${
          facilitiesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
           <div className="text-center mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
               {home.facilities?.title || 'Our Facilities'}
             </h2>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
               {home.facilities?.description || 'State-of-the-art facilities for comprehensive, value-based learning.'}
             </p>
           </div>
           <div className="max-w-6xl mx-auto">
             {(() => {
               const allFacilities =
                 (home.facilities?.items?.length
                   ? home.facilities.items
                   : facilities.length
                     ? facilities
                     : [
                         {
                           name: 'Physics Lab',
                           description:
                             'Equipped with advanced apparatus for hands-on experiments. Students explore concepts through practical demonstrations.',
                           imageUrl:
                             'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4033.jpg?raw=true',
                           url: '/about',
                         },
                         {
                           name: 'Chemistry Lab',
                           description:
                             'Designed for safe and effective chemical experiments. Students learn concepts with practical applications.',
                           imageUrl:
                             'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4038.jpg?raw=true',
                           url: '/about',
                         },
                         {
                           name: 'Biology Lab',
                           description:
                             'Offers modern tools for studying life sciences. Students perform dissections and observe microscopic life.',
                           imageUrl:
                             'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4015.jpg?raw=true',
                           url: '/about',
                         },
                         {
                           name: 'Computer Science Lab',
                           description:
                             'Offers modern tools and computers for learning programming and technology skills.',
                           imageUrl:
                             'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4006.jpg?raw=true',
                           url: '/about',
                         },
                         {
                           name: 'Library',
                           description:
                             'A rich collection of books and resources supporting academic excellence and value-based learning.',
                           imageUrl:
                             'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4054.jpg?raw=true',
                           url: '/about',
                         },
                         {
                           name: 'Class Rooms',
                           description:
                             'Well-ventilated, spacious classrooms designed to support focused and joyful learning.',
                           imageUrl:
                             'https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4054.jpg?raw=true',
                           url: '/about',
                         },
                       ]) || [];
 
               if (!allFacilities.length) return null;
 
               const current = allFacilities[facilityIndex % allFacilities.length];
 
               return (
                 <div className="flex flex-col items-center gap-6">
                   <Card className="w-full h-full flex flex-col overflow-hidden rounded-[24px] border border-border/30 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
                     <div className="aspect-[16/9] overflow-hidden">
                       <img
                         key={facilityIndex}
                         src={current.imageUrl}
                         alt={current.name}
                         className="w-full h-full object-cover transition-opacity duration-700 ease-out"
                         loading="lazy"
                         decoding="async"
                       />
                     </div>
                     <CardContent className="flex flex-col flex-1 px-6 pt-5 pb-6">
                       <div className="mb-3">
                         <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-medium tracking-wide">
                           {current.label || current.name}
                         </span>
                       </div>
                       <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
                         <span className="font-semibold">{current.name}</span>
                       </h3>
                       <p className="text-slate-600 text-sm mb-4 leading-relaxed">{current.description}</p>
                       <div className="mt-auto">
                         <Link
                           to={current.url || home.facilities?.readMorePath || '/about'}
                           className="block w-full bg-[#1e3a5f] hover:bg-[#192f4a] text-white text-center py-2.5 rounded-md font-medium text-sm transition-colors duration-200"
                         >
                           Learn More
                         </Link>
                       </div>
                     </CardContent>
                   </Card>
 
                   {/* Slider dots */}
                   <div className="flex gap-2 justify-center mt-2">
                     {allFacilities.map((_, idx) => (
                       <button
                         key={idx}
                         type="button"
                         aria-label={`Go to facility ${idx + 1}`}
                         className={`h-1.5 rounded-full transition-all duration-300 ${
                           idx === facilityIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/40'
                         }`}
                         onClick={() => setFacilityIndex(idx)}
                       />
                     ))}
                   </div>
                 </div>
               );
             })()}
           </div>
        </div>
      </section>

      {/* Campus Life Section */}
      <section 
        ref={campusSection.elementRef as React.RefObject<HTMLElement>}
        className={`py-16 bg-muted/30 transition-all duration-1000 ${
          campusSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {home.campusLifeGallery?.title || 'Campus Life'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {home.campusLifeGallery?.description || 'Experience the vibrant and diverse community at SSSBPUC.'}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {campusImages.length > 0 && (
              <Card className="overflow-hidden rounded-[24px] border border-border/30 bg-white/0 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    key={campusIndex}
                    src={campusImages[campusIndex].src}
                    alt={campusImages[campusIndex].alt}
                    className="w-full h-full object-cover transition-opacity duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end">
                    <div className="w-full px-6 py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <span className="text-white text-sm md:text-base font-medium tracking-wide">
                        {campusImages[campusIndex].label}
                      </span>
                      <div className="mt-3 flex gap-2">
                        {campusImages.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === campusIndex ? 'w-6 bg-primary' : 'w-2 bg-white/50'
                            }`}
                            onClick={() => setCampusIndex(idx)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Sister Institutes Marquee Section */}
      <section 
        ref={marqueeSection.elementRef as React.RefObject<HTMLElement>}
        className={`py-16 bg-background overflow-hidden transition-all duration-1000 ${
          marqueeSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Sister Institutes</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover endless opportunities and shared excellence at our esteemed sister institutions.
            </p>
          </div>
          
          {/* Continuous Scrolling Marquee */}
          <div className="relative">
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-container {
                  display: flex;
                  animation: marquee 20s linear infinite;
                }
                .marquee-container:hover {
                  animation-play-state: paused;
                }
              `
            }} />
            
            <div className="overflow-hidden relative">
              <div className="marquee-container">
                {/* Duplicate content twice for seamless loop */}
                {[...sisterInstitutes, ...sisterInstitutes].map((institute, index) => (
                  <div key={index} className="flex-shrink-0 px-4" style={{ width: '350px' }}>
                    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={institute.imageUrl}
                          alt={institute.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-bold text-foreground">{institute.name}</h3>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
              
              {/* Left edge gradient fade */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
              
              {/* Right edge gradient fade */}
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
