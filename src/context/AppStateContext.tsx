import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import type {
  AppNotification,
  AuditLogEntry,
  Booking,
  PaymentRecord,
  PlatformSettings,
  Promotion,
  Property,
  Review,
  RoomType,
  StaffMember,
  SupportTicket,
  UserProfile,
  UserRole,
  VerificationStatus,
} from '@/src/types/domain';
import {
  DEMO_PROPERTIES,
  DEMO_REVIEWS,
} from '@/src/services/inventory/DemoInventoryAdapter';
import {
  DEMO_AUDIT_LOGS,
  DEMO_BOOKINGS,
  DEMO_NOTIFICATIONS,
  DEMO_PAYMENTS,
  DEMO_PROMOTIONS,
  DEMO_REFUNDS,
  DEMO_STAFF,
  DEMO_TICKETS,
  DEMO_USERS,
  DEMO_WEBHOOKS,
  INITIAL_PLATFORM_SETTINGS,
} from '@/src/data/demoWorkspaceData';
import {
  calculateNights,
  calculatePriceBreakdown,
  getDefaultStayDates,
} from '@/src/lib/format';
import { db, formatFirestoreError, OperationType } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { isGoogleMapsConfigured } from '@/src/components/shared/PropertyMap';

export interface SearchState {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface CheckoutDraft {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface ServerHealthStatus {
  checked: boolean;
  geminiConfigured: boolean;
  mapsConfigured: boolean;
  firebaseConfigured: boolean;
  razorpayConfigured: boolean;
  otaEnabled: boolean;
  storageConfigured: boolean;
  emailSmsConfigured: boolean;
}

export interface CreateBookingInput {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  gstin?: string;
  specialRequests?: string;
}

interface AppStateContextValue {
  previewRole: UserRole;
  setPreviewRole: (role: UserRole) => void;
  serverHealth: ServerHealthStatus;

  // Catalog & user discovery state
  properties: Property[];
  reviews: Review[];
  savedIds: string[];
  toggleSaved: (propertyId: string) => void;
  recentViewIds: string[];
  recordRecentView: (propertyId: string) => void;
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  checkoutDraft: CheckoutDraft;
  setCheckoutDraft: React.Dispatch<React.SetStateAction<CheckoutDraft>>;

  // Customer workspace state & booking actions
  bookings: Booking[];
  payments: PaymentRecord[];
  createBooking: (input: CreateBookingInput) => Booking;
  confirmBookingPayment: (bookingId: string, methodLabel?: string) => void;
  cancelBooking: (bookingId: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  submitSupportTicket: (input: {
    category: string;
    subject: string;
    message: string;
  }) => Promise<{ persisted: boolean; ticketId: string }>;

  // Manager workspace actions
  promotions: Promotion[];
  addPromotionPreview: (promo: Omit<Promotion, 'id' | 'redemptions'>) => void;
  togglePromotionPreview: (id: string) => void;
  addRoomPreview: (propertyId: string, room: Omit<RoomType, 'id' | 'propertyId'>) => void;
  replyToReviewPreview: (reviewId: string, replyText: string) => void;
  staff: StaffMember[];
  blockedCalendarDates: Record<string, boolean>;
  toggleCalendarDateBlock: (key: string) => void;

  // Admin workspace state
  users: UserProfile[];
  refunds: typeof DEMO_REFUNDS;
  webhooks: typeof DEMO_WEBHOOKS;
  tickets: SupportTicket[];
  auditLogs: AuditLogEntry[];
  settings: PlatformSettings;
  updateSettingsPreview: (partial: Partial<PlatformSettings>) => void;
  updatePropertyVerificationPreview: (
    propertyId: string,
    status: VerificationStatus
  ) => void;
  updateTicketStatusPreview: (
    ticketId: string,
    status: SupportTicket['status']
  ) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const DEFAULT_SAVED = ['demo-goa-cabo-verandah', 'demo-udaipur-pichola-ghat'];
const DEFAULT_RECENT = [
  'demo-jaipur-surya-haveli',
  'demo-coorg-mist-estate',
  'demo-mumbai-marine-house',
];

const INITIAL_PROPERTIES: Property[] = DEMO_PROPERTIES.map((p) => ({
  ...p,
  bookable: true,
  verificationStatus: 'verified',
  dataSource: 'direct',
  demoLabel: 'Verified Direct Listing',
}));

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStoredJson<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, user, authReady } = useAuth();
  const defaultDates = useMemo(() => getDefaultStayDates(), []);

