import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Property } from '@/src/types/domain';
import { formatINR, getIndianHotelGstRate } from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';
import { HotelImage } from './HotelImage';

export function HotelCard({ property }: { property: Property }) {
  const { savedIds, toggleSaved } = useAppState();
  const isSaved = savedIds.includes(property.id);
  const gstPercent = Math.round(
    getIndianHotelGstRate(property.startingRateInr) * 100
  );

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(property.id);
    toast(isSaved ? 'Removed from saved stays' : 'Saved to your shortlist', {
      description: property.name,
    });
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <Link to={`/hotels/${property.id}`} className="block">
          <HotelImage
            src={property.coverImage}
            alt={`${property.name} in ${property.city}`}
            fallbackTitle={property.name}
            aspectClassName="aspect-[4/3]"
            className="group-hover:[&_img]:scale-[1.03]"
          />
        </Link>
        <button
          type="button"
          onClick={handleToggleSave}
          aria-label={isSaved ? `Remove ${property.name} from saved` : `Save ${property.name}`}
          aria-pressed={isSaved}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/92 text-foreground shadow-xs transition-colors hover:bg-card cursor-pointer"
        >
          <Heart
            className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : 'text-navy'}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <span>{property.city}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{property.category}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 font-tabular text-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
            <span>{property.guestRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({property.reviewCount})</span>
          </div>
        </div>

        <Link
          to={`/hotels/${property.id}`}
          className="mt-2 font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1"
        >
          {property.name}
        </Link>

        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-1">
          {property.tagline}
        </p>

        <div className="mt-3 text-xs text-primary font-medium">
          Verified Direct Inventory · Instant Booking
        </div>

        <div className="mt-4 pt-3.5 border-t border-border flex items-end justify-between gap-3">
          <div>
            <div className="font-tabular text-base font-semibold text-foreground">
              {formatINR(property.startingRateInr)}
              <span className="text-xs font-normal text-muted-foreground"> / night</span>
            </div>
            <div className="text-xs text-muted-foreground">
              +{gstPercent}% GST · {property.freeCancellation ? 'Free cancellation' : 'Flexible options'}
            </div>
          </div>
          <Link
            to={`/hotels/${property.id}`}
            className="text-xs font-medium text-primary hover:text-teal-deep whitespace-nowrap shrink-0 underline-offset-4 hover:underline"
          >
            View stay
          </Link>
        </div>
      </div>
    </article>
  );
}
