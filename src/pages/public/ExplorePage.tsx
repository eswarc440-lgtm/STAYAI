import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, RotateCcw, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/controls';
import { HotelCard } from '@/src/components/shared/HotelCard';
import { PropertyMap } from '@/src/components/shared/PropertyMap';
import {
  EmptyStatePanel,
  ErrorStatePanel,
  LoadingCardGrid,
} from '@/src/components/shared/StatePanels';
import {
  demoInventoryProvider,
} from '@/src/services/inventory/DemoInventoryAdapter';
import type { InventorySearchResult } from '@/src/services/inventory/HotelInventoryProvider';
import type { PropertyCategory } from '@/src/types/domain';
import { formatDateTimeIST, formatINR } from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';

const CITIES = ['All', 'Goa', 'Jaipur', 'Mumbai', 'Udaipur', 'Coorg'] as const;
const CATEGORIES: PropertyCategory[] = [
  'Coastal Resort',
  'Heritage Haveli',
  'Urban Luxury',
  'Lakefront Palace',
  'Plantation Retreat',
  'Boutique Hotel',
];
const AMENITY_OPTIONS = [
  'Sea View',
  'Complimentary Breakfast',
  'High-Speed Wi-Fi',
  'Ayurveda Spa',
  'Heritage Architecture',
  'Business Lounge',
];

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchState, setSearchState } = useAppState();

  const [queryText, setQueryText] = useState(searchParams.get('q') ?? searchState.destination);
  const [city, setCity] = useState(searchParams.get('city') ?? 'All');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? searchState.checkIn);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? searchState.checkOut);
  const [guests, setGuests] = useState(Number(searchParams.get('guests') ?? searchState.guests));
  const [maxPrice, setMaxPrice] = useState(35000);
  const [minRating, setMinRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<PropertyCategory[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [freeCancelOnly, setFreeCancelOnly] = useState(false);
  const [breakfastOnly, setBreakfastOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating_desc'>('recommended');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Interactive UI state preview control & Grid/Map toggle
  const [viewMode, setViewMode] = useState<'live' | 'loading' | 'empty' | 'error'>('live');
  const [displayLayout, setDisplayLayout] = useState<'grid' | 'map'>('grid');
  const [result, setResult] = useState<InventorySearchResult | null>(null);

  useEffect(() => {
    let active = true;
    demoInventoryProvider
      .search({
        query: queryText,
        city,
        checkIn,
        checkOut,
        guests,
        maxPrice,
        minRating,
        categories: selectedCategories,
        amenities: selectedAmenities,
        freeCancellationOnly: freeCancelOnly,
        breakfastOnly,
        sortBy,
        page,
        pageSize: 6,
      })
      .then((res) => {
        if (active) setResult(res);
      });
    return () => {
      active = false;
    };
  }, [
    queryText,
    city,
    checkIn,
    checkOut,
    guests,
    maxPrice,
    minRating,
    selectedCategories,
    selectedAmenities,
    freeCancelOnly,
    breakfastOnly,
    sortBy,
    page,
  ]);

  const toggleCategory = (cat: PropertyCategory) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setPage(1);
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setQueryText('');
    setCity('All');
    setMaxPrice(35000);
    setMinRating(0);
    setSelectedCategories([]);
    setSelectedAmenities([]);
    setFreeCancelOnly(false);
    setBreakfastOnly(false);
    setSortBy('recommended');
    setPage(1);
    setViewMode('live');
    setSearchParams({});
  };

  const handleApplySearchBar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchState((prev) => ({
      ...prev,
      destination: queryText,
      checkIn,
      checkOut,
      guests,
    }));
    const next = new URLSearchParams();
    if (queryText.trim()) next.set('q', queryText.trim());
    if (city !== 'All') next.set('city', city);
    next.set('checkIn', checkIn);
    next.set('checkOut', checkOut);
    next.set('guests', String(guests));
    setSearchParams(next);
  };

  const filterPanelContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-navy">Filters</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset all
        </button>
      </div>

      <div>
        <label htmlFor="filter-city" className="block text-xs font-medium text-foreground mb-1.5">
          City
        </label>
        <NativeSelect
          id="filter-city"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Indian Cities' : c}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-foreground">Max nightly base rate</span>
          <span className="font-tabular font-semibold text-primary">{formatINR(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={35000}
          step={1000}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            setPage(1);
          }}
          aria-label="Maximum nightly price in INR"
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-tabular text-muted-foreground mt-1">
          <span>₹5,000</span>
          <span>₹35,000</span>
        </div>
      </div>

      <div>
        <label htmlFor="filter-rating" className="block text-xs font-medium text-foreground mb-1.5">
          Minimum guest rating
        </label>
        <NativeSelect
          id="filter-rating"
          value={minRating}
          onChange={(e) => {
            setMinRating(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={0}>Any rating</option>
          <option value={4.5}>4.5+ Very Good</option>
          <option value={4.7}>4.7+ Excellent</option>
          <option value={4.9}>4.9+ Exceptional</option>
        </NativeSelect>
      </div>

      <div className="space-y-2.5 pt-2 border-t border-border">
        <div className="text-xs font-medium text-foreground">Booking policies</div>
        <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
          <Checkbox
            checked={freeCancelOnly}
            onCheckedChange={(v) => {
              setFreeCancelOnly(Boolean(v));
              setPage(1);
            }}
          />
          <span>Free cancellation</span>
        </label>
        <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
          <Checkbox
            checked={breakfastOnly}
            onCheckedChange={(v) => {
              setBreakfastOnly(Boolean(v));
              setPage(1);
            }}
          />
          <span>Complimentary breakfast</span>
        </label>
      </div>

      <div className="space-y-2.5 pt-2 border-t border-border">
        <div className="text-xs font-medium text-foreground">Property type</div>
        {CATEGORIES.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer"
          >
            <Checkbox
              checked={selectedCategories.includes(cat)}
              onCheckedChange={() => toggleCategory(cat)}
            />
            <span>{cat}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2.5 pt-2 border-t border-border">
        <div className="text-xs font-medium text-foreground">Key amenities</div>
        {AMENITY_OPTIONS.map((amenity) => (
          <label
            key={amenity}
            className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer"
          >
            <Checkbox
              checked={selectedAmenities.includes(amenity)}
              onCheckedChange={() => toggleAmenity(amenity)}
            />
            <span>{amenity}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-medium text-navy">
          Explore Stays Across India
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare verified room specifications, cancellation terms, and exact GST slabs.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleApplySearchBar}
        className="rounded-xl border border-border bg-card p-4 mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4">
            <label htmlFor="explore-q" className="block text-xs font-medium text-muted-foreground mb-1">
              Search keyword or locality
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="explore-q"
                value={queryText}
                onChange={(e) => {
                  setQueryText(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g., haveli, sea view, Agonda, Pali Hill"
                className="pl-9"
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <label htmlFor="explore-in" className="block text-xs font-medium text-muted-foreground mb-1">
              Check-in
            </label>
            <Input
              id="explore-in"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="font-tabular"
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="explore-out" className="block text-xs font-medium text-muted-foreground mb-1">
              Check-out
            </label>
            <Input
              id="explore-out"
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="font-tabular"
            />
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="explore-guests" className="block text-xs font-medium text-muted-foreground mb-1">
              Guests
            </label>
            <NativeSelect
              id="explore-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="font-tabular"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit" className="w-full">
              Update Search
            </Button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="rounded-xl border border-border bg-card p-5 sticky top-24">
            {filterPanelContent}
          </div>
        </aside>

        {/* Results Column */}
        <div className="lg:col-span-9">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-border">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                Filters
              </Button>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground font-tabular">
                  {viewMode === 'empty' ? 0 : result?.total ?? 0}
                </span>{' '}
                stays found
                {result && (
                  <span className="hidden sm:inline text-xs ml-2">
                    · Checked {formatDateTimeIST(result.checkedAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* UI State Inspector for Phase 1 testing */}
              <div
                className="inline-flex items-center rounded-lg bg-secondary p-0.5 text-xs"
                role="group"
                aria-label="Inspect UI states"
              >
                {(['live', 'loading', 'empty', 'error'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                      viewMode === mode
                        ? 'bg-card text-foreground font-medium shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Grid / Map View Toggle */}
              <div
                className="inline-flex items-center rounded-lg bg-secondary p-0.5 text-xs"
                role="group"
                aria-label="Results layout"
              >
                <button
                  type="button"
                  onClick={() => setDisplayLayout('grid')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    displayLayout === 'grid'
                      ? 'bg-card text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayLayout('map')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    displayLayout === 'map'
                      ? 'bg-card text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Map
                </button>
              </div>

              <NativeSelect
                aria-label="Sort properties"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as typeof sortBy);
                  setPage(1);
                }}
                className="w-44 h-9 text-xs"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Guest Rating: Highest</option>
              </NativeSelect>
            </div>
          </div>

          {mobileFiltersOpen && (
            <div className="lg:hidden rounded-xl border border-border bg-card p-5 mb-6">
              {filterPanelContent}
            </div>
          )}

          {viewMode === 'loading' && <LoadingCardGrid count={6} />}

          {viewMode === 'error' && (
            <ErrorStatePanel
              title="Inventory lookup failed"
              description="Unable to reach inventory right now. Retry safely to load fresh room availability."
              onRetry={() => setViewMode('live')}
            />
          )}

          {(viewMode === 'empty' || (viewMode === 'live' && result && result.items.length === 0)) && (
            <EmptyStatePanel
              title="No stays match your current filters"
              description="Try widening your nightly INR rate cap, clearing an amenity filter, or exploring all five pan-India destinations."
              actionLabel="Clear All Filters"
              onAction={resetFilters}
            />
          )}

          {viewMode === 'live' && result && result.items.length > 0 && (
            <>
              {displayLayout === 'map' ? (
                <div className="space-y-6">
                  <PropertyMap
                    properties={result.items}
                    heightClassName="h-[440px]"
                    zoom={5}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {result.items.map((property) => (
                      <HotelCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {result.items.map((property) => (
                    <HotelCard key={property.id} property={property} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-tabular">
                  Page {result.page} of {result.totalPages} · {result.total} total properties
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= result.totalPages}
                    onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
