import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BedDouble,
  Building2,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  CreditCard,
  FileCheck2,
  IndianRupee,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Percent,
  PlusCircle,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  Ticket,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { RoleSwitcherControl } from '@/src/components/shared/RoleSwitcherControl';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const MANAGER_NAV: NavItem[] = [
  { to: '/manager', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/manager/onboarding', label: 'Property Onboarding', icon: PlusCircle },
  { to: '/manager/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/manager/availability', label: 'Availability Calendar', icon: CalendarDays },
  { to: '/manager/pricing', label: 'Pricing & GST', icon: IndianRupee },
  { to: '/manager/bookings', label: 'Bookings', icon: CalendarRange },
  { to: '/manager/guests', label: 'Guests', icon: Users },
  { to: '/manager/reviews', label: 'Reviews & Replies', icon: MessageSquare },
  { to: '/manager/revenue', label: 'Revenue & Settlements', icon: BarChart3 },
  { to: '/manager/promotions', label: 'Promotions', icon: Tag },
  { to: '/manager/staff', label: 'Staff', icon: UserCog },
  { to: '/manager/ai-insights', label: 'AI Insights', icon: Sparkles },
  { to: '/manager/settings', label: 'Settings', icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Analytics Overview', icon: BarChart3, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/hotels', label: 'Hotels', icon: Building2 },
  { to: '/admin/verification', label: 'Verification Queue', icon: FileCheck2 },
  { to: '/admin/bookings', label: 'Bookings', icon: CheckSquare },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/refunds', label: 'Refunds', icon: RotateCcw },
  { to: '/admin/complaints', label: 'Complaints', icon: Ticket },
  { to: '/admin/commission', label: 'Commission Settings', icon: Percent },
  { to: '/admin/health', label: 'Health & Audit Logs', icon: Activity },
];

function WorkspaceShell({
  portalTitle,
  portalSubtitle,
  navItems,
}: {
  portalTitle: string;
  portalSubtitle: string;
  navItems: NavItem[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const activeItem =
    navItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    ) ?? navItems[0];

  const renderLinks = (onSelect?: () => void) => (
    <nav className="flex flex-col gap-0.5 px-3 py-4" aria-label={`${portalTitle} navigation`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onSelect}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card z-30">
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/" className="font-display text-lg font-semibold text-navy">
            StayAI
          </Link>
          <span className="text-xs font-medium text-primary">
            {portalTitle}
          </span>
        </div>
        <div className="px-5 pt-4 pb-1">
          <div className="text-xs text-muted-foreground">{portalSubtitle}</div>
        </div>
        <div className="flex-1 overflow-y-auto">{renderLinks()}</div>
        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            StayAI Workspace
          </div>
          <p className="mt-1 leading-snug">
            Instant access enabled across Customer, Manager, and Admin tools.
          </p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-navy/45"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-card border-r border-border shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <span className="font-display text-lg font-semibold text-navy">
                StayAI · {portalTitle}
              </span>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderLinks(() => setDrawerOpen(false))}
            </div>
          </aside>
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex flex-1 flex-col lg:pl-[260px] min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open workspace sidebar"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-secondary cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-muted-foreground hidden sm:inline">
                {portalTitle}
              </span>
              <span className="text-muted-foreground hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-foreground truncate">
                {activeItem.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <RoleSwitcherControl />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ManagerLayout() {
  return (
    <WorkspaceShell
      portalTitle="Manager"
      portalSubtitle="Rohan Naik · Portfolio Preview"
      navItems={MANAGER_NAV}
    />
  );
}

export function AdminLayout() {
  return (
    <WorkspaceShell
      portalTitle="Admin"
      portalSubtitle="Devika Sharma · Governance Console"
      navItems={ADMIN_NAV}
    />
  );
}
