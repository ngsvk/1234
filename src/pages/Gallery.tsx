import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Layout from '@/components/Layout';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useContent } from '@/contexts/ContentContext';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  category: string | null;
}

export default function Gallery() {
  const { content } = useContent() as any;
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string } | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        const rows = data as any[];
        setImages(rows as GalleryImage[]);
      }
    };

    fetchImages();
  }, []);

  const contentGallery = (content?.gallery || {}) as any;
  const contentImages: GalleryImage[] = (contentGallery.images || []).map(
    (img: any, index: number) => ({
      id: `content-${index}`,
      image_url: img.url,
      title: img.caption || null,
      description: null,
      category: img.category || null,
    }),
  );

  const allImages = images.length > 0 ? images : contentImages;

  const categories = ['All',
    ...Array.from(
      new Set(
        allImages
          .map((row) => row.category)
          .filter((c): c is string => !!c && c.trim().length > 0),
      ),
    ),
  ];

  const filteredImages = selectedCategory === 'All'
    ? allImages
    : allImages.filter((img) => img.category === selectedCategory);

  return (
    <Layout>
      {/* Header + Filter */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Photo Gallery
            </h1>
            <p className="text-lg text-muted-foreground">
              Glimpses of life at Sri Sathya Sai Baba PU College
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 shadow-sm ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <article
                key={image.id}
                onClick={() =>
                  setSelectedImage({
                    url: image.image_url,
                    caption: image.title || image.description || '',
                  })
                }
                className="group cursor-pointer overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.title || image.description || ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="px-4 pt-4 pb-5 text-left">
                  <h2 className="text-base font-semibold text-foreground truncate">
                    {image.title || 'Untitled'}
                  </h2>
                  {(image.category || image.description) && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {image.category || image.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-foreground">
          {selectedImage && (
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-foreground/50 text-primary-foreground hover:bg-foreground/70 transition-colors"
              >
                <X size={24} />
              </button>
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="p-4 bg-foreground text-primary-foreground">
                <p className="font-medium">{selectedImage.caption}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
