/**
 * Core domain types aligned with StayAI's 17 Firestore collections:
 * users, properties, rooms, availability, bookings, payments, payment_webhooks,
 * refunds, favorites, recentViews, reviews, notifications, promotions, staff,
 * auditLogs, supportTickets, platformSettings.
 */

export type UserRole = 'public' | 'customer' | 'manager' | 'admin';

export type InventorySource = 'demo' | 'direct' | 'ota_disabled';

export type VerificationStatus =
  | 'demo_unverified'
  | 'pending_review'
  | 'verified'
  | 'suspended';

export type PropertyCategory =
  | 'Heritage Haveli'
  | 'Coastal Resort'
  | 'Urban Luxury'
  | 'Lakefront Palace'
  | 'Plantation Retreat'
  | 'Boutique Hotel';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: Exclude<UserRole, 'public'>;
  city?: string;
  kycVerified: boolean;
  createdAt: string;
  lastActiveAt: string;
  status: 'active' | 'suspended';
  isDemoAccount?: boolean;
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  bedConfig: string;
  maxGuests: number;
  sizeSqFt: number;
  nightlyRateInr: number;
  totalUnits: number;
  availableUnitsPreview: number;
  refundable: boolean;
  breakfastIncluded: boolean;
  amenities: string[];
  imageUrl: string;
  cancellationSummary: string;
}

export interface PropertyPolicies {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  idRequirement: string;
  petPolicy: string;
  smokingPolicy: string;
  childPolicy: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: 'Goa' | 'Jaipur' | 'Mumbai' | 'Udaipur' | 'Coorg';
  state: string;
  locality: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category: PropertyCategory;
  starRating: 3 | 4 | 5;
  guestRating: number;
  reviewCount: number;
  startingRateInr: number;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  amenities: string[];
  coverImage: string;
  gallery: { url: string; caption: string }[];
  rooms: RoomType[];
  policies: PropertyPolicies;
  managerId: string;
  // Provenance & transparency metadata (required across all listings)
  dataSource: InventorySource;
  verificationStatus: VerificationStatus;
  bookable: boolean;
  demoLabel?: string;
  lastCheckedAt: string;
}

export interface AvailabilityDay {
  id: string;
  propertyId: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  totalUnits: number;
  bookedUnits: number;
  heldUnits: number;
  overrideRateInr?: number;
  isBlocked: boolean;
}

export type BookingStatus =
  | 'demo_preview'
  | 'hold_active'
  | 'payment_pending'
  | 'confirmed'
  | 'cancelled'
  | 'expired'
  | 'refund_pending'
  | 'refunded'
  | 'failed_compensation_needed';

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  propertyImage: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomsCount: number;
  baseAmountInr: number;
  gstAmountInr: number;
  gstRatePercent: number;
  totalAmountInr: number;
  status: BookingStatus;
  dataSource: InventorySource;
  isDemo: boolean;
  holdExpiresAt?: string;
  createdAt: string;
  specialRequests?: string;
}

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'captured'
  | 'failed'
  | 'expired'
  | 'partially_refunded'
  | 'refunded';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  bookingReference: string;
  userId: string;
  amountInr: number;
  currency: 'INR';
  method: 'razorpay_order' | 'razorpay_upi_qr' | 'demo_unprocessed';
  mode: 'test' | 'live' | 'demo';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: PaymentStatus;
  verifiedServerSide: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentWebhookEvent {
  id: string;
  providerEventId: string;
  eventType: string;
  signatureVerified: boolean;
  deduplicated: boolean;
  processedAt: string;
  status: 'processed' | 'ignored_duplicate' | 'rejected_invalid_signature';
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  bookingId: string;
  bookingReference: string;
  guestName: string;
  amountInr: number;
  reason: string;
  status: 'requested' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  propertyName: string;
  userId: string;
  authorName: string;
  authorCity: string;
  stayDate: string;
  rating: number;
  title: string;
  comment: string;
  verifiedStay: boolean;
  isDemo: boolean;
  managerReply?: {
    text: string;
    repliedAt: string;
    authorName: string;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  category: 'registration' | 'booking' | 'payment' | 'cancellation' | 'refund' | 'review' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  channel: 'in_app';
}

export interface Promotion {
  id: string;
  propertyId: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'flat_inr';
  discountValue: number;
  minNights: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  redemptions: number;
}

export interface StaffMember {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  department: 'Front Desk' | 'Revenue' | 'Housekeeping' | 'Guest Relations';
  accessLevel: 'View Only' | 'Operations' | 'Property Manager';
  status: 'active' | 'invited';
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorRole: Exclude<UserRole, 'public'> | 'system';
  action: string;
  targetType: 'property' | 'booking' | 'payment' | 'refund' | 'user' | 'settings' | 'webhook';
  targetId: string;
  outcome: 'allowed' | 'denied' | 'recorded';
  timestamp: string;
  details: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  bookingReference?: string;
  category: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_review' | 'resolved';
  createdAt: string;
}

export interface PlatformSettings {
  appMode: 'demo' | 'production';
  defaultCommissionPercent: number;
  luxuryCommissionPercent: number;
  inventoryHoldMinutes: number;
  upiQrEnabled: boolean;
  storageUploadsEnabled: boolean;
  otaAdapterEnabled: boolean;
  googleMapsConfigured: boolean;
  razorpayConfigured: boolean;
  razorpayTestMode: boolean;
  emailProviderConfigured: boolean;
  smsProviderConfigured: boolean;
  marketplacePayoutsApproved: boolean;
}

export interface AiDiscoverResponse {
  responseText: string;
  recommendations: {
    hotelId: string;
    highlight: string;
    fitScoreNote: string;
  }[];
  matchingReasons: string[];
  hotelIds: string[];
  followUpQuestions: string[];
  groundedSource: 'demo_preview_only' | 'gemini_server_verified' | 'server_gemini_catalog';
}