  const [previewRole, setPreviewRole] = useState<UserRole>('public');
  const [serverHealth, setServerHealth] = useState<ServerHealthStatus>({
    checked: false,
    geminiConfigured: false,
    mapsConfigured: isGoogleMapsConfigured,
    firebaseConfigured: true,
    razorpayConfigured: false,
    otaEnabled: false,
    storageConfigured: false,
    emailSmsConfigured: false,
  });

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    loadStoredJson('stayai_saved_ids_v1', DEFAULT_SAVED)
  );
  const [recentViewIds, setRecentViewIds] = useState<string[]>(() =>
    loadStoredJson('stayai_recent_ids_v1', DEFAULT_RECENT)
  );

  const [searchState, setSearchState] = useState<SearchState>({
    destination: '',
    checkIn: defaultDates.checkIn,
    checkOut: defaultDates.checkOut,
    guests: 2,
    rooms: 1,
  });
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft>({
    propertyId: INITIAL_PROPERTIES[0].id,
    roomId: INITIAL_PROPERTIES[0].rooms[0].id,
    checkIn: defaultDates.checkIn,
    checkOut: defaultDates.checkOut,
    guests: 2,
    rooms: 1,
  });

  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadStoredJson('stayai_bookings_v1', DEMO_BOOKINGS)
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    loadStoredJson('stayai_payments_v1', DEMO_PAYMENTS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStoredJson('stayai_notifications_v1', DEMO_NOTIFICATIONS)
  );
  const [promotions, setPromotions] = useState<Promotion[]>(DEMO_PROMOTIONS);
  const [staff] = useState<StaffMember[]>(DEMO_STAFF);
  const [blockedCalendarDates, setBlockedCalendarDates] = useState<
    Record<string, boolean>
  >({
    'room-goa-ocean-villa-day-4': true,
    'room-jaipur-jharokha-day-7': true,
  });

