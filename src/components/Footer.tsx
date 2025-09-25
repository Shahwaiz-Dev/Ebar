import { Waves, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CookiePreferencesManager from './CookiePreferencesManager';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { label: 'About Us', href: '/contact' },
      { label: 'Careers', href: 'https://careers.beachvibe.com' },
      { label: 'Press', href: 'https://press.beachvibe.com' },
      { label: 'News', href: 'https://blog.beachvibe.com' },
      { label: 'Partnerships', href: '/contact' },
    ],
    Support: [
      { label: 'Help Center', href: 'https://help.beachvibe.com' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Safety', href: 'https://safety.beachvibe.com' },
      { label: 'Cancellation', href: 'https://help.beachvibe.com/cancellation' },
      { label: 'Trust & Safety', href: 'https://trust.beachvibe.com' },
    ],
    'For Bars': [
      { label: 'List Your Bar', href: '/dashboard' },
      { label: 'Bar Resources', href: 'https://resources.beachvibe.com' },
      { label: 'Community', href: 'https://community.beachvibe.com' },
      { label: 'Marketing', href: 'https://marketing.beachvibe.com' },
      { label: 'Analytics', href: '/dashboard' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: 'https://privacy.beachvibe.com' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Accessibility', href: 'https://accessibility.beachvibe.com' },
      { label: 'Sitemap', href: 'https://sitemap.beachvibe.com' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/beachvibe', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/beachvibe', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/beachvibe', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com/@beachvibe', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl lg:text-3xl font-playfair font-bold mb-4">
              Stay in the Loop
            </h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get the latest beach bar openings, exclusive deals, and travel inspiration 
              delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-md"
              />
              <Button variant="sunset" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 gradient-primary rounded-xl">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-playfair font-bold">BeachVibe</span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Discover the world's most beautiful beach bars and create unforgettable 
              memories by the sea. Your perfect beach escape is just a click away.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-white/80">
                <Mail className="h-4 w-4 mr-3 text-primary" />
                <a href="mailto:hello@beachvibe.com" className="hover:text-white transition-smooth">
                  hello@beachvibe.com
                </a>
              </div>
              <div className="flex items-center text-white/80">
                <Phone className="h-4 w-4 mr-3 text-primary" />
                <a href="tel:+15551234567" className="hover:text-white transition-smooth">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center text-white/80">
                <MapPin className="h-4 w-4 mr-3 text-primary" />
                Miami Beach, FL
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 hover:bg-primary rounded-xl flex items-center justify-center transition-smooth group"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-lg mb-6">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-white/80 hover:text-white transition-smooth hover:translate-x-1 inline-block"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-white/80 hover:text-white transition-smooth hover:translate-x-1 inline-block"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © {currentYear} BeachVibe. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0">
              <div className="flex space-x-6">
                <Link to="/terms" className="text-white/60 hover:text-white text-sm transition-smooth">
                  Terms
                </Link>
                <Link to="/cookie-policy" className="text-white/60 hover:text-white text-sm transition-smooth">
                  Cookies
                </Link>
              </div>
              <CookiePreferencesManager />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};