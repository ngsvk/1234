import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Default content for all pages
const defaultContent = {
  navbar: {
    collegeName: "Sri Sathya Sai Baba Pre-University College",
    subtitle: "Jayalakshmipuram, Mysuru",
    leftLogoUrl: "https://6935482ff89ee454602ca7c5.imgix.net/sai%20school%20logo%20png%20(1).png",
    rightLogoUrl: "https://6935482ff89ee454602ca7c5.imgix.net/sai%20baba%20photo%20png.png",
    leftLogoHref: "/",
    rightLogoHref: "/",
    admissionButtonText: "For Admission",
    admissionButtonEnabled: true,
    links: [
      { name: "Home", path: "/", enabled: true },
      { name: "Academics", path: "/academics", enabled: true },
      { name: "Staff", path: "/staff", enabled: true },
      { name: "Gallery", path: "/gallery", enabled: true },
      { name: "Campus Life", path: "/campus-life", enabled: true },
      { name: "About", path: "/about", enabled: true }
    ]
  },
  footer: {
    collegeName: "Sri Sathya Sai Baba PU College",
    tagline: "Shaping tomorrow's leaders through excellence in education, research, and innovation.",
    logoUrl: "https://6935482ff89ee454602ca7c5.imgix.net/sai%20school%20logo%20png%20(1).png",
    contact: {
      address: "Sri Sathya Sai Baba PU College, 46, 4th Main Rd, 3rd Block, Jayalakshmipuram, Mysuru, Karnataka 570012",
      phone: "0821 2410856",
      email: "sssbpucnn0385@gmail.com"
    },
    hours: {
      weekdays: "Monday - Friday: 8:30 AM - 5:00 PM",
      saturday: "Saturday: 8:30 AM - 4:00 PM",
      sunday: "Sunday: Closed"
    },
    copyright: "Sri Sathya Sai Baba Pre-University College, Mysuru. All rights reserved."
  },
  home: {
    heroSection: {
      quote: '"EDUCATION SHOULD BE FOR LIFE. NOT FOR A LIVING."',
      subtext: 'Inspired learning in an environment rooted in human values.',
    },
    videoSection: {
      enabled: true,
      youtubePlaylistId: "TLGGr3BxDMTBmpEwNjEyMjAyNQ",
      youtubeVideoId: "zKz4QQKx_jo"
    },
    aboutSection: {
      title: "ABOUT US",
      heading: "Welcome to Sri Sathya Sai School & PU College Mysuru",
      description: "Our school is dedicated to fostering Education in Human Values. Today's education system often prioritizes intellectual and skill development while neglecting the cultivation of good character. We believe that true education extends beyond academics to encompass moral and spiritual growth. Our mission is to nurture students who not only excel academically but also possess compassion, humility, and a sense of service towards society."
    },
    founderSection: {
      founder: {
        name: "Late Smt Sunandamma",
        title: "Founder President",
        description: "Deeply influenced by Bhagawan Sri Sathya Sai Baba, Smt Sunandamma, with the help of some dedicated workers, set up this educational institution at Mysuru in 1957.",
        imageUrl: "https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Sunandamma.png?raw=true",
        readMorePath: "/about",
      },
      blessings: {
        name: "Bhagawan Sri Sathya Sai Baba",
        title: "Blessings",
        description: "Bhagawan Sri Sathya Sai Baba was incarnated in a remote village called Puttaparthi in Anantpur district in Andhra Pradesh in the year 23-11-1926.",
        imageUrl: "https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Baba%20Cahir.jpg?raw=true",
        readMorePath: "/about",
      }
    },
    updatesSection: {
      title: "Updates",
      description: "Stay updated with the latest happenings, breakthroughs, and events at SSSBPUC.",
    },
    statistics: {
      title: "By the Numbers",
      description: "Our impact in numbers reflects our commitment to excellence in education.",
      items: [
        { label: "Students Enrolled", value: "500+" },
        { label: "Faculty Members", value: "35+" },
        { label: "Academic Programs", value: "6" },
        { label: "Passing Rate", value: "98%" }
      ]
    },
    facilities: {
      title: "Our Facilities",
      description: "Discover our state-of-the-art facilities designed to enhance learning.",
      readMorePath: "/about",
      items: [
        { label: "Physics Lab", name: "Physics Lab", description: "Equipped with advanced apparatus for hands-on experiments.", icon: "⚛️", imageUrl: "https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4033.jpg?raw=true" },
        { label: "Chemistry Lab", name: "Chemistry Lab", description: "Designed for safe and effective chemical experiments.", icon: "🧪", imageUrl: "https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4038.jpg?raw=true" },
        { label: "Biology Lab", name: "Biology Lab", description: "Modern tools for studying life sciences.", icon: "🌱", imageUrl: "https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4015.jpg?raw=true" },
        { label: "Computer Lab", name: "Computer Lab", description: "State-of-the-art computers for practical learning.", icon: "💻", imageUrl: "https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4006.jpg?raw=true" },
        { label: "Library", name: "Library", description: "Extensive collection of books and digital resources.", icon: "📚", imageUrl: "https://github.com/Satyamurthi/mwb.github.io/blob/main/Photos/DSC_4054.jpg?raw=true" },
        { label: "Classrooms", name: "Classrooms", description: "Well-ventilated and spacious learning spaces.", icon: "👨‍🏫", imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400" }
      ]
    },
    campusLifeGallery: {
      title: "Campus Life",
      description: "Experience the vibrant and diverse community at SSSBPUC.",
      items: [
        {
          label: "College",
          imageUrl: "https://github.com/Satyamurthi/mbw-Photos/blob/main/image.png?raw=true",
          alt: "College campus view",
        },
        {
          label: "Student Housing",
          imageUrl: "/placeholder.svg",
          alt: "Student housing facilities",
        },
        {
          label: "Sports Facilities",
          imageUrl: "/placeholder.svg",
          alt: "Sports facilities at campus",
        },
        {
          label: "Student Center",
          imageUrl: "/placeholder.svg",
          alt: "Student center and common areas",
        },
      ],
    },
    sisterInstitutes: {
      title: "Sister Institutes",
      description: "Discover endless opportunities at our esteemed sister institutions.",
      items: [
        { name: "Alike", imageUrl: "https://github.com/Satyamurthi/mbw-Photos/blob/main/Sister%20Institutes/Alike.jpg?raw=true" },
        { name: "Dharwad", imageUrl: "https://github.com/Satyamurthi/mbw-Photos/blob/main/Sister%20Institutes/Dharwad%202.jpg?raw=true" },
        { name: "Mysuru", imageUrl: "https://github.com/Satyamurthi/mbw-Photos/blob/main/College%20Photos/College.jpg?raw=true" }
      ]
    }
  },
  academics: {
    intro: {
      title: "Academic Excellence",
      description:
        "Our academic programs are designed to provide students with a strong foundation for higher education and professional success. We combine rigorous academics with practical learning experiences.",
    },
    streams: [
      {
        name: "Science Stream",
        description:
          "Preparing future scientists, engineers, and medical professionals with a strong foundation in sciences.",
        subjects: [
          "Physics",
          "Chemistry",
          "Mathematics",
          "Biology",
          "Computer Science",
          "English",
          "Kannada/Hindi",
        ],
        features: [
          "Well-equipped laboratories",
          "Experienced faculty",
          "Regular practical sessions",
          "Excellent board results",
        ],
      },
      {
        name: "Commerce Stream",
        description:
          "Building future business leaders and financial experts with comprehensive commerce education.",
        subjects: [
          "Accountancy",
          "Business Studies",
          "Economics",
          "Mathematics/Statistics",
          "English",
          "Kannada/Hindi",
        ],
        features: [
          "Industry exposure",
          "Business case studies",
          "Financial literacy programs",
          "Career guidance",
        ],
      },
      {
        name: "Arts/Humanities",
        description:
          "Fostering critical thinking and cultural awareness for future leaders and scholars.",
        subjects: [
          "History",
          "Political Science",
          "Sociology",
          "Economics",
          "English",
          "Kannada/Hindi",
        ],
        features: [
          "Research projects",
          "Field visits",
          "Guest lectures",
          "Debate competitions",
        ],
      },
    ],
    calendar: {
      title: "Academic Calendar Highlights",
      events: [
        { event: "First Term Begins", date: "June" },
        { event: "Mid-term Examinations", date: "September" },
        { event: "Second Term Begins", date: "November" },
        { event: "Annual Examinations", date: "March" },
      ],
    },
  },
  gallery: {},
  campusLife: {
    title: "Campus Life",
    description: "Experience a vibrant campus environment that nurtures growth beyond academics",
    sections: [
      {
        title: "Laboratories",
        icon: "flask",
        description:
          "State-of-the-art laboratories for Physics, Chemistry, Biology, and Computer Science provide hands-on learning experiences.",
      },
      {
        title: "Library",
        icon: "book",
        description:
          "A well-stocked library with thousands of books, journals, and digital resources to support learning and research.",
      },
      {
        title: "Sports & Games",
        icon: "trophy",
        description:
          "Comprehensive sports facilities including basketball court, volleyball, badminton, and indoor games for physical fitness.",
      },
      {
        title: "Cultural Activities",
        icon: "music",
        description:
          "Regular cultural programs, music, dance, and art activities to nurture creative talents.",
      },
      {
        title: "Value Education",
        icon: "heart",
        description:
          "Daily value education classes and spiritual activities rooted in the teachings of Sri Sathya Sai Baba.",
      },
      {
        title: "NSS & Community Service",
        icon: "users",
        description:
          "Active NSS unit engaging students in community service and social welfare activities.",
      },
    ],
    saturdayActivities: [
      "Bhajan sessions and spiritual discourse",
      "Sports tournaments and competitions",
      "Cultural practice and performances",
      "Community service activities",
      "Career counseling sessions",
    ],
  },
  about: {
    title: "About Our Institution",
    history: "Our institution has been serving students with dedication and excellence...",
    vision: "To be a leading institution in providing quality education...",
    mission: ["Provide excellence in education", "Foster moral and ethical values", "Develop well-rounded individuals"],
    principalMessage: "Welcome to our institution where we strive for excellence...",
    contact: {
      address: "Sri Sathya Sai Baba PU College, Jayalakshmipuram, Mysuru",
      phone: "0821 2410856",
      email: "sssbpucnn0385@gmail.com",
      mapUrl: ""
    }
  },
  admission: {
    title: "Admissions Open",
    description: "Join our institution and embark on a journey of academic excellence and personal growth.",
    eligibility: [
      "Completed SSLC/10th Standard",
      "Minimum 50% marks in SSLC",
      "Age between 15-17 years as of June 1st",
      "Transfer Certificate from previous school"
    ],
    documents: [
      "SSLC Marks Card (Original & Photocopy)",
      "Transfer Certificate",
      "Character Certificate",
      "Caste Certificate (if applicable)",
      "Income Certificate (if applicable)",
      "Passport size photographs (4 copies)",
      "Aadhar Card (Photocopy)"
    ],
    instructions: "Please fill in all required fields accurately. Documents will need to be submitted for verification.",
    streams: ["Science (PCMB)", "Science (PCMC)", "Commerce", "Arts"]
  },
  staff: {},
  news: {
    title: "College News & Updates",
    description:
      "Browse all published announcements, events, and important updates from Sri Sathya Sai Baba PU College.",
  },
  portal: {
    staffLoginEnabled: true,
    studentLoginEnabled: true,
  },
  academicsSettings: {
    showLoginButton: true,
  },
};

type ContentType = typeof defaultContent;

interface ContentContextType {
  content: any;
  updateContent: (section: keyof ContentType, data: any) => void;
  resetContent: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const STORAGE_KEY = 'sssbpuc_content';

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<any>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...defaultContent,
          ...parsed,
          navbar: { ...defaultContent.navbar, ...parsed.navbar },
          footer: { ...defaultContent.footer, ...parsed.footer },
          home: { ...defaultContent.home, ...parsed.home }
        };
      } catch {
        return defaultContent;
      }
    }
    return defaultContent;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    const loadContentFromBackend = async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, data');

      if (error || !data) return;

      setContent((prev: any) => {
        let merged: any = { ...prev };
        const rows = (data as any[]) || [];

        for (const rawRow of rows) {
          const row: any = rawRow || {};
          if (!row.key) continue;
          const sectionKey = row.key as keyof ContentType;
          const sectionData =
            row.data && typeof row.data === 'object' ? (row.data as Record<string, any>) : {};

          merged = {
            ...merged,
            [sectionKey]: {
              ...(merged as any)[sectionKey],
              ...sectionData,
            },
          };
        }

        return merged;
      });
    };

    loadContentFromBackend();
  }, []);

  const updateContent = (section: keyof ContentType, data: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: { ...(prev as any)[section], ...data },
    }));

    // Persist section content and create a revision in the background
    (async () => {
      try {
        await supabase.from('site_content').upsert({
          key: section as string,
          data,
        });

        await supabase.from('site_content_revisions').insert({
          key: section as string,
          data,
        });
      } catch (e) {
        console.error('Failed to persist site_content or revisions', e);
      }
    })();
  };

  const resetContent = () => {
    setContent(defaultContent);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

export { defaultContent };
