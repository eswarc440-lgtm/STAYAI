import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ImageOff, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input, Label, NativeSelect, Textarea } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
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
import { formatINR, getIndianHotelGstRate } from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';

export function ManagerOverviewPage() {
  const { properties, bookings, reviews } = useAppState();
  const managerProperties = properties.filter((p) => p.managerId === 'demo-mgr-01');
  const totalRooms = managerProperties.reduce(
    (sum, p) => sum + p.rooms.reduce((rSum, r) => rSum + r.totalUnits, 0),
    0
  );
  const unansweredReviews = reviews.filter(
    (r) =>
      managerProperties.some((p) => p.id === r.propertyId) && !r.managerReply
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy">
            Manager Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Direct inventory summary for your assigned portfolio (managerId: demo-mgr-01).
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/manager/onboarding">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Onboard Property
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Managed Properties', value: String(managerProperties.length), sub: 'Active portfolio' },
          { label: 'Total Room Units', value: String(totalRooms), sub: 'Across active room types' },
          { label: 'Total Bookings', value: String(bookings.length), sub: 'Reservation pipeline' },
          { label: 'Pending Review Replies', value: String(unansweredReviews), sub: 'Guest feedback' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className="mt-2 font-tabular text-2xl font-semibold text-navy">
              {kpi.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Property</DataTableTh>
            <DataTableTh>City</DataTableTh>
            <DataTableTh>Room Types</DataTableTh>
            <DataTableTh>Verification</DataTableTh>
            <DataTableTh className="text-right">Starting Rate</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {managerProperties.map((p) => (
            <DataTableRow key={p.id}>
              <DataTableTd className="font-medium text-navy">{p.name}</DataTableTd>
              <DataTableTd>{p.city}</DataTableTd>
              <DataTableTd className="font-tabular">{p.rooms.length}</DataTableTd>
              <DataTableTd>
                <StatusText
                  tone={p.verificationStatus === 'verified' ? 'success' : 'warning'}
                  label={
                    p.verificationStatus === 'verified'
                      ? 'Verified (Preview)'
                      : 'Demo Unverified'
                  }
                />
              </DataTableTd>
              <DataTableTd className="text-right font-tabular font-medium">
                {formatINR(p.startingRateInr)}
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

const onboardingSchema = z.object({
  name: z.string().min(3, 'Enter property name (min 3 characters)'),
  city: z.string().min(2, 'Enter Indian city'),
  state: z.string().min(2, 'Enter state'),
  locality: z.string().min(3, 'Enter neighborhood or locality'),
  category: z.string().min(2, 'Select property type'),
  gstNumber: z
    .string()
    .regex(/^[0-9A-Z]{15}$/i, 'Enter a valid 15-character Indian GSTIN'),
  description: z.string().min(30, 'Describe your property in at least 30 characters'),
});

export function ManagerOnboardingPage() {
  const { settings } = useAppState();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { category: 'Boutique Hotel' },
  });

  const onSubmit = (data: z.infer<typeof onboardingSchema>) => {
    toast.success('Property submitted for listing review', {
      description: `${data.name} (${data.city}) has been queued for onboarding.`,
    });
    reset();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">
          Property Onboarding & Media Upload
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit a direct hotel property for StayAI Admin verification. Newly onboarded
          properties remain unbookable until verified by an administrator.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Details & Indian GSTIN</CardTitle>
          <CardDescription>
            Required legal and location fields validated before submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="onb-name">Property Name</Label>
              <Input id="onb-name" placeholder="e.g., Malabar Heritage House" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="onb-city">City</Label>
                <Input id="onb-city" placeholder="Kochi" {...register('city')} />
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div>
                <Label htmlFor="onb-state">State</Label>
                <Input id="onb-state" placeholder="Kerala" {...register('state')} />
                {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state.message}</p>}
              </div>
              <div>
                <Label htmlFor="onb-cat">Category</Label>
                <NativeSelect id="onb-cat" {...register('category')}>
                  <option value="Boutique Hotel">Boutique Hotel</option>
                  <option value="Heritage Haveli">Heritage Haveli</option>
                  <option value="Coastal Resort">Coastal Resort</option>
                  <option value="Urban Luxury">Urban Luxury</option>
                  <option value="Plantation Retreat">Plantation Retreat</option>
                </NativeSelect>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="onb-loc">Locality / Landmark</Label>
                <Input id="onb-loc" placeholder="Fort Kochi" {...register('locality')} />
                {errors.locality && <p className="mt-1 text-xs text-destructive">{errors.locality.message}</p>}
              </div>
              <div>
                <Label htmlFor="onb-gst">Property GSTIN (15 characters)</Label>
                <Input id="onb-gst" placeholder="32AABCU9603R1ZM" className="font-tabular uppercase" {...register('gstNumber')} />
                {errors.gstNumber && <p className="mt-1 text-xs text-destructive">{errors.gstNumber.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="onb-desc">Editorial Property Description</Label>
              <Textarea id="onb-desc" placeholder="Architecture, room counts, dining, and local context..." {...register('description')} />
              {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
            </div>

            {/* Feature-flagged Storage Image Upload Section */}
            <div className="rounded-xl border border-dashed border-border bg-secondary/50 p-5">
              <div className="flex items-start gap-3">
                <ImageOff className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-navy">
                    Property Photography Upload —{' '}
                    {settings.storageUploadsEnabled ? 'Enabled' : 'Not configured (Feature-Flagged)'}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Direct photo uploads validate MIME types (JPEG/WebP/PNG), dimensions, and
                    size limits into Firebase Storage once bucket configuration is active.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit">Submit Property for Listing</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const roomSchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(3, 'Enter room type name'),
  bedConfig: z.string().min(3, 'Describe bed configuration'),
  maxGuests: z.number().min(1).max(8),
  sizeSqFt: z.number().min(120).max(5000),
  nightlyRateInr: z.number().min(1000).max(250000),
  totalUnits: z.number().min(1).max(100),
});

export function ManagerRoomsPage() {
  const { properties, addRoomPreview } = useAppState();
  const [open, setOpen] = useState(false);
  const managerProperties = properties.filter((p) => p.managerId === 'demo-mgr-01');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      propertyId: managerProperties[0]?.id ?? '',
      maxGuests: 2,
      sizeSqFt: 450,
      nightlyRateInr: 7200,
      totalUnits: 4,
    },
  });

  const onSubmit = (data: z.infer<typeof roomSchema>) => {
    const parent = properties.find((p) => p.id === data.propertyId);
    addRoomPreview(data.propertyId, {
      name: data.name,
      bedConfig: data.bedConfig,
      maxGuests: data.maxGuests,
      sizeSqFt: data.sizeSqFt,
      nightlyRateInr: data.nightlyRateInr,
      totalUnits: data.totalUnits,
      availableUnitsPreview: data.totalUnits,
      refundable: true,
      breakfastIncluded: true,
      amenities: ['High-Speed Wi-Fi', 'Preview Room'],
      imageUrl: parent?.coverImage ?? '',
      cancellationSummary: 'Free cancellation up to 48 hours before check-in.',
    });
    toast.success('Room type added to inventory', {
      description: `${data.name} (${formatINR(data.nightlyRateInr)}/night) is now active for booking.`,
    });
    setOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-navy">Rooms & Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage room types, max occupancy, and base nightly tariffs.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Room Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Room Type</DialogTitle>
              <DialogDescription>
                Add a new room category and base nightly tariff to your property portfolio.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <Label htmlFor="rm-prop">Property</Label>
                <NativeSelect id="rm-prop" {...register('propertyId')}>
                  {managerProperties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <Label htmlFor="rm-name">Room Name</Label>
                <Input id="rm-name" placeholder="Garden Verandah King" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="rm-bed">Bed Configuration</Label>
                <Input id="rm-bed" placeholder="1 King Bed · Balcony" {...register('bedConfig')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="rm-rate">Nightly Rate (INR)</Label>
                  <Input id="rm-rate" type="number" className="font-tabular" {...register('nightlyRateInr', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="rm-units">Total Units</Label>
                  <Input id="rm-units" type="number" className="font-tabular" {...register('totalUnits', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="rm-guests">Max Guests</Label>
                  <Input id="rm-guests" type="number" className="font-tabular" {...register('maxGuests', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="rm-sqft">Area (sq ft)</Label>
                  <Input id="rm-sqft" type="number" className="font-tabular" {...register('sizeSqFt', { valueAsNumber: true })} />
                </div>
              </div>
              <Button type="submit" className="w-full">Save Room Preview</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Room Type</DataTableTh>
            <DataTableTh>Property</DataTableTh>
            <DataTableTh>Capacity</DataTableTh>
            <DataTableTh className="text-right">Units</DataTableTh>
            <DataTableTh className="text-right">Base Rate</DataTableTh>
            <DataTableTh className="text-right">GST Slab</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {managerProperties.flatMap((prop) =>
            prop.rooms.map((room) => (
              <DataTableRow key={room.id}>
                <DataTableTd>
                  <div className="font-medium text-navy">{room.name}</div>
                  <div className="text-xs text-muted-foreground">{room.bedConfig}</div>
                </DataTableTd>
                <DataTableTd className="text-xs">{prop.name}</DataTableTd>
                <DataTableTd className="font-tabular text-xs">{room.maxGuests} guests</DataTableTd>
                <DataTableTd className="text-right font-tabular">{room.totalUnits}</DataTableTd>
                <DataTableTd className="text-right font-tabular font-medium">
                  {formatINR(room.nightlyRateInr)}
                </DataTableTd>
                <DataTableTd className="text-right font-tabular text-xs text-muted-foreground">
                  {Math.round(getIndianHotelGstRate(room.nightlyRateInr) * 100)}%
                </DataTableTd>
              </DataTableRow>
            ))
          )}
        </tbody>
      </DataTable>
    </div>
  );
}

export function ManagerAvailabilityPage() {
  const { properties, blockedCalendarDates, toggleCalendarDateBlock } = useAppState();
  const managerProperties = properties.filter((p) => p.managerId === 'demo-mgr-01');
  const rooms = managerProperties.flatMap((p) =>
    p.rooms.map((r) => ({ ...r, propertyName: p.name }))
  );

  const days = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    return {
      key: `day-${idx}`,
      label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">
          Availability Calendar
        </h1>
        <p className="text-sm text-muted-foreground">
          Click any room-date cell to toggle Stop-Sell / Open status across your inventory calendar.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-xs">
          <thead className="border-b border-border bg-secondary/70">
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground sticky left-0 bg-secondary/95 min-w-[210px]">
                Room Type
              </th>
              {days.map((d) => (
                <th key={d.key} className="p-2 text-center font-medium text-muted-foreground min-w-[68px]">
                  <div>{d.weekday}</div>
                  <div className="font-tabular text-foreground">{d.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-border/70 last:border-b-0">
                <td className="p-3 sticky left-0 bg-card border-r border-border">
                  <div className="font-medium text-navy">{room.name}</div>
                  <div className="text-[11px] text-muted-foreground">{room.propertyName}</div>
                </td>
                {days.map((d) => {
                  const cellKey = `${room.id}-${d.key}`;
                  const isBlocked = Boolean(blockedCalendarDates[cellKey]);
                  return (
                    <td key={cellKey} className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          toggleCalendarDateBlock(cellKey);
                          toast(isBlocked ? 'Date reopened (preview)' : 'Stop-sell applied (preview)', {
                            description: `${room.name} · ${d.label}`,
                          });
                        }}
                        className={`w-full rounded-md py-2 px-1 font-tabular font-medium transition-colors cursor-pointer ${
                          isBlocked
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-accent/60 text-accent-foreground border border-teal-200/70 hover:bg-accent'
                        }`}
                      >
                        {isBlocked ? 'Blocked' : `${room.availableUnitsPreview}/${room.totalUnits}`}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ManagerPricingPage() {
  const { properties } = useAppState();
  const rooms = properties
    .filter((p) => p.managerId === 'demo-mgr-01')
    .flatMap((p) => p.rooms.map((r) => ({ ...r, propertyName: p.name })));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">
          Pricing & Indian GST Slabs
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor nightly base tariffs against the ₹7,500 Indian hotel GST boundary (12% vs 18%).
        </p>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Room</DataTableTh>
            <DataTableTh className="text-right">Base Tariff</DataTableTh>
            <DataTableTh className="text-right">GST Rate</DataTableTh>
            <DataTableTh className="text-right">Guest Total / Night</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {rooms.map((room) => {
            const gst = getIndianHotelGstRate(room.nightlyRateInr);
            const total = Math.round(room.nightlyRateInr * (1 + gst));
            return (
              <DataTableRow key={room.id}>
                <DataTableTd>
                  <div className="font-medium text-navy">{room.name}</div>
                  <div className="text-xs text-muted-foreground">{room.propertyName}</div>
                </DataTableTd>
                <DataTableTd className="text-right font-tabular">
                  {formatINR(room.nightlyRateInr)}
                </DataTableTd>
                <DataTableTd className="text-right font-tabular">
                  {Math.round(gst * 100)}%
                </DataTableTd>
                <DataTableTd className="text-right font-tabular font-semibold text-navy">
                  {formatINR(total)}
                </DataTableTd>
              </DataTableRow>
            );
          })}
        </tbody>
      </DataTable>
    </div>
  );
}