  const [users] = useState<UserProfile[]>(DEMO_USERS);
  const [tickets, setTickets] = useState<SupportTicket[]>(DEMO_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(DEMO_AUDIT_LOGS);
  const [settings, setSettings] = useState<PlatformSettings>({
    ...INITIAL_PLATFORM_SETTINGS,
    googleMapsConfigured: isGoogleMapsConfigured,
  });

  useEffect(() => {
    saveStoredJson('stayai_bookings_v1', bookings);
  }, [bookings]);

  useEffect(() => {
    saveStoredJson('stayai_payments_v1', payments);
  }, [payments]);

  useEffect(() => {
    saveStoredJson('stayai_notifications_v1', notifications);
  }, [notifications]);

  // Poll server readiness once on mount
  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const mapsReady = Boolean(data.mapsConfigured || isGoogleMapsConfigured);
        setServerHealth({
          checked: true,
          geminiConfigured: Boolean(data.geminiConfigured),
          mapsConfigured: mapsReady,
          firebaseConfigured: Boolean(data.firebaseConfigured),
          razorpayConfigured: Boolean(data.razorpayConfigured),
          otaEnabled: Boolean(data.otaEnabled),
          storageConfigured: Boolean(data.storageConfigured),
          emailSmsConfigured: Boolean(data.emailSmsConfigured),
        });
        setSettings((prev) => ({ ...prev, googleMapsConfigured: mapsReady }));
      })
      .catch(() => {
        if (active) {
          setServerHealth((prev) => ({ ...prev, checked: true }));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Live Firestore sync when authenticated via verified Firebase Auth
  useEffect(() => {
    if (!authReady || !firebaseUser) return;

    const favQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', firebaseUser.uid)
    );
    const unsubFavs = onSnapshot(
      favQuery,
      (snapshot) => {
        const ids = snapshot.docs
          .map((d) => String(d.data().propertyId ?? ''))
          .filter(Boolean);
        setSavedIds(ids);
        saveStoredJson('stayai_saved_ids_v1', ids);
      },
      (error) => {
        console.error(
          'Firestore favorites listener error:',
          JSON.stringify(
            formatFirestoreError(error, OperationType.LIST, 'favorites')
          )
        );
      }
    );

    const recentQuery = query(
      collection(db, 'recentViews'),
      where('userId', '==', firebaseUser.uid)
    );
    const unsubRecent = onSnapshot(
      recentQuery,
      (snapshot) => {
        const docs = snapshot.docs
          .map((d) => ({
            propertyId: String(d.data().propertyId ?? ''),
            ts: d.data().viewedAt?.toMillis?.() ?? 0,
          }))
          .filter((item) => Boolean(item.propertyId))
          .sort((a, b) => b.ts - a.ts)
          .slice(0, 8)
          .map((item) => item.propertyId);
        setRecentViewIds(docs);
        saveStoredJson('stayai_recent_ids_v1', docs);
      },
      (error) => {
        console.error(
          'Firestore recentViews listener error:',
          JSON.stringify(
            formatFirestoreError(error, OperationType.LIST, 'recentViews')
          )
        );
      }
    );

    return () => {
      unsubFavs();
      unsubRecent();
    };
  }, [authReady, firebaseUser]);

  const toggleSaved = (propertyId: string) => {
    const currentlySaved = savedIds.includes(propertyId);
    setSavedIds((prev) => {
      const next = currentlySaved
        ? prev.filter((id) => id !== propertyId)
        : [propertyId, ...prev];
      saveStoredJson('stayai_saved_ids_v1', next);
      return next;
    });

    if (!firebaseUser || !firebaseUser.emailVerified) return;

    const favDocId = `${firebaseUser.uid}_${propertyId}`;
    const favPath = `favorites/${favDocId}`;
    const property = properties.find((p) => p.id === propertyId);

    if (currentlySaved) {
      deleteDoc(doc(db, 'favorites', favDocId)).catch((error) => {
        console.error(
          'Firestore favorite delete error:',
          JSON.stringify(
            formatFirestoreError(error, OperationType.DELETE, favPath)
          )
        );
      });
    } else {
      setDoc(doc(db, 'favorites', favDocId), {
        userId: firebaseUser.uid,
        propertyId,
        propertyName: property?.name ?? propertyId,
        createdAt: serverTimestamp(),
      }).catch((error) => {
        console.error(
          'Firestore favorite create error:',
          JSON.stringify(
            formatFirestoreError(error, OperationType.CREATE, favPath)
          )
        );
      });
    }
  };

  const recordRecentView = (propertyId: string) => {
    setRecentViewIds((prev) => {
      const next = [propertyId, ...prev.filter((id) => id !== propertyId)].slice(
        0,
        8
      );
      saveStoredJson('stayai_recent_ids_v1', next);
      return next;
    });

    if (!firebaseUser || !firebaseUser.emailVerified) return;

    const viewDocId = `${firebaseUser.uid}_${propertyId}`;
    const viewPath = `recentViews/${viewDocId}`;
    setDoc(doc(db, 'recentViews', viewDocId), {
      userId: firebaseUser.uid,
      propertyId,
      viewedAt: serverTimestamp(),
    }).catch((error) => {
      console.error(
        'Firestore recentView write error:',
        JSON.stringify(formatFirestoreError(error, OperationType.WRITE, viewPath))
      );
    });
  };

  const createBooking = (input: CreateBookingInput): Booking => {
    const property =
      properties.find((p) => p.id === input.propertyId) ?? properties[0];
    const room =
      property.rooms.find((r) => r.id === input.roomId) ?? property.rooms[0];
    const nights = calculateNights(input.checkIn, input.checkOut);
    const breakdown = calculatePriceBreakdown(
      room.nightlyRateInr,
      nights,
      input.rooms
    );
    const id = `bk-${Date.now()}`;
    const ref = `STAI-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const nowIso = new Date().toISOString();

    const newBooking: Booking = {
      id,
      bookingReference: ref,
      userId: user?.uid ?? 'guest-user',
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      propertyId: property.id,
      propertyName: property.name,
      propertyCity: property.city,
      propertyImage: property.coverImage,
      roomId: room.id,
      roomName: room.name,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      guests: input.guests,
      roomsCount: input.rooms,
      baseAmountInr: breakdown.baseSubtotal,
      gstAmountInr: breakdown.gstAmount,
      gstRatePercent: Math.round(breakdown.gstRate * 100),
      totalAmountInr: breakdown.grandTotal,
      status: 'hold_active',
      dataSource: property.dataSource,
      isDemo: false,
      holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: nowIso,
      specialRequests: input.specialRequests,
    };

    setBookings((prev) => [newBooking, ...prev]);
    setNotifications((prev) => [
      {
        id: `ntf-${Date.now()}`,
        userId: newBooking.userId,
        category: 'booking',
        title: `Reservation hold created (${ref})`,
        message: `${property.name} · ${room.name} held for ${nights} nights. Complete payment to confirm.`,
        createdAt: nowIso,
        read: false,
        channel: 'in_app',
      },
      ...prev,
    ]);
    return newBooking;
  };

  const confirmBookingPayment = (bookingId: string, methodLabel = 'Razorpay Checkout') => {
    const nowIso = new Date().toISOString();
    const target = bookings.find((b) => b.id === bookingId);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'confirmed' }
          : b
      )
    );

    if (target) {
      const paymentMethod: PaymentRecord['method'] = methodLabel
        .toLowerCase()
        .includes('upi')
        ? 'razorpay_upi_qr'
        : 'razorpay_order';

      const paymentRecord: PaymentRecord = {
        id: `pay-${Date.now()}`,
        bookingId: target.id,
        bookingReference: target.bookingReference,
        userId: target.userId,
        amountInr: target.totalAmountInr,
        currency: 'INR',
        method: paymentMethod,
        mode: 'test',
        razorpayOrderId: `order_${Date.now().toString(36)}`,
        razorpayPaymentId: `pay_${Date.now().toString(36)}`,
        status: 'captured',
        verifiedServerSide: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setPayments((prev) => [paymentRecord, ...prev]);
      setNotifications((prev) => [
        {
          id: `ntf-${Date.now() + 1}`,
          userId: target.userId,
          category: 'payment',
          title: `Booking confirmed (${target.bookingReference})`,
          message: `Payment of ₹${target.totalAmountInr.toLocaleString('en-IN')} completed via ${methodLabel} for ${target.propertyName}.`,
          createdAt: nowIso,
          read: false,
          channel: 'in_app',
        },
        ...prev,
      ]);
    }
  };

  const cancelBooking = (bookingId: string) => {
    const nowIso = new Date().toISOString();
    const target = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'cancelled' }
          : b
      )
    );
    setPayments((prev) =>
      prev.map((p) =>
        p.bookingId === bookingId && p.status === 'captured'
          ? { ...p, status: 'refunded', updatedAt: nowIso }
          : p
      )
    );
    if (target) {
      setNotifications((prev) => [
        {
          id: `ntf-${Date.now()}`,
          userId: target.userId,
          category: 'cancellation',
          title: `Reservation cancelled (${target.bookingReference})`,
          message: `${target.propertyName} booking was cancelled and refund processing initiated.`,
          createdAt: nowIso,
          read: false,
          channel: 'in_app',
        },
        ...prev,
      ]);
    }
  };

  const submitSupportTicket = async (input: {
    category: string;
    subject: string;
    message: string;
  }): Promise<{ persisted: boolean; ticketId: string }> => {
    const ticketId = `tkt_${Date.now()}`;
    const localTicket: SupportTicket = {
      id: ticketId,
      userId: user?.uid ?? 'guest-user',
      userName: user?.displayName ?? 'StayAI User',
      category: input.category,
      subject: input.subject,
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => [localTicket, ...prev]);

    if (!firebaseUser || !firebaseUser.emailVerified) {
      return { persisted: false, ticketId };
    }

    const path = `supportTickets/${ticketId}`;
    try {
      await setDoc(doc(db, 'supportTickets', ticketId), {
        userId: firebaseUser.uid,
        category: input.category.trim().slice(0, 60),
        subject: input.subject.trim().slice(0, 160),
        message: input.message.trim().slice(0, 2000),
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { persisted: true, ticketId };
    } catch (error) {
      console.error(
        'Firestore supportTicket create error:',
        JSON.stringify(formatFirestoreError(error, OperationType.CREATE, path))
      );
      return { persisted: false, ticketId };
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addPromotionPreview = (promo: Omit<Promotion, 'id' | 'redemptions'>) => {
    setPromotions((prev) => [
      { ...promo, id: `promo-${Date.now()}`, redemptions: 0 },
      ...prev,
    ]);
  };

  const togglePromotionPreview = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const addRoomPreview = (
    propertyId: string,
    room: Omit<RoomType, 'id' | 'propertyId'>
  ) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              rooms: [
                ...p.rooms,
                { ...room, id: `room-${Date.now()}`, propertyId },
              ],
            }
          : p
      )
    );
  };

  const replyToReviewPreview = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              managerReply: {
                text: replyText,
                repliedAt: new Date().toISOString(),
                authorName: user?.displayName
                  ? `${user.displayName} · Manager`
                  : 'Property Manager',
              },
            }
          : r
      )
    );
  };

  const toggleCalendarDateBlock = (key: string) => {
    setBlockedCalendarDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSettingsPreview = (partial: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUid: user?.uid ?? 'admin-01',
        actorRole: 'admin',
        action: 'SETTINGS_UPDATED',
        targetType: 'settings',
        targetId: 'platformSettings',
        outcome: 'recorded',
        timestamp: new Date().toISOString(),
        details: `Updated settings (${Object.keys(partial).join(', ')}).`,
      },
      ...prev,
    ]);
  };

  const updatePropertyVerificationPreview = (
    propertyId: string,
    status: VerificationStatus
  ) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId ? { ...p, verificationStatus: status } : p
      )
    );
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorUid: user?.uid ?? 'admin-01',
        actorRole: 'admin',
        action: 'PROPERTY_VERIFICATION_UPDATED',
        targetType: 'property',
        targetId: propertyId,
        outcome: 'recorded',
        timestamp: new Date().toISOString(),
        details: `Property verification status set to "${status}".`,
      },
      ...prev,
    ]);
  };

  const updateTicketStatusPreview = (
    ticketId: string,
    status: SupportTicket['status']
  ) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  return (
    <AppStateContext.Provider
      value={{
        previewRole,
        setPreviewRole,
        serverHealth,
        properties,
        reviews,
        savedIds,
        toggleSaved,
        recentViewIds,
        recordRecentView,
        searchState,
        setSearchState,
        checkoutDraft,
        setCheckoutDraft,
        bookings,
        payments,
        createBooking,
        confirmBookingPayment,
        cancelBooking,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        submitSupportTicket,
        promotions,
        addPromotionPreview,
        togglePromotionPreview,
        addRoomPreview,
        replyToReviewPreview,
        staff,
        blockedCalendarDates,
        toggleCalendarDateBlock,
        users,
        refunds: DEMO_REFUNDS,
        webhooks: DEMO_WEBHOOKS,
        tickets,
        auditLogs,
        settings,
        updateSettingsPreview,
        updatePropertyVerificationPreview,
        updateTicketStatusPreview,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
