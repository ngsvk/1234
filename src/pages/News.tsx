import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useContent } from '@/contexts/ContentContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface UpdateItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  read_more_url: string | null;
  youtube_url: string | null;
}

export default function News() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const { content } = useContent() as any;
  const newsContent = content.news || {};

  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [query, setQuery] = useState('');
  const pageSize = 8;

  useEffect(() => {
    const fetchAllUpdates = async () => {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false });

      if (!error && data) {
        setUpdates(data as unknown as UpdateItem[]);
      }
    };

    fetchAllUpdates();
  }, []);

  // Reset to first page whenever filters or data length change
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, query, updates.length]);

  const filteredUpdates = useMemo(() => {
    return updates.filter((item) => {
      const itemDate = new Date(item.date);
      if (fromDate && itemDate < new Date(fromDate)) return false;
      if (toDate && itemDate > new Date(toDate)) return false;

      if (query) {
        const q = query.toLowerCase();
        const formattedDate = itemDate.toLocaleDateString();
        const text = `${item.title} ${item.description || ''} ${formattedDate}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [updates, fromDate, toDate, query]);

  const totalPages = Math.max(1, Math.ceil(filteredUpdates.length / pageSize));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const startIndex = (currentPageClamped - 1) * pageSize;
  const pageItems = filteredUpdates.slice(startIndex, startIndex + pageSize);

  const getYouTubeId = (urlString: string): string | null => {
    try {
      const url = new URL(urlString);
      if (url.hostname.includes('youtube.com')) {
        return url.searchParams.get('v');
      }
      if (url.hostname.includes('youtu.be')) {
        return url.pathname.split('/').filter(Boolean).pop() || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const isYouTubeUrl = (urlString: string | null) => {
    if (!urlString) return false;
    try {
      const url = new URL(urlString);
      return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  };

  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {newsContent.title || 'College News & Updates'}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {newsContent.description ||
                'Browse all published announcements, events, and important updates from Sri Sathya Sai Baba PU College.'}
            </p>
          </header>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:max-w-3xl">
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">From date</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">To date</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Search updates</Label>
                <Input
                  type="text"
                  placeholder="Search updates by title or description"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 md:self-center">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mr-3">
                <span>
                  Showing {filteredUpdates.length === 0 ? 0 : startIndex + 1}
                  –{Math.min(startIndex + pageItems.length, filteredUpdates.length)} of {filteredUpdates.length} news
                  items
                </span>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                  {filteredUpdates.length === 1
                    ? '1 update found'
                    : `${filteredUpdates.length} updates found`}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setQuery('');
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {pageItems.length === 0 ? (
            <div className="mt-8 text-center text-muted-foreground space-y-2">
              {updates.length === 0 ? (
                <p>No news has been published yet.</p>
              ) : (
                <>
                  <p>No updates match your current filters.</p>
                  <button
                    type="button"
                    className="text-primary text-sm font-medium hover:underline"
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                      setQuery('');
                    }}
                  >
                    Clear filters and show all updates
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {pageItems.map((item) => {
                  const youtubeLink = isYouTubeUrl(item.youtube_url) ? item.youtube_url : null;
                  const videoId = youtubeLink ? getYouTubeId(youtubeLink) : null;
                  const thumbnailUrl = videoId
                    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                    : null;

                  return (
                    <Card
                      key={item.id}
                      className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group bg-card"
                    >
                      {youtubeLink && thumbnailUrl ? (
                        <a
                          href={youtubeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="block aspect-video bg-muted relative overflow-hidden"
                        >
                          <img
                            src={thumbnailUrl}
                            alt={item.title || 'News video thumbnail'}
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

                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <h2 className="font-semibold text-foreground text-sm md:text-base leading-snug">
                          {item.title}
                        </h2>
                        {item.description && (
                          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        )}
                        {item.read_more_url && (
                          <a
                            href={item.read_more_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 text-primary text-xs md:text-sm font-medium hover:underline inline-flex items-center gap-1"
                          >
                            Read more
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPageClamped === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPageClamped} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPageClamped === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
