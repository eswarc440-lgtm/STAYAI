import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock,
  Printer,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input, Label, Textarea } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, Separator } from '@/src/components/ui/card';
import { StatusText } from '@/src/components/shared/StatePanels';
import {
  calculateNights,
  calculatePriceBreakdown,
  formatINR,
  formatShortDate,
} from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';
import { useAuth } from '@/src/context/AuthContext';

const checkoutSchema = z.object({
  guestName: z.string().min(2, 'Enter primary guest full name as on Government ID'),
  guestEmail: z.string().email('Enter a valid email for receipt delivery'),
  guestPhone: z.string().min(6, 'Enter a valid mobile number'),
  gstin: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[0-9A-Z]{15}$/.test(v.toUpperCase()),
      'GSTIN must be 15 alphanumeric characters (or leave blank)'
    ),
  specialRequests: z.string().max(300, 'Keep requests under 300 characters').optional(),
});

export function CheckoutPage() {
  const navigate = useNavigate();
  const { properties, checkoutDraft, createBooking } = useAppState();
  const { user } = useAuth();

  const property =
    properties.find((p) => p.id === checkoutDraft.propertyId) ?? properties[0];
  const room =
    property.rooms.find((r) => r.id === checkoutDraft.roomId) ?? property.rooms[0];
  const nights = calculateNights(checkoutDraft.checkIn, checkoutDraft.checkOut);
  const breakdown = calculatePriceBreakdown(
    room.nightlyRateInr,
    nights,
    checkoutDraft.rooms
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      guestName: user?.displayName || 'Ananya Deshmukh',
      guestEmail: user?.email || 'guest@stayai.in',
      guestPhone: user?.phone || '+91 98450 11223',
      gstin: '',
      specialRequests: '',
    },
  });

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    const created = createBooking({
      propertyId: property.id,
      roomId: room.id,
      checkIn: checkoutDraft.checkIn,
      checkOut: checkoutDraft.checkOut,
      guests: checkoutDraft.guests,
      rooms: checkoutDraft.rooms,
      guestName: values.guestName,
      guestEmail: values.guestEmail,
      guestPhone: values.guestPhone,
      gstin: values.gstin,
      specialRequests: values.specialRequests,
    });
    toast.success(`Reservation hold created (${created.bookingReference})`);
    navigate(`/payment/${created.id}`);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to={`/hotels/${property.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to {property.name}
      </Link>

      <h1 className="font-display text-3xl font-medium text-navy">
        Checkout
      </h1>
      <p className="mt-1 mb-7 text-sm text-muted-foreground">
        Review guest details, cancellation rules, and Indian GST totals before payment.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-7 space-y-6"
          noValidate
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primary Guest Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chk-name">Full name (as on Government ID)</Label>
                <Input id="chk-name" {...register('guestName')} />
                {errors.guestName && (
                  <p className="mt-1 text-xs text-destructive">{errors.guestName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chk-email">Email address</Label>
                  <Input id="chk-email" type="email" {...register('guestEmail')} />
                  {errors.guestEmail && (
                    <p className="mt-1 text-xs text-destructive">{errors.guestEmail.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="chk-phone">Mobile number</Label>
                  <Input id="chk-phone" type="tel" {...register('guestPhone')} />
                  {errors.guestPhone && (
                    <p className="mt-1 text-xs text-destructive">{errors.guestPhone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="chk-gstin">Business GSTIN (optional, for B2B GST invoice)</Label>
                <Input
                  id="chk-gstin"
                  placeholder="27AABCU9603R1ZM"
                  className="font-tabular uppercase"
                  {...register('gstin')}
                />
                {errors.gstin && (
                  <p className="mt-1 text-xs text-destructive">{errors.gstin.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="chk-req">Special requests (optional)</Label>
                <Textarea
                  id="chk-req"
                  placeholder="Airport pickup inquiry, dietary notes, upper floor preference..."
                  {...register('specialRequests')}
                />
                {errors.specialRequests && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.specialRequests.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory Hold & Confirmation Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Your selected room is held for 15 minutes while payment is completed, preventing
                  double bookings during checkout.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  StayAI never collects or stores raw card numbers, CVVs, or UPI PINs inside its
                  forms.
                </span>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Continue to Payment
          </Button>
        </form>

        {/* Sticky Order Summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <div className="text-xs font-medium text-primary">
                Verified Direct Inventory
              </div>
              <CardTitle className="font-display text-xl font-medium mt-1">
                {property.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {property.locality} · {room.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-secondary/70 p-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Check-in</div>
                  <div className="font-semibold text-foreground font-tabular mt-0.5">
                    {formatShortDate(checkoutDraft.checkIn)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Check-out</div>
                  <div className="font-semibold text-foreground font-tabular mt-0.5">
                    {formatShortDate(checkoutDraft.checkOut)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-semibold text-foreground font-tabular mt-0.5">
                    {nights} nights
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Party</div>
                  <div className="font-semibold text-foreground font-tabular mt-0.5">
                    {checkoutDraft.guests} guests · {checkoutDraft.rooms} room
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room subtotal</span>
                  <span className="font-tabular">{formatINR(breakdown.baseSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Indian Hotel GST ({Math.round(breakdown.gstRate * 100)}%)
                  </span>
                  <span className="font-tabular">{formatINR(breakdown.gstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Convenience fee</span>
                  <span className="font-tabular text-emerald-800">₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base text-navy">
                  <span>Total Payable</span>
                  <span className="font-tabular">{formatINR(breakdown.grandTotal)}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-1">
                Cancellation: {room.cancellationSummary}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { bookings, settings, confirmBookingPayment } = useAppState();
  const booking = bookings.find((b) => b.id === bookingId) ?? bookings[0];

  const handlePay = (method: string) => {
    confirmBookingPayment(booking.id, method);
    toast.success(`Payment verified & booking ${booking.bookingReference} confirmed`);
    navigate(`/booking-confirmation/${booking.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <div>
        <div className="text-xs font-medium text-primary">
          Secure INR Payment Checkout
        </div>
        <h1 className="mt-1 font-display text-3xl font-medium text-navy">
          Complete Payment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reference <span className="font-tabular font-medium text-foreground">{booking.bookingReference}</span> ·{' '}
          {booking.propertyName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
              Razorpay Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Pay{' '}
              <strong className="font-tabular text-foreground">
                {formatINR(booking.totalAmountInr)}
              </strong>{' '}
              (GST inclusive) using UPI, NetBanking, or Card via Razorpay checkout.
            </p>
            <p className="text-xs">
              StayAI never collects card numbers, CVVs, or UPI PINs inside its own forms.
            </p>
            <Button
              type="button"
              className="w-full"
              onClick={() => handlePay('Razorpay Checkout')}
            >
              Pay {formatINR(booking.totalAmountInr)} Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" aria-hidden="true" />
              Single-Use Fixed-Amount UPI QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>UPI QR Status</span>
              <StatusText
                tone={settings.upiQrEnabled ? 'success' : 'neutral'}
                label={settings.upiQrEnabled ? 'Ready' : 'Standard UPI Available'}
              />
            </div>
            <p>
              Instant fixed-amount UPI confirmation tied directly to your 15-minute room hold for{' '}
              <span className="font-tabular text-foreground">{booking.bookingReference}</span>.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handlePay('UPI QR')}
            >
              Pay with UPI QR
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate('/checkout')}>
          Back to Checkout
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/booking-confirmation/${booking.id}`)}
        >
          View Booking Summary
        </Button>
      </div>
    </div>
  );
}

export function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { bookings } = useAppState();
  const booking = bookings.find((b) => b.id === bookingId) ?? bookings[0];
  const isConfirmed = booking.status === 'confirmed';

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center gap-2.5 text-emerald-800 text-sm font-medium">
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>
          {isConfirmed
            ? 'Reservation confirmed — your GST receipt is ready below.'
            : 'Booking receipt summary'}
        </span>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="text-xs text-muted-foreground">StayAI Tax Invoice & Receipt</div>
            <CardTitle className="font-display text-2xl font-medium text-navy mt-1">
              {booking.propertyName}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {booking.propertyCity} · {booking.roomName}
            </p>
          </div>
          <div className="sm:text-right">
            <StatusText
              tone={booking.status === 'cancelled' ? 'danger' : 'success'}
              label={booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
            />
            <div className="font-tabular text-sm font-semibold text-navy mt-1">
              {booking.bookingReference}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Guest Name</div>
              <div className="font-medium text-foreground mt-0.5">{booking.guestName}</div>
              <div className="text-xs text-muted-foreground">{booking.guestEmail}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Stay Dates</div>
              <div className="font-medium font-tabular text-foreground mt-0.5">
                {formatShortDate(booking.checkIn)} → {formatShortDate(booking.checkOut)}
              </div>
              <div className="text-xs text-muted-foreground">
                {booking.nights} nights · {booking.guests} guests
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Inventory Source</div>
              <div className="font-medium text-foreground mt-0.5">Direct Verified Inventory</div>
              <div className="text-xs text-primary">Instant Confirmation</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room Tariff Subtotal</span>
              <span className="font-tabular">{formatINR(booking.baseAmountInr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                CGST + SGST ({booking.gstRatePercent}% Indian Hotel GST)
              </span>
              <span className="font-tabular">{formatINR(booking.gstAmountInr)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base text-navy">
              <span>Total Paid (INR)</span>
              <span className="font-tabular">{formatINR(booking.totalAmountInr)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print Tax Receipt
            </Button>
            <div className="flex items-center gap-2.5">
              <Button asChild variant="outline">
                <Link to="/account/bookings">My Bookings</Link>
              </Button>
              <Button asChild>
                <Link to="/explore">Explore More Stays</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
