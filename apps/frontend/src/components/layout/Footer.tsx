import { Link } from 'react-router-dom';
import { MeshviLogo } from '../brand/MeshviLogo';

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand & Positioning */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <MeshviLogo size="md" variant="full" className="h-8" />
            </Link>
            <p className="text-sm text-text-muted max-w-sm">
              An intent-driven business discovery and professional connection platform.
              Start with your objective, discover relevant companies and people, and connect with clear context.
            </p>
            <div className="p-3 bg-surface-muted rounded-lg border border-border/60 text-xs text-text-muted">
              <strong className="text-navy">Trust Note:</strong> Recommendations depend strictly on available, permitted professional data. MESHVI assists in identifying relevant contacts; it does not claim to guarantee internal decision-making authority.
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/how-it-works" className="text-text-muted hover:text-navy transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/search-showcase" className="text-primary hover:text-primary-hover font-semibold transition-colors">
                  Search Showcase &rarr;
                </Link>
              </li>
              <li>
                <Link to="/why-meshvi" className="text-text-muted hover:text-navy transition-colors">
                  Why Meshvi
                </Link>
              </li>
              <li>
                <Link to="/for-companies" className="text-text-muted hover:text-navy transition-colors">
                  For companies
                </Link>
              </li>
              <li>
                <Link to="/for-professionals" className="text-text-muted hover:text-navy transition-colors">
                  For professionals
                </Link>
              </li>
              <li>
                <Link to="/use-cases" className="text-text-muted hover:text-navy transition-colors">
                  Use cases
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-text-muted hover:text-navy transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-4">Governance & Legal</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="text-text-muted hover:text-navy transition-colors">
                  About Meshvi
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-text-muted hover:text-navy transition-colors">
                  Privacy policy (GDPR)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-text-muted hover:text-navy transition-colors">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-text-muted hover:text-navy transition-colors">
                  Legal notice
                </Link>
              </li>
              <li>
                <Link to="/data-usage" className="text-emerald-700 hover:text-emerald-900 font-semibold transition-colors">
                  How we use data
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-text-muted hover:text-navy transition-colors">
                  Cookie policy
                </Link>
              </li>
              <li>
                <Link to="/delete-account" className="text-danger hover:text-danger/80 transition-colors font-medium">
                  Delete account
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-text-muted hover:text-navy transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Dedicated Portals Section */}
          <div>
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-4">Dedicated Portals</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/company/login" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  Company Portal Login &rarr;
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-amber-600 hover:text-amber-800 font-medium transition-colors">
                  Admin Ops Console &rarr;
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Member Hub Sign In &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted gap-4">
          <p>&copy; {new Date().getFullYear()} Vedasynk Technologies. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
              Systems Operational (Ports: 3100 / 3500)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
