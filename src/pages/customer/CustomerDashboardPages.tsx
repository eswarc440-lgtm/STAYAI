import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input, Label } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Switch } from '@/src/components/ui/controls';
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from '@/src/components/ui/table';
import { HotelCard } from '@/src/components/shared/HotelCard';
import {
  EmptyStatePanel,
  StatusText,
} from '@/src/components/shared/StatePanels';
import { formatDateTimeIST, formatINR, formatShortDate } from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';
import { useAuth } from '@/src/context/AuthContext';

export function CustomerDashboardPage() {
  const { bookings, savedIds, recentViewIds, notifications } = useAppState();
  const { user, profile } = useAuth();
  const customerBookings = bookings;
  const unread = notifications.filter((n) => !n.read).length;
  const firstName =
    profile?.displayName?.split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    'Traveler';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your bookings, saved stays, GST receipts, and notifications.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bookings', value: String(customerBookings.length), to: '/account/bookings' },
          { label: 'Saved Stays', value: String(savedIds.length), to: '/account/saved' },
          { label: 'Recently Viewed', value: String(recentViewIds.length), to: '/account/recently-viewed' },
          { label: 'Unread Alerts', value: String(unread), to: '/account/notifications' },
        ].map((kpi) => (
          <Link
            key={kpi.label}
            to={kpi.to}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
          >
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className="mt-2 font-tabular text-2xl font-semibold text-navy">
              {kpi.value}
            </div>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Bookings</CardTitle>
          <Link to="/account/bookings" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {customerBookings.map((bk) => (
            <div
              key={bk.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4"
            >
              <div>
                <div className="text-xs font-tabular text-muted-foreground">
                  {bk.bookingReference} · {formatShortDate(bk.checkIn)} to {formatShortDate(bk.checkOut)}
                </div>
                <div className="font-semibold text-navy mt-0.5">{bk.propertyName}</div>
                <div className="text-xs text-muted-foreground">{bk.roomName}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-tabular text-sm font-semibold text-navy">
                    {formatINR(bk.totalAmountInr)}
                  </div>
                  <StatusText
                    tone={
                      bk.status === 'cancelled'
                        ? 'danger'
                        : bk.status === 'confirmed'
                          ? 'success'
                          : 'warning'
                    }
                    label={
                      bk.status === 'cancelled'
                        ? 'Cancelled'
                        : bk.status === 'confirmed'
                          ? 'Confirmed'
                          : 'Pending Payment'
                    }
                  />
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/account/bookings/${bk.id}`}>Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function CustomerBookingsPage() {
  const { bookings } = useAppState();
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const customerBookings = bookings;
  const filtered = customerBookings.filter((b) => {
    if (filter === 'active') return b.status !== 'cancelled';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-navy">My Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Track reservations, hold timers, GST receipts, and cancellations.
          </p>
        </div>
        <div className="inline-flex rounded-lg bg-secondary p-1 text-xs">
          {(['all', 'active', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md capitalize cursor-pointer ${
                filter === tab
                  ? 'bg-card font-medium text-foreground shadow-xs'
                  : 'text-muted-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyStatePanel
          title="No bookings in this category"
          description="Explore verified pan-India stays to compare rates and policies."
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <tr>
              <DataTableTh>Reference</DataTableTh>
              <DataTableTh>Property & Room</DataTableTh>
              <DataTableTh>Dates</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh className="text-right">Total (INR)</DataTableTh>
              <DataTableTh className="text-right">Action</DataTableTh>
            </tr>
          </DataTableHead>
          <tbody>
            {filtered.map((bk) => (
              <DataTableRow key={bk.id}>
                <DataTableTd className="font-tabular text-xs font-medium">
                  {bk.bookingReference}
                </DataTableTd>
                <DataTableTd>
                  <div className="font-medium text-navy">{bk.propertyName}</div>
                  <div className="text-xs text-muted-foreground">{bk.roomName}</div>
                </DataTableTd>
                <DataTableTd className="font-tabular text-xs whitespace-nowrap">
                  {formatShortDate(bk.checkIn)} – {formatShortDate(bk.checkOut)}
                </DataTableTd>
                <DataTableTd>
                  <StatusText
                    tone={
                      bk.status === 'cancelled'
                        ? 'danger'
                        : bk.status === 'confirmed'
                          ? 'success'
                          : 'warning'
                    }
                    label={
                      bk.status === 'cancelled'
                        ? 'Cancelled'
                        : bk.status === 'confirmed'
                          ? 'Confirmed'
                          : 'Pending Payment'
                    }
                  />
                </DataTableTd>
                <DataTableTd className="text-right font-tabular font-medium">
                  {formatINR(bk.totalAmountInr)}
                </DataTableTd>
                <DataTableTd className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/account/bookings/${bk.id}`}>Inspect</Link>
                  </Button>
                </DataTableTd>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      )}
    </div>
  );
}

export function CustomerBookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { bookings, cancelBooking } = useAppState();
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <EmptyStatePanel
        title="Booking record not found"
        description="This reservation ID was not found in your account."
        actionLabel="Back to My Bookings"
        onAction={() => navigate('/account/bookings')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-tabular text-muted-foreground">
            {booking.bookingReference}
          </div>
          <h1 className="font-display text-2xl font-medium text-navy">
            {booking.propertyName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/booking-confirmation/${booking.id}`}>Open Receipt</Link>
          </Button>
          {booking.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                cancelBooking(booking.id);
                toast.success(`Reservation ${booking.bookingReference} cancelled`);
              }}
            >
              Cancel Reservation
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Room & Occupancy</div>
            <div className="font-medium text-foreground mt-0.5">
              {booking.roomName} · {booking.guests} guests
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Dates</div>
            <div className="font-tabular font-medium text-foreground mt-0.5">
              {formatShortDate(booking.checkIn)} → {formatShortDate(booking.checkOut)} ({booking.nights} nights)
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Tariff + GST Breakdown</div>
            <div className="font-tabular text-foreground mt-0.5">
              Base {formatINR(booking.baseAmountInr)} + GST ({booking.gstRatePercent}%) {formatINR(booking.gstAmountInr)} ={' '}
              <strong>{formatINR(booking.totalAmountInr)}</strong>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-0.5">
              <StatusText
                tone={
                  booking.status === 'cancelled'
                    ? 'danger'
                    : booking.status === 'confirmed'
                      ? 'success'
                      : 'warning'
                }
                label={
                  booking.status === 'cancelled'
                    ? 'Cancelled'
                    : booking.status === 'confirmed'
                      ? 'Confirmed'
                      : 'Pending Payment'
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CustomerSavedPage() {
  const { properties, savedIds } = useAppState();
  const navigate = useNavigate();
  const saved = properties.filter((p) => savedIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Saved Stays</h1>
        <p className="text-sm text-muted-foreground">
          Your shortlisted properties across India ({saved.length}).
        </p>
      </div>
      {saved.length === 0 ? (
        <EmptyStatePanel
          title="No saved stays yet"
          description="Tap the heart icon on any hotel card to build your shortlist."
          actionLabel="Explore Stays"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {saved.map((p) => (
            <HotelCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CustomerRecentPage() {
  const { properties, recentViewIds } = useAppState();
  const navigate = useNavigate();
  const viewed = recentViewIds
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Recently Viewed</h1>
        <p className="text-sm text-muted-foreground">
          Properties you inspected during this session.
        </p>
      </div>
      {viewed.length === 0 ? (
        <EmptyStatePanel
          title="No recently viewed stays"
          description="Open any hotel detail page to track your browsing history here."
          actionLabel="Browse Catalog"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {viewed.map((p) => (
            <HotelCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CustomerPaymentsPage() {
  const { payments } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Payments & Refunds</h1>
        <p className="text-sm text-muted-foreground">
          Server-verified payment ledger. Card numbers, CVVs, and UPI PINs are never stored.
        </p>
      </div>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Payment ID</DataTableTh>
            <DataTableTh>Booking</DataTableTh>
            <DataTableTh>Mode</DataTableTh>
            <DataTableTh>Status</DataTableTh>
            <DataTableTh className="text-right">Amount</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {payments.map((pay) => (
            <DataTableRow key={pay.id}>
              <DataTableTd className="font-tabular text-xs">{pay.id}</DataTableTd>
              <DataTableTd className="font-tabular text-xs">{pay.bookingReference}</DataTableTd>
              <DataTableTd className="text-xs capitalize">{pay.mode}</DataTableTd>
              <DataTableTd>
                <StatusText
                  tone={pay.status === 'refunded' ? 'success' : 'warning'}
                  label={pay.status === 'refunded' ? 'Refunded (Demo)' : 'Unprocessed Preview'}
                />
              </DataTableTd>
              <DataTableTd className="text-right font-tabular font-medium">
                {formatINR(pay.amountInr)}
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function CustomerNotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppState();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-navy">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            In-app events for registration, booking, payment, cancellation, refund, and reviews.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
          Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
              n.read ? 'border-border bg-card' : 'border-primary/40 bg-accent/35'
            }`}
          >
            <div>
              <div className="text-xs text-muted-foreground">
                <span className="capitalize font-medium text-foreground">{n.category}</span> ·{' '}
                <span className="font-tabular">{formatDateTimeIST(n.createdAt)}</span>
              </div>
              <div className="font-semibold text-sm text-navy mt-1">{n.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
            </div>
            {!n.read && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markNotificationRead(n.id)}
              >
                Mark read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const profileSchema = z.object({
  displayName: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  city: z.string().min(2, 'Enter your city'),
});

export function CustomerProfilePage() {
  const { user, profile, assignedRole, updateOwnProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || 'Ananya Deshmukh',
      phone: profile?.phone || '+91 98450 11223',
      city: profile?.city || 'Bengaluru',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        city: profile.city || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user) {
      toast.info('Sign in with Google to save profile changes to Firestore', {
        description: `Validated profile fields for ${data.displayName}.`,
      });
      return;
    }

    setSaving(true);
    try {
      await updateOwnProfile(data);
      toast.success('Profile saved to Firestore', {
        description: 'Your display name, mobile number, and city were updated securely.',
      });
    } catch {
      toast.error('Failed to update profile in Firestore', {
        description: 'Verify your connection and signed-in session, then retry.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update personal contact details. Account roles are enforced by Firestore Security Rules and cannot be altered from the client.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="prof-name">Full name</Label>
              <Input id="prof-name" {...register('displayName')} />
              {errors.displayName && (
                <p className="mt-1 text-xs text-destructive">{errors.displayName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="prof-email">Email (read-only)</Label>
              <Input
                id="prof-email"
                value={user?.email || 'ananya.demo@stayai.example'}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="prof-role">Assigned Role (server-managed)</Label>
              <Input
                id="prof-role"
                value={user ? assignedRole : 'customer (demo preview)'}
                disabled
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prof-phone">Mobile number</Label>
                <Input id="prof-phone" {...register('phone')} />
              </div>
              <div>
                <Label htmlFor="prof-city">Home city</Label>
                <Input id="prof-city" {...register('city')} />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving to Firestore...' : 'Save Profile Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function CustomerSettingsPage() {
  const [inAppBooking, setInAppBooking] = useState(true);
  const [inAppPriceDrops, setInAppPriceDrops] = useState(true);

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage notification channels and privacy preferences.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">In-app booking & refund alerts</div>
              <div className="text-xs text-muted-foreground">Required for hold timers and refund updates.</div>
            </div>
            <Switch checked={inAppBooking} onCheckedChange={setInAppBooking} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">Saved stay availability notices</div>
              <div className="text-xs text-muted-foreground">In-app notifications when watched dates open up.</div>
            </div>
            <Switch checked={inAppPriceDrops} onCheckedChange={setInAppPriceDrops} />
          </div>
          <div className="flex items-center justify-between gap-4 opacity-70">
            <div>
              <div className="text-sm font-medium text-foreground">Email & SMS alerts</div>
              <div className="text-xs text-muted-foreground">Not configured — requires provider credentials.</div>
            </div>
            <Switch checked={false} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
