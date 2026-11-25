import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input, Label, NativeSelect, Textarea } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Switch } from '@/src/components/ui/controls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from '@/src/components/ui/table';
import { StatusText } from '@/src/components/shared/StatePanels';
import { formatINR, formatShortDate } from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';

export function ManagerBookingsPage() {
  const { bookings } = useAppState();
  const [search, setSearch] = useState('');
  const filtered = bookings.filter(
    (b) =>
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingReference.toLowerCase().includes(search.toLowerCase()) ||
      b.propertyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-navy">Property Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage active, confirmed, and cancelled reservations across your portfolio.
          </p>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by guest or ref..."
          className="w-60"
        />
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Ref</DataTableTh>
            <DataTableTh>Guest</DataTableTh>
            <DataTableTh>Property & Room</DataTableTh>
            <DataTableTh>Stay</DataTableTh>
            <DataTableTh>Status</DataTableTh>
            <DataTableTh className="text-right">Total</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {filtered.map((b) => (
            <DataTableRow key={b.id}>
              <DataTableTd className="font-tabular text-xs font-medium">{b.bookingReference}</DataTableTd>
              <DataTableTd>
                <div className="font-medium text-navy">{b.guestName}</div>
                <div className="text-xs text-muted-foreground">{b.guestPhone}</div>
              </DataTableTd>
              <DataTableTd>
                <div className="text-sm">{b.propertyName}</div>
                <div className="text-xs text-muted-foreground">{b.roomName}</div>
              </DataTableTd>
              <DataTableTd className="font-tabular text-xs whitespace-nowrap">
                {formatShortDate(b.checkIn)} · {b.nights}n
              </DataTableTd>
              <DataTableTd>
                <StatusText
                  tone={b.status === 'cancelled' ? 'danger' : 'warning'}
                  label={b.status === 'hold_active' ? 'Hold Active (Demo)' : b.status === 'cancelled' ? 'Cancelled' : 'Demo Preview'}
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

export function ManagerGuestsPage() {
  const { bookings } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Guest Directory</h1>
        <p className="text-sm text-muted-foreground">
          Guests associated strictly with reservations at your properties.
        </p>
      </div>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Guest Name</DataTableTh>
            <DataTableTh>Email</DataTableTh>
            <DataTableTh>Phone</DataTableTh>
            <DataTableTh>Last Property</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {bookings.map((b) => (
            <DataTableRow key={b.id}>
              <DataTableTd className="font-medium text-navy">{b.guestName}</DataTableTd>
              <DataTableTd className="text-xs text-muted-foreground">{b.guestEmail}</DataTableTd>
              <DataTableTd className="font-tabular text-xs">{b.guestPhone}</DataTableTd>
              <DataTableTd className="text-xs">{b.propertyName}</DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function ManagerReviewsPage() {
  const { reviews, replyToReviewPreview } = useAppState();
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Reviews & Manager Replies</h1>
        <p className="text-sm text-muted-foreground">
          Respond transparently to guest feedback across your portfolio.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <Card key={rev.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-navy">
                  {rev.propertyName} · {rev.authorName} ({rev.authorCity})
                </span>
                <span className="font-tabular">
                  {rev.stayDate} · {rev.rating.toFixed(1)}/5 · Demo Review
                </span>
              </div>
              <div className="font-medium text-sm text-foreground">{rev.title}</div>
              <p className="text-sm text-muted-foreground">{rev.comment}</p>

              {rev.managerReply ? (
                <div className="rounded-lg bg-secondary/75 p-3.5 text-xs">
                  <div className="font-semibold text-navy">{rev.managerReply.authorName}</div>
                  <p className="mt-1 text-muted-foreground">{rev.managerReply.text}</p>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <Textarea
                    value={draftReplies[rev.id] ?? ''}
                    onChange={(e) =>
                      setDraftReplies((prev) => ({ ...prev, [rev.id]: e.target.value }))
                    }
                    placeholder="Write a courteous, factual response..."
                    className="min-h-[72px]"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      const text = (draftReplies[rev.id] ?? '').trim();
                      if (text.length < 8) {
                        toast.error('Please write at least 8 characters');
                        return;
                      }
                      replyToReviewPreview(rev.id, text);
                      toast.success('Reply posted');
                    }}
                  >
                    Post Reply
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ManagerRevenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Revenue & Settlements</h1>
        <p className="text-sm text-muted-foreground">
          Gross room revenue, GST collected, and platform commission breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Gross Booking Volume', value: formatINR(93890), note: 'Includes itemized GST' },
          { label: 'Estimated GST Liability', value: formatINR(13590), note: 'Remitted per Indian GST slabs' },
          { label: 'Pending Settlement Payout', value: formatINR(0), note: 'Scheduled bank settlements' },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">{card.label}</div>
              <div className="mt-2 font-tabular text-2xl font-semibold text-navy">{card.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{card.note}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const promoSchema = z.object({
  code: z.string().min(4, 'Code must be 4+ characters').max(16),
  title: z.string().min(4, 'Enter a concise promo title'),
  discountType: z.enum(['percentage', 'flat_inr']),
  discountValue: z.number().min(1),
  minNights: z.number().min(1).max(14),
});

export function ManagerPromotionsPage() {
  const { promotions, addPromotionPreview, togglePromotionPreview } = useAppState();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof promoSchema>>({
    resolver: zodResolver(promoSchema),
    defaultValues: { discountType: 'percentage', discountValue: 10, minNights: 2 },
  });

  const onSubmit = (data: z.infer<typeof promoSchema>) => {
    addPromotionPreview({
      propertyId: 'demo-goa-cabo-verandah',
      code: data.code.toUpperCase(),
      title: data.title,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minNights: data.minNights,
      validFrom: '2026-12-01',
      validUntil: '2027-03-31',
      active: true,
    });
    toast.success(`Promotion ${data.code.toUpperCase()} added`);
    setOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-navy">Promotions</h1>
          <p className="text-sm text-muted-foreground">
            Direct promo codes validated server-side before Razorpay order creation.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Promotion Code (Preview)</DialogTitle>
              <DialogDescription>
                Applies only to your managed properties.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <Label htmlFor="pr-code">Code</Label>
                <Input id="pr-code" placeholder="EARLYGOA" className="uppercase font-tabular" {...register('code')} />
                {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
              </div>
              <div>
                <Label htmlFor="pr-title">Offer Title</Label>
                <Input id="pr-title" placeholder="Early Bird Coastal Saver" {...register('title')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pr-type">Discount Type</Label>
                  <NativeSelect id="pr-type" {...register('discountType')}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat_inr">Flat INR (₹)</option>
                  </NativeSelect>
                </div>
                <div>
                  <Label htmlFor="pr-val">Value</Label>
                  <Input id="pr-val" type="number" className="font-tabular" {...register('discountValue', { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <Label htmlFor="pr-nights">Minimum Nights</Label>
                <Input id="pr-nights" type="number" className="font-tabular" {...register('minNights', { valueAsNumber: true })} />
              </div>
              <Button type="submit" className="w-full">Save Promotion Preview</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Code</DataTableTh>
            <DataTableTh>Offer</DataTableTh>
            <DataTableTh>Discount</DataTableTh>
            <DataTableTh className="text-right">Min Nights</DataTableTh>
            <DataTableTh className="text-right">Active</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {promotions.map((promo) => (
            <DataTableRow key={promo.id}>
              <DataTableTd className="font-tabular font-semibold text-navy">{promo.code}</DataTableTd>
              <DataTableTd>{promo.title}</DataTableTd>
              <DataTableTd className="font-tabular">
                {promo.discountType === 'percentage'
                  ? `${promo.discountValue}%`
                  : formatINR(promo.discountValue)}
              </DataTableTd>
              <DataTableTd className="text-right font-tabular">{promo.minNights}</DataTableTd>
              <DataTableTd className="text-right">
                <Switch
                  checked={promo.active}
                  onCheckedChange={() => togglePromotionPreview(promo.id)}
                />
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function ManagerStaffPage() {
  const { staff } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Property Staff</h1>
        <p className="text-sm text-muted-foreground">
          Role-scoped operational staff assignments across front desk and revenue teams.
        </p>
      </div>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Name</DataTableTh>
            <DataTableTh>Email</DataTableTh>
            <DataTableTh>Department</DataTableTh>
            <DataTableTh>Access Level</DataTableTh>
            <DataTableTh>Status</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {staff.map((s) => (
            <DataTableRow key={s.id}>
              <DataTableTd className="font-medium text-navy">{s.name}</DataTableTd>
              <DataTableTd className="text-xs text-muted-foreground">{s.email}</DataTableTd>
              <DataTableTd className="text-xs">{s.department}</DataTableTd>
              <DataTableTd className="text-xs">{s.accessLevel}</DataTableTd>
              <DataTableTd>
                <StatusText
                  tone={s.status === 'active' ? 'success' : 'warning'}
                  label={s.status === 'active' ? 'Active' : 'Invited'}
                />
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function ManagerAiInsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Manager AI Insights</h1>
        <p className="text-sm text-muted-foreground">
          Grounded summaries of guest reviews, cancellation patterns, and GST slab positioning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              Review Theme Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Guests across your demo properties highlight architectural calm, transparent GST
              billing, and reliable fiber Wi-Fi.
            </p>
            <p className="text-xs text-foreground font-medium">
              Actionable observation: Guests in Jaipur requested earlier winter pool heating.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">GST Slab Competitiveness Note</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Properties priced at or below ₹7,500/night remain in India’s 12% GST slab rather than
            18%. StayAI AI insights only surface advisory observations and never auto-reprice rooms.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ManagerSettingsPage() {
  const [autoReplyNotice, setAutoReplyNotice] = useState(true);
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Manager Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure operational notification preferences and check-in instructions.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">In-app booking & review alerts</div>
              <div className="text-xs text-muted-foreground">Immediate notification for new reservations and cancellations.</div>
            </div>
            <Switch checked={autoReplyNotice} onCheckedChange={setAutoReplyNotice} />
          </div>
          <div className="flex items-center justify-between gap-4 opacity-70">
            <div>
              <div className="text-sm font-medium text-foreground">OTA Channel Sync</div>
              <div className="text-xs text-muted-foreground">Disabled — requires authorized OTA partner credentials.</div>
            </div>
            <Switch checked={false} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
