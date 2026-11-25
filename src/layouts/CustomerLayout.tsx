import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  Clock,
  CreditCard,
  Heart,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react';
import { useAppState } from '@/src/context/AppStateContext';
import { RoleSwitcherControl } from '@/src/components/shared/RoleSwitcherControl';

const CUSTOMER_NAV = [
  { to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/account/bookings', label: 'My Bookings', icon: CalendarCheck },
  { to: '/account/saved', label: 'Saved Stays', icon: Heart },
  { to: '/account/recently-viewed', label: 'Recently Viewed', icon: Clock },
  { to: '/account/payments', label: 'Payments', icon: CreditCard },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/settings', label: 'Settings', icon: Settings },
];

export function CustomerLayout() {
  const { notifications } = useAppState();
  const unreadCount = notifications.filter((n) => !n.read).length;

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

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/explore" className="hover:text-foreground whitespace-nowrap">
              Explore Stays
            </Link>
            <Link to="/ai-discover" className="hover:text-foreground whitespace-nowrap">
              AI Discover
            </Link>
            <Link to="/checkout" className="hover:text-foreground whitespace-nowrap">
              Checkout Preview
            </Link>
            <Link to="/help" className="hover:text-foreground whitespace-nowrap">
              Help
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <RoleSwitcherControl />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1280px] flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-60 shrink-0">
            <div className="mb-4 px-2 hidden lg:block">
              <div className="text-sm font-semibold text-foreground">
                Ananya Deshmukh
              </div>
              <div className="text-xs text-muted-foreground">
                Demo Customer Account
              </div>
            </div>
            <nav
              aria-label="Customer account navigation"
              className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0"
            >
              {CUSTOMER_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `inline-flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                        isActive
                          ? 'bg-accent text-accent-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`
                    }
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </span>
                    {item.to === '/account/notifications' && unreadCount > 0 && (
                      <span className="font-tabular text-xs font-semibold text-primary">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
