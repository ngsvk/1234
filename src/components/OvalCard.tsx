import { Link } from 'react-router-dom';

interface OvalCardProps {
  /** Small label above the title (e.g. "BLESSINGS") */
  label: string;
  /** Main title text */
  title: string;
  /** Body/description text */
  description: string;
  /** Image URL to display inside the oval frame */
  imageUrl: string;
  /** Alt text for the image for accessibility and SEO */
  imageAlt: string;
  /** Route to navigate when clicking "Read more" */
  readMoreTo?: string;
}

/**
 * Reusable card with tall oval image on the left and text content on the right.
 * Mirrors the Founder / Blessings layout so it can be reused across pages.
 */
export function OvalCard({
  label,
  title,
  description,
  imageUrl,
  imageAlt,
  readMoreTo = '/about',
}: OvalCardProps) {
  return (
    <article className="flex items-start md:items-center gap-4 md:gap-6 text-left text-white">
      <div className="egg-mask shrink-0 w-28 h-44 sm:w-32 sm:h-56 overflow-hidden bg-muted/40 border border-white/30 hover-scale">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>
      <div className="max-w-md">
        <span className="block text-[10px] sm:text-xs tracking-[0.35em] uppercase text-white/60 mb-1">
          {label}
        </span>
        <h4 className="text-base sm:text-lg md:text-2xl font-semibold mb-2">
          {title}
        </h4>
        <p className="text-xs sm:text-sm md:text-base text-white/80 leading-relaxed">
          {description}{' '}
          <Link to={readMoreTo} className="read-more font-medium underline underline-offset-2">
            Read more
          </Link>
        </p>
      </div>
    </article>
  );
}
