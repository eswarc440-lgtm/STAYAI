import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Heart,
  MapPin,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Separator } from '@/src/components/ui/card';
import { HotelImage } from '@/src/components/shared/HotelImage';
import { HotelCard } from '@/src/components/shared/HotelCard';
import { PropertyMap } from '@/src/components/shared/PropertyMap';
import {
  DataProvenanceStrip,
  EmptyStatePanel,
} from '@/src/components/shared/StatePanels';
import {
  calculateNights,
  calculatePriceBreakdown,
  formatINR,
} from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    properties,
    reviews,
    savedIds,
    toggleSaved,
    recordRecentView,
    searchState,
    setCheckoutDraft,
  } = useAppState();

  const property = useMemo(
    () => properties.find((p) => p.id === id || p.slug === id),
    [properties, id]
  );

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(
    property?.rooms[0]?.id ?? ''
  );
  const [checkIn, setCheckIn] = useState(searchState.checkIn);
  const [checkOut, setCheckOut] = useState(searchState.checkOut);
  const [guests, setGuests] = useState(searchState.guests);
  const [roomsCount, setRoomsCount] = useState(1);

  useEffect(() => {
    if (property) {
      recordRecentView(property.id);
      setSelectedRoomId(property.rooms[0]?.id ?? '');
      setActivePhotoIndex(0);
    }
  }, [property?.id]);

  if (!property) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16">
        <EmptyStatePanel
          title="Property not found"
          description="This hotel ID does not exist in the current StayAI catalog. Only verified backend or demo catalog IDs are rendered."
          actionLabel="Back to Explore"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const selectedRoom =
    property.rooms.find((r) => r.id === selectedRoomId) ?? property.rooms[0];
  const nights = calculateNights(checkIn, checkOut);
  const breakdown = calculatePriceBreakdown(
    selectedRoom.nightlyRateInr,
    nights,
    roomsCount
  );
  const propertyReviews = reviews.filter((r) => r.propertyId === property.id);
  const similarHotels = properties
    .filter((p) => p.id !== property.id && (p.city === property.city || p.category === property.category))
    .slice(0, 3);
  const isSaved = savedIds.includes(property.id);

  const handleProceedToCheckoutPreview = () => {
    setCheckoutDraft({
      propertyId: property.id,
      roomId: selectedRoom.id,
      checkIn,
      checkOut,
      guests,
      rooms: roomsCount,
    });
    navigate('/checkout');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Explore
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            toggleSaved(property.id);
            toast(isSaved ? 'Removed from saved stays' : 'Saved to shortlist');
          }}
        >
          <Heart
            className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`}
            aria-hidden="true"
          />
          {isSaved ? 'Saved' : 'Save Stay'}
        </Button>
      </div>

      {/* Header & Provenance */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{property.city}, {property.state}</span>
          <span aria-hidden="true">·</span>
          <span>{property.category}</span>
          <span aria-hidden="true">·</span>
          <span>{property.starRating}-Star Category</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 text-foreground font-tabular font-medium">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
            {property.guestRating.toFixed(1)} ({property.reviewCount} reviews)
          </span>
        </div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-navy">
          {property.name}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {property.address}
        </p>
      </div>

      <DataProvenanceStrip property={property} />

      {/* Gallery */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-9">
          <HotelImage
            src={property.gallery[activePhotoIndex]?.url ?? property.coverImage}
            alt={property.gallery[activePhotoIndex]?.caption ?? property.name}
            fallbackTitle={property.name}
            aspectClassName="aspect-[16/10]"
            className="rounded-xl border border-border"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {property.gallery[activePhotoIndex]?.caption}
          </p>
        </div>
        <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto">
          {property.gallery.map((photo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhotoIndex(idx)}
              className={`shrink-0 w-32 lg:w-full overflow-hidden rounded-lg border text-left transition-all cursor-pointer ${
                activePhotoIndex === idx
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border opacity-80 hover:opacity-100'
              }`}
            >
              <HotelImage
                src={photo.url}
                alt={photo.caption}
                fallbackTitle={property.name}
                aspectClassName="aspect-[4/3]"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content + Contiguous Sticky Booking Module */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-10">
          {/* Overview */}
          <section>
            <h2 className="font-display text-2xl font-medium text-navy">
              About this stay
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {property.description}
            </p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Room Selection */}
          <section>
            <h2 className="font-display text-2xl font-medium text-navy">
              Select a Room Type
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Rates exclude GST until itemized in the booking summary.
            </p>
            <div className="mt-5 space-y-4">
              {property.rooms.map((room) => {
                const isSelected = room.id === selectedRoom.id;
                return (
                  <div
                    key={room.id}
                    className={`rounded-xl border p-5 transition-colors ${
                      isSelected
                        ? 'border-primary bg-card'
                        : 'border-border bg-card/70 hover:bg-card'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-navy">
                          {room.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {room.bedConfig} · Up to {room.maxGuests} guests ·{' '}
                          <span className="font-tabular">{room.sizeSqFt} sq ft</span>
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {room.cancellationSummary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground">
                          {room.amenities.map((a) => (
                            <span key={a}>· {a}</span>
                          ))}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <div className="font-tabular text-lg font-semibold text-navy">
                          {formatINR(room.nightlyRateInr)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per night + GST
                        </div>
                        <div className="mt-1 text-xs text-primary font-medium">
                          {room.availableUnitsPreview} rooms available
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          className="mt-3 w-full sm:w-auto"
                          onClick={() => setSelectedRoomId(room.id)}
                        >
                          {isSelected ? 'Selected' : 'Select Room'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Interactive Google Maps Platform Section */}
          <section>
            <h2 className="font-display text-2xl font-medium text-navy">
              Location & Map
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              {property.locality} · Coordinates{' '}
              <span className="font-tabular">
                {property.coordinates.lat.toFixed(4)}° N, {property.coordinates.lng.toFixed(4)}° E
              </span>
            </p>
            <PropertyMap
              properties={[property]}
              heightClassName="h-[340px]"
              zoom={13}
            />
          </section>

          <Separator />

          {/* House Policies */}
          <section>
            <h2 className="font-display text-2xl font-medium text-navy">
              Property Policies
            </h2>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <dt className="font-semibold text-navy">Check-in & Check-out</dt>
                <dd className="mt-1 text-muted-foreground">
                  Check-in from {property.policies.checkInTime} · Check-out until {property.policies.checkOutTime}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Cancellation Policy</dt>
                <dd className="mt-1 text-muted-foreground">
                  {property.policies.cancellationPolicy}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">ID Verification</dt>
                <dd className="mt-1 text-muted-foreground">
                  {property.policies.idRequirement}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Pets & Smoking</dt>
                <dd className="mt-1 text-muted-foreground">
                  {property.policies.petPolicy} {property.policies.smokingPolicy}
                </dd>
              </div>
            </dl>
          </section>

          <Separator />

          {/* Reviews */}
          <section>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-medium text-navy">
                Guest Reviews
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                Verified guest reviews
              </span>
            </div>
            {propertyReviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No demo reviews seeded for this specific property yet.
              </p>
            ) : (
              <div className="mt-5 space-y-5">
                {propertyReviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {review.authorName} · {review.authorCity}
                      </span>
                      <span className="font-tabular">
                        {review.stayDate} · Rating {review.rating.toFixed(1)}/5
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-navy">
                      {review.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                    {review.managerReply && (
                      <div className="mt-4 rounded-lg bg-secondary/70 p-3.5 text-xs">
                        <div className="font-semibold text-navy">
                          Response from {review.managerReply.authorName}
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {review.managerReply.text}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Contiguous Sticky Pricing & Booking Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div>
              <div className="text-xs text-muted-foreground">Selected room</div>
              <div className="font-semibold text-navy mt-0.5">{selectedRoom.name}</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-tabular text-2xl font-semibold text-navy">
                  {formatINR(selectedRoom.nightlyRateInr)}
                </span>
                <span className="text-xs text-muted-foreground">/ night + GST</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="detail-in" className="block text-xs font-medium text-muted-foreground mb-1">
                  Check-in
                </label>
                <Input
                  id="detail-in"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="font-tabular text-xs"
                />
              </div>
              <div>
                <label htmlFor="detail-out" className="block text-xs font-medium text-muted-foreground mb-1">
                  Check-out
                </label>
                <Input
                  id="detail-out"
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="font-tabular text-xs"
                />
              </div>
              <div>
                <label htmlFor="detail-guests" className="block text-xs font-medium text-muted-foreground mb-1">
                  Guests
                </label>
                <NativeSelect
                  id="detail-guests"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="font-tabular text-xs"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </NativeSelect>
              </div>
              <div>
                <label htmlFor="detail-rooms" className="block text-xs font-medium text-muted-foreground mb-1">
                  Rooms
                </label>
                <NativeSelect
                  id="detail-rooms"
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="font-tabular text-xs"
                >
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Room' : 'Rooms'}</option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <Separator />

            {/* Transparent INR GST Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {formatINR(breakdown.nightlyBase)} × {breakdown.nights} nights × {breakdown.rooms} room
                </span>
                <span className="font-tabular text-foreground">
                  {formatINR(breakdown.baseSubtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Indian Hotel GST ({Math.round(breakdown.gstRate * 100)}%)
                </span>
                <span className="font-tabular text-foreground">
                  {formatINR(breakdown.gstAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">StayAI convenience fee</span>
                <span className="font-tabular text-emerald-800">₹0</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-navy text-base">
                <span>Total Payable (INR)</span>
                <span className="font-tabular">{formatINR(breakdown.grandTotal)}</span>
              </div>
            </div>

            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={handleProceedToCheckoutPreview}
            >
              Reserve Stay
            </Button>
            <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Transparent INR pricing with GST itemized upfront.
            </p>
          </div>
        </aside>
      </div>

      {/* Similar Hotels */}
      {similarHotels.length > 0 && (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="font-display text-2xl font-medium text-navy mb-6">
            Similar Stays to Compare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarHotels.map((item) => (
              <HotelCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
