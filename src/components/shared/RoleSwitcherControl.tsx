import { useNavigate } from 'react-router-dom';
import { ChevronDown, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useAppState } from '@/src/context/AppStateContext';
import type { UserRole } from '@/src/types/domain';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

const ROLE_OPTIONS: {
  role: UserRole;
  label: string;
  destination: string;
  hint: string;
}[] = [
  {
    role: 'public',
    label: 'Explore Stays',
    destination: '/',
    hint: 'Discovery, search & hotel details',
  },
  {
    role: 'customer',
    label: 'Customer Portal',
    destination: '/account',
    hint: 'Bookings, saved stays & checkout',
  },
  {
    role: 'manager',
    label: 'Hotel Manager',
    destination: '/manager',
    hint: 'Properties, calendar, rooms & revenue',
  },
  {
    role: 'admin',
    label: 'Platform Admin',
    destination: '/admin',
    hint: 'Verification, refunds & audit logs',
  },
];

export function RoleSwitcherControl() {
  const { previewRole, setPreviewRole } = useAppState();
  const navigate = useNavigate();

  const current =
    ROLE_OPTIONS.find((r) => r.role === previewRole) ?? ROLE_OPTIONS[0];

  const handleSelect = (opt: (typeof ROLE_OPTIONS)[number]) => {
    setPreviewRole(opt.role);
    navigate(opt.destination);
    toast(`Switched to ${opt.label}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary/80 px-3 text-xs font-medium text-foreground hover:bg-secondary transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          aria-label="Switch Workspace"
        >
          <Layers className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>{current.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLE_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.role}
            onClick={() => handleSelect(opt)}
            className={previewRole === opt.role ? 'bg-accent/70 text-accent-foreground' : ''}
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[11px] text-muted-foreground">{opt.hint}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
