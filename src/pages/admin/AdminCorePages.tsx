import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from '@/src/components/ui/table';
import { StatusText } from '@/src/components/shared/StatePanels';
import { formatDateTimeIST, formatINR, formatShortDate } from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';

export function AdminAnalyticsPage() {
  const { users, properties, bookings, refunds, tickets } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy">
          Platform Analytics & Governance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          High-level health across users, properties, reservations, refunds, and compliance.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Accounts', value: String(users.length), note: 'Active platform users' },
          { label: 'Catalog Properties', value: String(properties.length), note: 'Pan-India inventory' },
          { label: 'Total Bookings', value: String(bookings.length), note: 'Confirmed & pending' },
          { label: 'Open Tickets / Refunds', value: `${tickets.filter((t) => t.status !== 'resolved').length} / ${refunds.length}`, note: 'Governance queue' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className="mt-2 font-tabular text-2xl font-semibold text-navy">{kpi.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{kpi.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  const { users } = useAppState();
  const [query, setQuery] = useState('');
  const filtered = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-navy">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">
            Roles are strictly server-assigned; clients cannot self-promote to manager or admin.
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, role..."
          className="w-64"
        />
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>User</DataTableTh>
            <DataTableTh>Role</DataTableTh>
            <DataTableTh>City</DataTableTh>
            <DataTableTh>Status</DataTableTh>
            <DataTableTh className="text-right">Last Active</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {filtered.map((u) => (
            <DataTableRow key={u.uid}>
              <DataTableTd>
                <div className="font-medium text-navy">{u.displayName}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </DataTableTd>
              <DataTableTd className="capitalize font-medium text-xs">{u.role}</DataTableTd>
              <DataTableTd className="text-xs">{u.city ?? '—'}</DataTableTd>
              <DataTableTd>
                <StatusText tone="success" label="Active (Demo)" />
              </DataTableTd>
              <DataTableTd className="text-right font-tabular text-xs text-muted-foreground">
                {formatDateTimeIST(u.lastActiveAt)}
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function AdminHotelsPage() {
  const { properties } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">All Properties</h1>
        <p className="text-sm text-muted-foreground">
          Complete directory showing data source, verification state, and booking capability.
        </p>
      </div>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Property</DataTableTh>
            <DataTableTh>City</DataTableTh>
            <DataTableTh>Data Source</DataTableTh>
            <DataTableTh>Verification</DataTableTh>
            <DataTableTh>Bookable</DataTableTh>
            <DataTableTh className="text-right">Base Rate</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {properties.map((p) => (
            <DataTableRow key={p.id}>
              <DataTableTd className="font-medium text-navy">{p.name}</DataTableTd>
              <DataTableTd className="text-xs">{p.city}</DataTableTd>
              <DataTableTd className="text-xs capitalize">{p.dataSource}</DataTableTd>
              <DataTableTd>
                <StatusText
                  tone={p.verificationStatus === 'verified' ? 'success' : 'warning'}
                  label={p.verificationStatus.replace('_', ' ')}
                />
              </DataTableTd>
              <DataTableTd className="text-xs text-amber-900">
                {p.bookable ? 'Yes' : 'No (Demo)'}
              </DataTableTd>
              <DataTableTd className="text-right font-tabular">
                {formatINR(p.startingRateInr)}
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function AdminVerificationPage() {
  const { properties, updatePropertyVerificationPreview } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Property Verification Queue</h1>
        <p className="text-sm text-muted-foreground">
          Verify direct hotel GSTIN, legal documentation, and imagery before enabling live bookings.
          Demo seed records remain non-bookable regardless of preview badge state.
        </p>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Property</DataTableTh>
            <DataTableTh>Location</DataTableTh>
            <DataTableTh>Current Status</DataTableTh>
            <DataTableTh className="text-right">Admin Actions (Preview)</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {properties.map((p) => (
            <DataTableRow key={p.id}>
              <DataTableTd>
                <div className="font-medium text-navy">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category} · Manager {p.managerId}</div>
              </DataTableTd>
              <DataTableTd className="text-xs">{p.city}, {p.state}</DataTableTd>
              <DataTableTd>
                <StatusText
                  tone={
                    p.verificationStatus === 'verified'
                      ? 'success'
                      : p.verificationStatus === 'suspended'
                        ? 'danger'
                        : 'warning'
                  }
                  label={p.verificationStatus.replace('_', ' ')}
                />
              </DataTableTd>
              <DataTableTd className="text-right">
                <div className="inline-flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updatePropertyVerificationPreview(p.id, 'verified');
                      toast.success(`Marked ${p.name} verified (preview + audit logged)`);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      updatePropertyVerificationPreview(p.id, 'suspended');
                      toast.info(`Suspended ${p.name} (preview + audit logged)`);
                    }}
                  >
                    Suspend
                  </Button>
                </div>
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function AdminBookingsPage() {
  const { bookings } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Platform Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Cross-property reservation oversight with atomic hold & provider status tracking.
        </p>
      </div>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Reference</DataTableTh>
            <DataTableTh>Guest</DataTableTh>
            <DataTableTh>Property</DataTableTh>
            <DataTableTh>Dates</DataTableTh>
            <DataTableTh>Status</DataTableTh>
            <DataTableTh className="text-right">Total</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {bookings.map((b) => (
            <DataTableRow key={b.id}>
              <DataTableTd className="font-tabular text-xs font-medium">{b.bookingReference}</DataTableTd>
              <DataTableTd className="text-sm">{b.guestName}</DataTableTd>
              <DataTableTd className="text-xs">{b.propertyName}</DataTableTd>
              <DataTableTd className="font-tabular text-xs">
                {formatShortDate(b.checkIn)} – {formatShortDate(b.checkOut)}
              </DataTableTd>
              <DataTableTd>
                <StatusText
                  tone={b.status === 'cancelled' ? 'danger' : 'warning'}
                  label={b.status.replace('_', ' ')}
                />
              </DataTableTd>
              <DataTableTd className="text-right font-tabular font-medium">
                {formatINR(b.totalAmountInr)}
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}
