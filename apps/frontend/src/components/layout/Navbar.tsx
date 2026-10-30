import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Play } from 'lucide-react';
import { MeshviLogo } from '../brand/MeshviLogo';
import { ProductDemoPlayer } from '../ui/ProductDemoPlayer';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoPlayer, setShowDemoPlayer] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'How it works', href: '/how-it-works' },
    { name: 'Search Showcase', href: '/search-showcase' },
    { name: 'Why Meshvi', href: '/why-meshvi' },
    { name: 'For companies', href: '/for-companies' },
    { name: 'For leaders', href: '/for-professionals' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <MeshviLogo size="md" variant="full" className="h-8 transition-transform group-hover:scale-[1.02]" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive(link.href)
                    ? 'text-primary bg-primary-soft shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowDemoPlayer(true)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-primary bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              title="Watch full 15s interactive product demo"
            >
              <Play className="w-3 h-3 text-primary fill-primary" />
              <span>Watch Tour</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">1:30</span>
            </button>
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-bold text-navy hover:text-primary transition-colors cursor-pointer"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs hover:shadow-primary/20 transition-all cursor-pointer"
            >
              <span>Get started</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowDemoPlayer(true)}
              className="sm:hidden px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg flex items-center space-x-1 cursor-pointer"
            >
              <Play className="w-2.5 h-2.5 text-primary fill-primary" />
              <span>Tour</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-navy hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
                isActive(link.href)
                  ? 'text-primary bg-primary-soft font-bold'
                  : 'text-slate-700 hover:text-navy hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowDemoPlayer(true);
              }}
              className="w-full flex items-center justify-center py-2.5 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-primary fill-primary mr-1.5" />
              <span>Watch Interactive Product Tour (1:30)</span>
            </button>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-navy hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs"
              >
                <span>Get started</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Full Product Demo Modal */}
      <ProductDemoPlayer
        open={showDemoPlayer}
        initialChapter={0}
        mode="full"
        onClose={() => setShowDemoPlayer(false)}
      />
    </header>
  );
};
