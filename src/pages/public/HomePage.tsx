import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { HotelCard } from '@/src/components/shared/HotelCard';
import { STAYAI_HERO_IMAGE } from '@/src/services/inventory/DemoInventoryAdapter';
import { useAppState } from '@/src/context/AppStateContext';

const CITIES = [
  { name: 'Goa', note: 'Coastal sanctuaries & Fontainhas' },
  { name: 'Jaipur', note: 'Sandstone havelis & Aravalli foothills' },
  { name: 'Mumbai', note: 'Marine Drive & Pali Hill ateliers' },
  { name: 'Udaipur', note: 'Lake Pichola marble residences' },
  { name: 'Coorg', note: 'Misty Western Ghats coffee estates' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { properties, searchState, setSearchState } = useAppState();
  const [destination, setDestination] = useState(searchState.destination);
  const [checkIn, setCheckIn] = useState(searchState.checkIn);
  const [checkOut, setCheckOut] = useState(searchState.checkOut);
  const [guests, setGuests] = useState(searchState.guests);

  const featuredProperties = properties.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchState((prev) => ({
      ...prev,
      destination,
      checkIn,
      checkOut,
      guests,
    }));
    const params = new URLSearchParams();
    if (destination.trim()) params.set('q', destination.trim());
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div>
      {/* Section 1: Editorial Hero & Search Bar */}
      <section className="relative border-b border-border bg-card">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <p className="text-xs font-medium text-primary">
                India Hospitality · Transparent INR & GST Pricing
              </p>
              <h1 className="mt-3 font-display text-4xl sm:text-5xl font-medium tracking-tight text-navy leading-[1.12]">
                Thoughtful stays across India, priced with complete clarity.
              </h1>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-lg">
                Discover heritage havelis, coastal villas, coffee estates, and quiet
                business suites. Every listing discloses its inventory source,
                verification status, and exact Indian GST breakdown upfront.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to="/explore">
                    Explore Stays
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/ai-discover">
                    <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                    Try AI Discovery
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative h-full min-h-[280px] sm:min-h-[360px] overflow-hidden rounded-2xl border border-border bg-secondary">
                <img
                  src={STAYAI_HERO_IMAGE}
                  alt="Sunlit Indian heritage hotel sandstone courtyard with reflecting pool"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 via-navy/35 to-transparent p-5 text-white">
                  <div className="text-xs text-white/85">
                    Curated Pan-India Collection · Goa · Jaipur · Mumbai · Udaipur · Coorg
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width Search Bar anchored below hero split */}
          <form
            onSubmit={handleSearch}
            className="mt-8 rounded-2xl border border-border bg-background p-4 sm:p-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
              <div className="lg:col-span-4">
                <label
                  htmlFor="hero-destination"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  Destination or property
                </label>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="hero-destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Goa, Jaipur, Mumbai, Udaipur, Coorg..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label
                  htmlFor="hero-checkin"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  Check-in
                </label>
                <div className="relative">
                  <Calendar
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="hero-checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="pl-9 font-tabular"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="hero-checkout"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  Check-out
                </label>
                <Input
                  id="hero-checkout"
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="font-tabular"
                />
              </div>

              <div className="lg:col-span-1">
                <label
                  htmlFor="hero-guests"
                  className="block text-xs font-medium text-muted-foreground mb-1.5"
                >
                  Guests
                </label>
                <div className="relative">
                  <Users
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <NativeSelect
                    id="hero-guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="pl-8 font-tabular"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Search Stays
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Section 2: Featured Pan-India Collection */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-navy">
              Featured Pan-India Stays
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Verified Indian stays spanning Goa, Jaipur, Mumbai, Udaipur, and Coorg with upfront GST tiers.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-sm font-medium text-primary hover:text-teal-deep inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            View all {properties.length} properties
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <HotelCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Section 3: Destination Quick Filter Strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-display text-2xl font-medium text-navy mb-6">
            Explore by Indian Destination
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CITIES.map((city) => (
              <Link
                key={city.name}
                to={`/explore?city=${encodeURIComponent(city.name)}`}
                className="group rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/60 hover:bg-card"
              >
                <div className="font-display text-lg font-medium text-navy group-hover:text-primary transition-colors">
                  {city.name}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {city.note}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Transparency & Architecture Pillars */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <ShieldCheck className="h-5 w-5 text-primary mb-3" aria-hidden="true" />
            <h3 className="text-base font-semibold text-navy">
              Verifiable Inventory Provenance
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Every listing discloses its direct hotel partner source, verification
              status, and latest rate check. StayAI never scrapes sites or treats
              map pins as room availability.
            </p>
          </div>
          <div>
            <Sparkles className="h-5 w-5 text-primary mb-3" aria-hidden="true" />
            <h3 className="text-base font-semibold text-navy">
              Strictly Grounded AI Discovery
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Natural-language recommendations cite only verified backend inventory IDs.
              AI cannot invent prices, fabricate reviews, confirm payments, or mutate room stock.
            </p>
          </div>
          <div>
            <Calendar className="h-5 w-5 text-primary mb-3" aria-hidden="true" />
            <h3 className="text-base font-semibold text-navy">
              Server-Verified Bookings & GST
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Indian hotel GST slabs (12% up to ₹7,500/night, 18% above) are itemized
              before checkout, and live reservations require atomic holds plus
              server-verified payment capture.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
