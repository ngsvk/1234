import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

export default function Footer() {
  const { content } = useContent();
  const footer = content.footer;
  const navbar = content.navbar;

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <img
              alt="College Logo"
              src={footer.logoUrl}
              className="h-14 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
            <h3 className="text-lg font-bold">{footer.collegeName}</h3>
            <p className="text-primary-foreground/80 text-sm">{footer.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {navbar.links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/admission" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Admissions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="flex-shrink-0 mt-1" />
                <span className="text-primary-foreground/80 text-sm">{footer.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">{footer.contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">{footer.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Timings */}
          <div>
            <h4 className="text-lg font-semibold mb-4">College Hours</h4>
            <ul className="space-y-2 text-primary-foreground/80 text-sm">
              <li>{footer.hours.weekdays}</li>
              <li>{footer.hours.saturday}</li>
              <li>{footer.hours.sunday}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
