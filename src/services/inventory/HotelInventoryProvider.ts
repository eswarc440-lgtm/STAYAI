import type {
  AvailabilityDay,
  Booking,
  InventorySource,
  Property,
  PropertyCategory,
} from '@/src/types/domain';
import type { PriceBreakdown } from '@/src/lib/format';

export interface InventorySearchQuery {
  query?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  categories?: PropertyCategory[];
  amenities?: string[];
  freeCancellationOnly?: boolean;
  breakfastOnly?: boolean;
  sortBy?: 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc';
  page?: number;
  pageSize?: number;
}

export interface InventorySearchResult {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  providerSource: InventorySource;
  checkedAt: string;
}

export interface RateQuote {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  breakdown: PriceBreakdown;
  bookable: boolean;
  reasonIfUnavailable?: string;
  source: InventorySource;
  checkedAt: string;
}

export interface BookingCreateRequest {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}

export interface BookingActionResult {
  allowed: boolean;
  booking?: Booking;
  message: string;
  code: 'OK' | 'DEMO_NOT_BOOKABLE' | 'PROVIDER_DISABLED' | 'UNAVAILABLE';
}

/**
 * Core inventory contract implemented by Demo, Direct (Phase 4 Firestore),
 * and OTA (disabled without authorized credentials) adapters.
 */
export interface HotelInventoryProvider {
  readonly providerId: string;
  readonly source: InventorySource;
  readonly isEnabled: boolean;
  readonly statusMessage: string;

  search(query: InventorySearchQuery): Promise<InventorySearchResult>;
  details(propertyId: string): Promise<Property | null>;
  availability(
    propertyId: string,
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<AvailabilityDay[]>;
  rates(
    propertyId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    rooms: number
  ): Promise<RateQuote | null>;
  preview(request: BookingCreateRequest): Promise<RateQuote | null>;
  book(request: BookingCreateRequest): Promise<BookingActionResult>;
  retrieve(bookingId: string): Promise<Booking | null>;
  cancel(bookingId: string, reason: string): Promise<BookingActionResult>;
}

/**
 * OTA Adapter stays strictly disabled without authorized partner credentials.
 * Never scrapes third-party websites or uses Google Maps listings as availability proof.
 */
export class DisabledOtaInventoryAdapter implements HotelInventoryProvider {
  readonly providerId = 'ota-partner-adapter';
  readonly source: InventorySource = 'ota_disabled';
  readonly isEnabled = false;
  readonly statusMessage =
    'Not configured — OTA partner inventory stays disabled without authorized API credentials.';

  async search(query: InventorySearchQuery): Promise<InventorySearchResult> {
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 6,
      totalPages: 0,
      providerSource: 'ota_disabled',
      checkedAt: new Date().toISOString(),
    };
  }

  async details(): Promise<Property | null> {
    return null;
  }

  async availability(): Promise<AvailabilityDay[]> {
    return [];
  }

  async rates(): Promise<RateQuote | null> {
    return null;
  }

  async preview(): Promise<RateQuote | null> {
    return null;
  }

  async book(): Promise<BookingActionResult> {
    return {
      allowed: false,
      code: 'PROVIDER_DISABLED',
      message: this.statusMessage,
    };
  }

  async retrieve(): Promise<Booking | null> {
    return null;
  }

  async cancel(): Promise<BookingActionResult> {
    return {
      allowed: false,
      code: 'PROVIDER_DISABLED',
      message: this.statusMessage,
    };
  }
}

/**
 * Direct Hotel Adapter placeholder for Phase 4 Firestore integration.
 */
export class DirectInventoryAdapterStub implements HotelInventoryProvider {
  readonly providerId = 'direct-firestore-adapter';
  readonly source: InventorySource = 'direct';
  readonly isEnabled = false;
  readonly statusMessage =
    'Direct hotel Firestore inventory activates in Phase 4 after Firebase setup (Phase 2) and Manager Onboarding (Phase 3).';

  async search(query: InventorySearchQuery): Promise<InventorySearchResult> {
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 6,
      totalPages: 0,
      providerSource: 'direct',
      checkedAt: new Date().toISOString(),
    };
  }

  async details(): Promise<Property | null> {
    return null;
  }
  async availability(): Promise<AvailabilityDay[]> {
    return [];
  }
  async rates(): Promise<RateQuote | null> {
    return null;
  }
  async preview(): Promise<RateQuote | null> {
    return null;
  }
  async book(): Promise<BookingActionResult> {
    return {
      allowed: false,
      code: 'PROVIDER_DISABLED',
      message: this.statusMessage,
    };
  }
  async retrieve(): Promise<Booking | null> {
    return null;
  }
  async cancel(): Promise<BookingActionResult> {
    return {
      allowed: false,
      code: 'PROVIDER_DISABLED',
      message: this.statusMessage,
    };
  }
}
