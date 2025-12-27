import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import collegeLogo from '@/assets/college-logo.png';
import trustLogo from '@/assets/trust-logo.png';

export default function Navbar() {
  const { content } = useContent();
  const navbar = content.navbar;
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-card/95 backdrop-blur-md shadow-lg' : 'bg-card shadow-md'}`}>
      <div className="container mx-auto px-4">
        {/* Desktop: Single row with logos, name, and navigation */}
        <div className="hidden md:flex items-center justify-between py-3 gap-6">
          {/* Left Logo */}
          <a href={navbar.leftLogoHref || "/"} className="flex-shrink-0">
            <img
              alt="Trust Logo"
              className="h-14 w-auto object-contain"
              src={navbar.leftLogoUrl || trustLogo}
              loading="lazy"
              decoding="async"
            />
          </a>

          {/* Center - College Name and Navigation */}
          <div className="flex flex-col items-center justify-center flex-1">
            <h1 className="text-lg lg:text-xl font-bold text-foreground leading-tight text-center">
              {navbar.collegeName}
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-2">{navbar.subtitle}</p>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {navbar.links.filter((link) => link.enabled !== false).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
              {navbar.admissionButtonEnabled !== false && (
                <Link to="/admission" className="btn-admission">
                  {navbar.admissionButtonText}
                </Link>
              )}
            </div>
          </div>

          {/* Right Logo */}
          <a href={navbar.rightLogoHref || "/"} className="flex-shrink-0">
            <img
              alt="College Logo"
              className="h-14 w-auto object-contain"
              src={navbar.rightLogoUrl || collegeLogo}
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden py-3">
          <div className="flex items-center justify-between gap-4">
            <a href={navbar.leftLogoHref || "/"} className="flex-shrink-0">
              <img
                src={navbar.leftLogoUrl || trustLogo}
                alt="Trust Logo"
                className="h-12 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </a>

            <div className="flex flex-col items-center flex-1">
              <h1 className="text-sm font-bold text-foreground leading-tight text-center">
                {navbar.collegeName}
              </h1>
              <p className="text-xs text-muted-foreground">{navbar.subtitle}</p>
            </div>

            <a href={navbar.rightLogoHref || "/"} className="flex-shrink-0">
              <img
                src={navbar.rightLogoUrl || collegeLogo}
                alt="College Logo"
                className="h-12 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>

          {/* Mobile Menu Button and Admission */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {navbar.admissionButtonEnabled !== false && (
              <Link to="/admission" className="btn-admission text-sm px-4 py-2">
                {navbar.admissionButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navbar.links.filter((link) => link.enabled !== false).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 px-4 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}