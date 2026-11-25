import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut, Menu, User, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { RoleSwitcherControl } from '@/src/components/shared/RoleSwitcherControl';
import { useAuth } from '@/src/context/AuthContext';

const PUBLIC_NAV = [
  { to: '/explore', label: 'Explore' },
  { to: '/ai-discover', label: 'AI Discover' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="font-display text-xl font-semibold tracking-tight text-navy whitespace-nowrap shrink-0"
          >
            StayAI
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground"
          >
            {PUBLIC_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 transition-colors hover:text-foreground underline-offset-4 hover:underline ${
                    isActive ? 'text-primary font-semibold' : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:block">
              <RoleSwitcherControl />
            </div>
            {user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Button asChild size="sm" variant="outline">
                  <Link to="/account" className="max-w-[150px] truncate">
                    <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {profile?.displayName?.split(' ')[0] || 'Account'}
                    </span>
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => logout()}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" variant="default" className="hidden sm:inline-flex">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-secondary cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {PUBLIC_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-secondary"
                  >
                    My Account ({profile?.displayName || user.email})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-secondary"
                >
                  Sign In / Register
                </Link>
              )}
            </nav>
            <div className="pt-2 border-t border-border">
              <RoleSwitcherControl />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <Link to="/" className="font-display text-lg font-semibold text-navy">
                StayAI
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Minimal, transparent hotel discovery for India. Clear INR GST pricing,
                verifiable inventory provenance, and grounded AI search.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3">Discover</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/explore" className="hover:text-foreground">Explore India</Link></li>
                <li><Link to="/ai-discover" className="hover:text-foreground">AI Discovery</Link></li>
                <li><Link to="/explore?city=Goa" className="hover:text-foreground">South & North Goa</Link></li>
                <li><Link to="/explore?city=Jaipur" className="hover:text-foreground">Jaipur & Udaipur</Link></li>
                <li><Link to="/explore?city=Coorg" className="hover:text-foreground">Coorg Coffee Estates</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3">Company & Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About StayAI</Link></li>
                <li><Link to="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link to="/manager" className="hover:text-foreground">Hotel Manager Portal</Link></li>
                <li><Link to="/admin" className="hover:text-foreground">Admin Console</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3">Policies</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/cancellation-policy" className="hover:text-foreground">Cancellation Policy</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} StayAI India Hospitality Technologies.</span>
            <span>All prices displayed in INR (₹) with Indian GST slabs itemized upfront.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
