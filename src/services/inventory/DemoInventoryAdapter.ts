import type {
  AvailabilityDay,
  Booking,
  Property,
  Review,
} from '@/src/types/domain';
import { calculateNights, calculatePriceBreakdown } from '@/src/lib/format';
import type {
  BookingActionResult,
  BookingCreateRequest,
  HotelInventoryProvider,
  InventorySearchQuery,
  InventorySearchResult,
  RateQuote,
} from './HotelInventoryProvider';

export const STAYAI_HERO_IMAGE =
  '/src/assets/images/hero_india_courtyard_1795616081198.jpg';

const IMG_GOA = '/src/assets/images/hotel_goa_coastal_1795616078781.jpg';
const IMG_JAIPUR = '/src/assets/images/hotel_jaipur_haveli_1795616079883.jpg';
const IMG_MUMBAI = '/src/assets/images/hotel_mumbai_skyline_1795616079406.jpg';
const IMG_UDAIPUR = '/src/assets/images/hotel_udaipur_lake_1795616082217.jpg';
const IMG_COORG = '/src/assets/images/hotel_coorg_estate_1795616086193.jpg';

const LAST_CHECKED_DEMO = '2026-11-25T08:30:00.000Z';

export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'demo-goa-cabo-verandah',
    slug: 'cabo-verandah-south-goa',
    name: 'Cabo Verandah Sanctuary',
    tagline: 'Limewashed laterite villas overlooking the Arabian Sea in quiet South Goa.',
    description:
      'Set above a sheltered palm grove near Agonda, Cabo Verandah pairs slow coastal architecture with shaded teak verandahs, an ocean-facing infinity pool, and seasonal Konkan dining.',
    city: 'Goa',
    state: 'Goa',
    locality: 'Agonda Ridge, South Goa',
    address: 'Plot 14, Agonda Cliff Road, Canacona, South Goa 403702',
    coordinates: { lat: 15.0445, lng: 73.9882 },
    category: 'Coastal Resort',
    starRating: 5,
    guestRating: 4.9,
    reviewCount: 142,
    startingRateInr: 14500,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: [
      'Infinity Pool',
      'Sea View',
      'Complimentary Breakfast',
      'High-Speed Wi-Fi',
      'Ayurveda Spa',
      'Airport Transfer',
    ],
    coverImage: IMG_GOA,
    gallery: [
      { url: IMG_GOA, caption: 'Sea-facing teakwood verandah & infinity pool at sunset' },
      { url: STAYAI_HERO_IMAGE, caption: 'Shaded central stone courtyard' },
      { url: IMG_COORG, caption: 'Private garden pavilion lounge' },
    ],
    rooms: [
      {
        id: 'room-goa-ocean-villa',
        propertyId: 'demo-goa-cabo-verandah',
        name: 'Ocean Cliff Teak Villa',
        bedConfig: '1 King Bed · Private Plunge Deck',
        maxGuests: 2,
        sizeSqFt: 680,
        nightlyRateInr: 14500,
        totalUnits: 6,
        availableUnitsPreview: 2,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['Sea View', 'Private Deck', 'Outdoor Rain Shower', 'Espresso Bar'],
        imageUrl: IMG_GOA,
        cancellationSummary: 'Free cancellation until 72 hours before check-in.',
      },
      {
        id: 'room-goa-palm-suite',
        propertyId: 'demo-goa-cabo-verandah',
        name: 'Two-Bedroom Palm Pavilion',
        bedConfig: '2 King Beds · Living Verandah',
        maxGuests: 4,
        sizeSqFt: 1120,
        nightlyRateInr: 23800,
        totalUnits: 3,
        availableUnitsPreview: 1,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['Panoramic Sea View', 'Private Pool Access', 'Butler Service'],
        imageUrl: IMG_GOA,
        cancellationSummary: 'Free cancellation until 7 days before check-in.',
      },
    ],
    policies: {
      checkInTime: '2:00 PM IST',
      checkOutTime: '11:00 AM IST',
      cancellationPolicy: 'Full refund up to 72 hours prior to arrival; 1 night charge thereafter.',
      idRequirement: 'Valid Government Photo ID (Aadhaar, Passport, Driving Licence) mandatory for all guests.',
      petPolicy: 'Small pets permitted in ground-level garden villas with prior notice.',
      smokingPolicy: 'Strictly non-smoking indoors; designated outdoor garden terrace available.',
      childPolicy: 'Children under 6 stay complimentary using existing bedding.',
    },
    managerId: 'demo-mgr-01',
    dataSource: 'demo',
    verificationStatus: 'demo_unverified',
    bookable: false,
    demoLabel: 'Demo data: not bookable',
    lastCheckedAt: LAST_CHECKED_DEMO,
  },
  {
    id: 'demo-jaipur-surya-haveli',
    slug: 'surya-bagh-haveli-jaipur',
    name: 'Surya Bagh Heritage Haveli',
    tagline: 'Restored 19th-century pink sandstone courtyard residence in Civil Lines.',
    description:
      'Built around three stepped sandstone courtyards, Surya Bagh preserves hand-carved jharokha balconies alongside quiet linen-draped suites, afternoon Rajasthani tea service, and heated plunge pools.',
    city: 'Jaipur',
    state: 'Rajasthan',
    locality: 'Civil Lines, Jaipur',
    address: '22 Jacob Road, Civil Lines, Jaipur, Rajasthan 302006',
    coordinates: { lat: 26.9065, lng: 75.7834 },
    category: 'Heritage Haveli',
    starRating: 5,
    guestRating: 4.8,
    reviewCount: 198,
    startingRateInr: 11200,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: [
      'Courtyard Pool',
      'Heritage Architecture',
      'Complimentary Breakfast',
      'High-Speed Wi-Fi',
      'Fine Dining',
      'Private Parking',
    ],
    coverImage: IMG_JAIPUR,
    gallery: [
      { url: IMG_JAIPUR, caption: 'Carved pink sandstone courtyard & brass lanterns' },
      { url: STAYAI_HERO_IMAGE, caption: 'Morning reflection court & colonnade' },
      { url: IMG_UDAIPUR, caption: 'Evening terrace dining pavilion' },
    ],
    rooms: [
      {
        id: 'room-jaipur-jharokha',
        propertyId: 'demo-jaipur-surya-haveli',
        name: 'Jharokha Courtyard Room',
        bedConfig: '1 King Bed · Carved Window Alcove',
        maxGuests: 2,
        sizeSqFt: 490,
        nightlyRateInr: 11200,
        totalUnits: 10,
        availableUnitsPreview: 3,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['Courtyard View', 'Handwoven Linens', 'Walk-in Marble Bath'],
        imageUrl: IMG_JAIPUR,
        cancellationSummary: 'Free cancellation up to 48 hours before check-in.',
      },
      {
        id: 'room-jaipur-maharaja',
        propertyId: 'demo-jaipur-surya-haveli',
        name: 'Royal Terrace Haveli Suite',
        bedConfig: '1 King Bed + Daybed · Private Terrace',
        maxGuests: 3,
        sizeSqFt: 840,
        nightlyRateInr: 18400,
        totalUnits: 4,
        availableUnitsPreview: 1,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['Private Terrace', 'Soaking Tub', 'Complimentary Heritage Walk'],
        imageUrl: IMG_JAIPUR,
        cancellationSummary: 'Free cancellation up to 72 hours before check-in.',
      },
    ],
    policies: {
      checkInTime: '2:00 PM IST',
      checkOutTime: '11:30 AM IST',
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
      idRequirement: 'Original Passport, Aadhaar, or Voter ID required at check-in.',
      petPolicy: 'Pets are not permitted to preserve heritage furnishings.',
      smokingPolicy: 'Non-smoking rooms and courtyards; terrace lounge permitted.',
      childPolicy: 'All ages welcome; extra cot available at ₹1,800 + GST per night.',
    },
    managerId: 'demo-mgr-01',
    dataSource: 'demo',
    verificationStatus: 'demo_unverified',
    bookable: false,
    demoLabel: 'Demo data: not bookable',
    lastCheckedAt: LAST_CHECKED_DEMO,
  },
  {
    id: 'demo-mumbai-marine-house',
    slug: 'marine-house-south-mumbai',
    name: 'The Marine House Colaba',
    tagline: 'Quiet contemporary sanctuary overlooking the Arabian Sea and Art Deco skyline.',
    description:
      'Designed for discerning business travelers and weekend art patrons, The Marine House offers acoustic calm, warm walnut-clad suites, dedicated fiber workspaces, and quick access to Nariman Point and Kala Ghoda.',
    city: 'Mumbai',
    state: 'Maharashtra',
    locality: 'Marine Drive · South Mumbai',
    address: '84 Netaji Subhash Chandra Road, Marine Drive, Mumbai 400020',
    coordinates: { lat: 18.9438, lng: 72.8231 },
    category: 'Urban Luxury',
    starRating: 5,
    guestRating: 4.7,
    reviewCount: 264,
    startingRateInr: 16800,
    freeCancellation: true,
    breakfastIncluded: false,
    amenities: [
      'Sea View',
      'Business Lounge',
      'High-Speed Wi-Fi',
      'Fitness Studio',
      '24x7 Concierge',
      'Airport Transfer',
    ],
    coverImage: IMG_MUMBAI,
    gallery: [
      { url: IMG_MUMBAI, caption: 'Corner seafront suite overlooking Marine Drive at dusk' },
      { url: STAYAI_HERO_IMAGE, caption: 'Lobby atrium & quiet reading lounge' },
    ],
    rooms: [
      {
        id: 'room-mumbai-bay-king',
        propertyId: 'demo-mumbai-marine-house',
        name: 'Arabian Sea Corner King',
        bedConfig: '1 King Bed · Ergonomic Work Desk',
        maxGuests: 2,
        sizeSqFt: 520,
        nightlyRateInr: 16800,
        totalUnits: 14,
        availableUnitsPreview: 4,
        refundable: true,
        breakfastIncluded: false,
        amenities: ['Sea View', 'Dedicated 300 Mbps Wi-Fi', 'Nespresso Machine', 'Acoustic Glazing'],
        imageUrl: IMG_MUMBAI,
        cancellationSummary: 'Free cancellation up to 24 hours before check-in.',
      },
      {
        id: 'room-mumbai-executive',
        propertyId: 'demo-mumbai-marine-house',
        name: 'Executive Marine Suite',
        bedConfig: '1 King Bed · Separate Meeting Parlor',
        maxGuests: 3,
        sizeSqFt: 910,
        nightlyRateInr: 26500,
        totalUnits: 5,
        availableUnitsPreview: 2,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['Club Breakfast Included', 'Chauffeur Airport Drop', 'Evening Canapes'],
        imageUrl: IMG_MUMBAI,
        cancellationSummary: 'Free cancellation up to 24 hours before check-in.',
      },
    ],
    policies: {
      checkInTime: '3:00 PM IST',
      checkOutTime: '12:00 PM IST',
      cancellationPolicy: 'Free cancellation until 24 hours prior to arrival.',
      idRequirement: 'Government Photo ID mandatory at reception; GST invoice issued on check-out.',
      petPolicy: 'Service animals welcome.',
      smokingPolicy: '100% smoke-free urban property.',
      childPolicy: 'Children up to 8 years stay complimentary with parents.',
    },
    managerId: 'demo-mgr-02',
    dataSource: 'demo',
    verificationStatus: 'demo_unverified',
    bookable: false,
    demoLabel: 'Demo data: not bookable',
    lastCheckedAt: LAST_CHECKED_DEMO,
  },
  {
    id: 'demo-udaipur-pichola-ghat',
    slug: 'pichola-ghat-palace-udaipur',
    name: 'Pichola Ghat Marble Residence',
    tagline: 'Sculpted Makrana marble pavilions directly on the tranquil waters of Lake Pichola.',
    description:
      'Accessible by private wooden shikara across Lake Pichola, this intimate 18-suite residence celebrates Mewar craftsmanship with waterfront breakfast terraces, sunlit domes, and curated sunset cruises.',
    city: 'Udaipur',
    state: 'Rajasthan',
    locality: 'Haridasji Ki Magri, Lake Pichola',
    address: 'Ghat Road, Lake Pichola West Bank, Udaipur, Rajasthan 313001',
    coordinates: { lat: 24.5764, lng: 73.6793 },
    category: 'Lakefront Palace',
    starRating: 5,
    guestRating: 4.9,
    reviewCount: 176,
    startingRateInr: 19500,
    freeCancellation: false,
    breakfastIncluded: true,
    amenities: [
      'Lakefront Dining',
      'Private Boat Jetty',
      'Complimentary Breakfast',
      'Ayurveda Spa',
      'Heritage Architecture',
      'High-Speed Wi-Fi',
    ],
    coverImage: IMG_UDAIPUR,
    gallery: [
      { url: IMG_UDAIPUR, caption: 'Lakeside marble pavilion breakfast overlooking Lake Pichola' },
      { url: IMG_JAIPUR, caption: 'Inner heritage sandstone cloister' },
      { url: STAYAI_HERO_IMAGE, caption: 'Reflecting courtyard at dawn' },
    ],
    rooms: [
      {
        id: 'room-udaipur-lake-veranda',
        propertyId: 'demo-udaipur-pichola-ghat',
        name: 'Lake Pichola Pavilion Room',
        bedConfig: '1 Four-Poster King · Lake Balcony',
        maxGuests: 2,
        sizeSqFt: 610,
        nightlyRateInr: 19500,
        totalUnits: 10,
        availableUnitsPreview: 2,
        refundable: false,
        breakfastIncluded: true,
        amenities: ['Direct Lake View', 'Shikara Transfer Included', 'Makrana Marble Bath'],
        imageUrl: IMG_UDAIPUR,
        cancellationSummary: 'Non-refundable promotional rate; 1 date modification allowed 7 days prior.',
      },
      {
        id: 'room-udaipur-mewar-suite',
        propertyId: 'demo-udaipur-pichola-ghat',
        name: 'Mewar Waterfront Terrace Suite',
        bedConfig: '1 King Bed · Private Dining Jharokha',
        maxGuests: 3,
        sizeSqFt: 1040,
        nightlyRateInr: 31000,
        totalUnits: 4,
        availableUnitsPreview: 1,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['Private Sunset Terrace', 'Personal Butler', 'Complimentary Spa Ritual'],
        imageUrl: IMG_UDAIPUR,
        cancellationSummary: 'Free cancellation up to 7 days prior to arrival.',
      },
    ],
    policies: {
      checkInTime: '2:00 PM IST',
      checkOutTime: '11:00 AM IST',
      cancellationPolicy: 'Varies by selected room rate; flexible suite rates refund fully up to 7 days prior.',
      idRequirement: 'Passport or Government Photo ID required before boarding private jetty boat.',
      petPolicy: 'Pets not permitted.',
      smokingPolicy: 'Permitted only on designated open-air terraces.',
      childPolicy: 'Family-friendly; supervised children required near lakeside steps.',
    },
    managerId: 'demo-mgr-01',
    dataSource: 'demo',
    verificationStatus: 'demo_unverified',
    bookable: false,
    demoLabel: 'Demo data: not bookable',
    lastCheckedAt: LAST_CHECKED_DEMO,
  },
  {
    id: 'demo-coorg-mist-estate',
    slug: 'aranya-coffee-estate-coorg',
    name: 'Aranya Mist Coffee Estate',
    tagline: 'Timber and basalt hill pavilions inside a 90-acre shade-grown Arabica plantation.',
    description:
      'Tucked into the quiet ridges of Kodagu, Aranya Mist blends warm cedar interiors with sweeping valley decks, guided estate walks, Coorgi pandi and vegetarian harvest dinners, and cool Western Ghats air.',
    city: 'Coorg',
    state: 'Karnataka',
    locality: 'Madikeri Valley, Kodagu',
    address: 'Survey 48/2, Galibeedu Estate Road, Madikeri, Coorg, Karnataka 571201',
    coordinates: { lat: 12.4631, lng: 75.7062 },
    category: 'Plantation Retreat',
    starRating: 4,
    guestRating: 4.8,
    reviewCount: 118,
    startingRateInr: 7200,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: [
      'Coffee Estate Walks',
      'Valley Deck',
      'Complimentary Breakfast',
      'Fireplace',
      'High-Speed Wi-Fi',
      'Private Parking',
    ],
    coverImage: IMG_COORG,
    gallery: [
      { url: IMG_COORG, caption: 'Timber-and-stone valley cottage overlooking misty hills' },
      { url: IMG_GOA, caption: 'Warm afternoon verandah lounge' },
    ],
    rooms: [
      {
        id: 'room-coorg-canopy-cottage',
        propertyId: 'demo-coorg-mist-estate',
        name: 'Arabica Canopy Cottage',
        bedConfig: '1 Queen Bed · Private Valley Deck',
        maxGuests: 2,
        sizeSqFt: 540,
        nightlyRateInr: 7200,
        totalUnits: 8,
        availableUnitsPreview: 3,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['12% GST Slab', 'Estate Pour-Over Coffee', 'Valley View Deck'],
        imageUrl: IMG_COORG,
        cancellationSummary: 'Free cancellation up to 48 hours before check-in.',
      },
      {
        id: 'room-coorg-planters-villa',
        propertyId: 'demo-coorg-mist-estate',
        name: 'Planter’s Hearth Two-Room Villa',
        bedConfig: '2 Queen Beds · Wood-Burning Hearth',
        maxGuests: 4,
        sizeSqFt: 980,
        nightlyRateInr: 12900,
        totalUnits: 3,
        availableUnitsPreview: 1,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['Wood Fireplace', 'Guided Coffee Tasting', 'Private Lawn'],
        imageUrl: IMG_COORG,
        cancellationSummary: 'Free cancellation up to 72 hours before check-in.',
      },
    ],
    policies: {
      checkInTime: '1:00 PM IST',
      checkOutTime: '11:00 AM IST',
      cancellationPolicy: 'Free cancellation up to 48 hours prior to arrival.',
      idRequirement: 'Government Photo ID mandatory at estate gate.',
      petPolicy: 'Pet-friendly estate trails (one dog per cottage, ₹1,000 sanitation fee).',
      smokingPolicy: 'Outdoor decks only.',
      childPolicy: 'Children under 7 stay free; nature walks suitable for all ages.',
    },
    managerId: 'demo-mgr-02',
    dataSource: 'demo',
    verificationStatus: 'demo_unverified',
    bookable: false,
    demoLabel: 'Demo data: not bookable',
    lastCheckedAt: LAST_CHECKED_DEMO,
  },
  {
    id: 'demo-goa-fontainhas-house',
    slug: 'casa-fontainhas-panjim-goa',
    name: 'Casa Fontainhas Atelier',
    tagline: 'Intimate Indo-Portuguese townhouse in Panjim’s historic Latin Quarter.',
    description:
      'Steps from bakeries and galleries in Fontainhas, this 12-room boutique townhouse offers lime-plaster rooms, hand-painted azulejo tiles, and quiet courtyard breakfasts at a crisp 12% GST rate.',
    city: 'Goa',
    state: 'Goa',
    locality: 'Fontainhas, Panjim',
    address: '19 Rua 31 de Janeiro, Fontainhas, Panaji, Goa 403001',
    coordinates: { lat: 15.4981, lng: 73.8315 },
    category: 'Boutique Hotel',
    starRating: 4,
    guestRating: 4.6,
    reviewCount: 94,
    startingRateInr: 6400,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: [
      'Heritage Architecture',
      'Complimentary Breakfast',
      'High-Speed Wi-Fi',
      'Fine Dining',
    ],
    coverImage: IMG_GOA,
    gallery: [
      { url: IMG_GOA, caption: 'Sunlit verandah overlooking lush tropical foliage' },
      { url: STAYAI_HERO_IMAGE, caption: 'Inner heritage courtyard' },
    ],
    rooms: [
      {
        id: 'room-fontainhas-balcony',
        propertyId: 'demo-goa-fontainhas-house',
        name: 'Azulejo Balcony Room',
        bedConfig: '1 Queen Bed · Juliet Balcony',
        maxGuests: 2,
        sizeSqFt: 360,
        nightlyRateInr: 6400,
        totalUnits: 8,
        availableUnitsPreview: 3,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['12% GST Slab', 'Artisanal Bakery Breakfast', 'Work Desk'],
        imageUrl: IMG_GOA,
        cancellationSummary: 'Free cancellation up to 48 hours prior to arrival.',
      },
    ],
    policies: {
      checkInTime: '2:00 PM IST',
      checkOutTime: '11:00 AM IST',
      cancellationPolicy: 'Free cancellation up to 48 hours prior to arrival.',
      idRequirement: 'Valid Government Photo ID mandatory.',
      petPolicy: 'Pets not permitted.',
      smokingPolicy: 'Non-smoking rooms.',
      childPolicy: 'Best suited for adults and children above 6.',
    },
    managerId: 'demo-mgr-02',
    dataSource: 'demo',
    verificationStatus: 'demo_unverified',
    bookable: false,
    demoLabel: 'Demo data: not bookable',
    lastCheckedAt: LAST_CHECKED_DEMO,
  },
  {
    id: 'demo-jaipur-amber-courtyard',
    slug: 'kothi-amber-courtyard-jaipur',
    name: 'Kothi Amber Courtyard',
    tagline: 'Tranquil modern sandstone boutique hotel overlooking the Aravalli foothills.',
    description:
      'Minutes from Amer Fort yet tucked away from city traffic, Kothi Amber pairs contemporary Indian textiles with cool terrazzo floors, rooftop dining, and transparent value pricing.',
    city: 'Jaipur',
    state: 'Rajasthan',
    locality: 'Amer Road, Jaipur',
    address: 'Plot 7, Sagar Road Foothills, Amer, Jaipur 302028',
    coordinates: { lat: 26.9855, lng: 75.8513 },
    category: 'Boutique Hotel',
    starRating: 4,
    guestRating: 4.5,
    reviewCount: 83,
    startingRateInr: 5800,
    freeCancellation: true,
    breakfastIncluded: false,
    amenities: [
      'Courtyard Pool',
      'High-Speed Wi-Fi',
      'Private Parking',
      'Fine Dining',
    ],
    coverImage: IMG_JAIPUR,
    gallery: [
      { url: IMG_JAIPUR, caption: 'Warm sandstone courtyard lounge' },
      { url: STAYAI_HERO_IMAGE, caption: 'Evening reflection pool' },
    ],
    rooms: [
      {
        id: 'room-amber-studio',
        propertyId: 'demo-jaipur-amber-courtyard',
        name: 'Aravalli Courtyard Studio',
        bedConfig: '1 King Bed · Garden Seating',
        maxGuests: 2,
        sizeSqFt: 410,
        nightlyRateInr: 5800,
        totalUnits: 12,
        availableUnitsPreview: 5,
        refundable: true,
        breakfastIncluded: false,
        amenities: ['12% GST Slab', 'Hill Views', 'High-Speed Wi-Fi'],
        imageUrl: IMG_JAIPUR,
        cancellationSummary: 'Free cancellation up to 24 hours before check-in.',
      },
    ],
    policies: {
      checkInTime: '2:00 PM IST',
      checkOutTime: '11:00 AM IST',
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
      idRequirement: 'Valid Government Photo ID required at check-in.',
      petPolicy: 'Pets not permitted.',
      smokingPolicy: 'Designated terrace smoking zone.',
      childPolicy: 'Children under 6 stay free.',
    },
    managerId: 'demo-mgr-01',
    dataSource: 'demo',
    verificationStatus: 'demo_unverified',
    bookable: false,
    demoLabel: 'Demo data: not bookable',
    lastCheckedAt: LAST_CHECKED_DEMO,
  },
  {
    id: 'demo-mumbai-bandra-loft',
    slug: 'pali-atelier-bandra-mumbai',
    name: 'Pali Atelier Bandra West',
    tagline: 'Design-forward boutique hotel nestled under rain trees on Pali Hill.',
    description:
      'Walkable to Bandra’s specialty cafes and studios, Pali Atelier combines warm teak joinery, quiet double-glazed rooms, and flexible business check-in with fast BKC connectivity.',
    city: 'Mumbai',
    state: 'Maharashtra',
    locality: 'Pali Hill, Bandra West',
    address: '11 Nargis Dutt Road, Pali Hill, Bandra West, Mumbai 400050',
    coordinates: { lat: 19.0663, lng: 72.8266 },
    category: 'Boutique Hotel',
    starRating: 4,
    guestRating: 4.6,
    reviewCount: 131,
    startingRateInr: 7400,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: [
      'High-Speed Wi-Fi',
      'Business Lounge',
      'Complimentary Breakfast',
      'Fitness Studio',
      '24x7 Concierge',
    ],
    coverImage: IMG_MUMBAI,
    gallery: [
      { url: IMG_MUMBAI, caption: 'Warm walnut minimalist suite interior' },
    ],
    rooms: [
      {
        id: 'room-bandra-atelier',
        propertyId: 'demo-mumbai-bandra-loft',
        name: 'Pali Canopy King Room',
        bedConfig: '1 King Bed · Studio Desk',
        maxGuests: 2,
        sizeSqFt: 385,
        nightlyRateInr: 7400,
        totalUnits: 16,
        availableUnitsPreview: 4,
        refundable: true,
        breakfastIncluded: true,
        amenities: ['12% GST Slab', 'Specialty Coffee Bar', 'Fiber Wi-Fi'],
        imageUrl: IMG_MUMBAI,
        cancellationSummary: 'Free cancellation up to 24 hours before check-in.',
      },
    ],
    policies: {
      checkInTime: '2:00 PM IST',
      checkOutTime: '12:00 PM IST',
      cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.',
      idRequirement: 'Valid Government Photo ID mandatory for all adult guests.',
      petPolicy: 'Pets not permitted.',
      smokingPolicy: 'Strictly non-smoking property.',
      childPolicy: 'Children under 6 stay complimentary.',
    },
    managerId: 'demo-mgr-02',
    dataSource: 'demo',
    verificationStatus: 'demo_unverified',
    bookable: false,
    demoLabel: 'Demo data: not bookable',
    lastCheckedAt: LAST_CHECKED_DEMO,
  },
];

export const DEMO_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    propertyId: 'demo-goa-cabo-verandah',
    propertyName: 'Cabo Verandah Sanctuary',
    userId: 'demo-user-01',
    authorName: 'Ananya Deshmukh',
    authorCity: 'Bengaluru',
    stayDate: 'Oct 2026',
    rating: 5,
    title: 'Calm architecture and completely transparent final billing',
    comment:
      'Rare to find a South Goa property this serene. The teak verandah stayed cool even at midday, breakfast was fresh every morning, and the final GST invoice matched our quote to the rupee.',
    verifiedStay: false,
    isDemo: true,
    managerReply: {
      text: 'Thank you, Ananya. We take pride in keeping our rates transparent and our coastal grounds peaceful.',
      repliedAt: '2026-10-21T09:15:00.000Z',
      authorName: 'Rohan Naik · General Manager',
    },
  },
  {
    id: 'rev-2',
    propertyId: 'demo-jaipur-surya-haveli',
    propertyName: 'Surya Bagh Heritage Haveli',
    userId: 'demo-user-02',
    authorName: 'Vikramaditya Mehta',
    authorCity: 'Mumbai',
    stayDate: 'Nov 2026',
    rating: 4.8,
    title: 'Restored sandstone detail without feeling museum-like',
    comment:
      'The courtyard lighting at dusk is unforgettable. Fast Wi-Fi let me finish two client calls before heading into the Old City. Would appreciate earlier pool heating in winter.',
    verifiedStay: false,
    isDemo: true,
  },
  {
    id: 'rev-3',
    propertyId: 'demo-mumbai-marine-house',
    propertyName: 'The Marine House Colaba',
    userId: 'demo-user-03',
    authorName: 'Priya Krishnan',
    authorCity: 'Chennai',
    stayDate: 'Nov 2026',
    rating: 4.7,
    title: 'Quiet sea-facing rooms ideal for a 3-day work trip',
    comment:
      'Acoustic glazing actually blocks Marine Drive traffic completely. Smooth GST billing for corporate reimbursement and great morning espresso.',
    verifiedStay: false,
    isDemo: true,
  },
  {
    id: 'rev-4',
    propertyId: 'demo-udaipur-pichola-ghat',
    propertyName: 'Pichola Ghat Marble Residence',
    userId: 'demo-user-04',
    authorName: 'Kabir & Meera Malhotra',
    authorCity: 'New Delhi',
    stayDate: 'Oct 2026',
    rating: 5,
    title: 'Sunrise breakfast on the marble terrace was extraordinary',
    comment:
      'Arriving by private boat felt effortless. Staff were attentive without being intrusive, and the lake view from our jharokha balcony was mesmerizing.',
    verifiedStay: false,
    isDemo: true,
  },
  {
    id: 'rev-5',
    propertyId: 'demo-coorg-mist-estate',
    propertyName: 'Aranya Mist Coffee Estate',
    userId: 'demo-user-05',
    authorName: 'Siddharth Rao',
    authorCity: 'Hyderabad',
    stayDate: 'Sep 2026',
    rating: 4.9,
    title: 'Misty mornings, estate pour-over coffee, and 12% GST value',
    comment:
      'Loved staying under the ₹7,500 nightly GST threshold without sacrificing design quality. The morning Arabica walk with the estate naturalist was the highlight.',
    verifiedStay: false,
    isDemo: true,
  },
];

export class DemoInventoryAdapter implements HotelInventoryProvider {
  readonly providerId = 'demo-seed-adapter';
  readonly source = 'demo' as const;
  readonly isEnabled = true;
  readonly statusMessage =
    'Demo Mode active — seeded pan-India catalog for browsing and UI verification. Demo data: not bookable.';

  async search(query: InventorySearchQuery): Promise<InventorySearchResult> {
    let filtered = [...DEMO_PROPERTIES];

    if (query.query && query.query.trim()) {
      const q = query.query.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }

    if (query.city && query.city !== 'All') {
      filtered = filtered.filter(
        (p) => p.city.toLowerCase() === query.city!.toLowerCase()
      );
    }

    if (typeof query.minPrice === 'number') {
      filtered = filtered.filter((p) => p.startingRateInr >= query.minPrice!);
    }

    if (typeof query.maxPrice === 'number') {
      filtered = filtered.filter((p) => p.startingRateInr <= query.maxPrice!);
    }

    if (typeof query.minRating === 'number' && query.minRating > 0) {
      filtered = filtered.filter((p) => p.guestRating >= query.minRating!);
    }

    if (query.categories && query.categories.length > 0) {
      filtered = filtered.filter((p) => query.categories!.includes(p.category));
    }

    if (query.amenities && query.amenities.length > 0) {
      filtered = filtered.filter((p) =>
        query.amenities!.every((a) => p.amenities.includes(a))
      );
    }

    if (query.freeCancellationOnly) {
      filtered = filtered.filter((p) => p.freeCancellation);
    }

    if (query.breakfastOnly) {
      filtered = filtered.filter((p) => p.breakfastIncluded);
    }

    switch (query.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.startingRateInr - b.startingRateInr);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.startingRateInr - a.startingRateInr);
        break;
      case 'rating_desc':
        filtered.sort((a, b) => b.guestRating - a.guestRating);
        break;
      default:
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 6);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIdx = (page - 1) * pageSize;
    const items = filtered.slice(startIdx, startIdx + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      providerSource: 'demo',
      checkedAt: LAST_CHECKED_DEMO,
    };
  }

  async details(propertyId: string): Promise<Property | null> {
    return (
      DEMO_PROPERTIES.find(
        (p) => p.id === propertyId || p.slug === propertyId
      ) ?? null
    );
  }

  async availability(
    propertyId: string,
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<AvailabilityDay[]> {
    const property = await this.details(propertyId);
    const room = property?.rooms.find((r) => r.id === roomId);
    if (!property || !room) return [];

    const nights = calculateNights(checkIn, checkOut);
    const start = new Date(checkIn);
    const days: AvailabilityDay[] = [];

    for (let i = 0; i < nights; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        id: `${roomId}-${iso}`,
        propertyId,
        roomId,
        date: iso,
        totalUnits: room.totalUnits,
        bookedUnits: Math.max(0, room.totalUnits - room.availableUnitsPreview),
        heldUnits: 0,
        isBlocked: false,
      });
    }
    return days;
  }

  async rates(
    propertyId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    rooms: number
  ): Promise<RateQuote | null> {
    const property = await this.details(propertyId);
    const room = property?.rooms.find((r) => r.id === roomId);
    if (!property || !room) return null;

    const nights = calculateNights(checkIn, checkOut);
    const breakdown = calculatePriceBreakdown(room.nightlyRateInr, nights, rooms);

    return {
      propertyId,
      roomId,
      checkIn,
      checkOut,
      guests,
      rooms,
      breakdown,
      bookable: false,
      reasonIfUnavailable:
        'Demo data: not bookable. Live server-locked inventory holds and Razorpay Test Mode checkout activate in Phases 5 and 7.',
      source: 'demo',
      checkedAt: LAST_CHECKED_DEMO,
    };
  }

  async preview(request: BookingCreateRequest): Promise<RateQuote | null> {
    return this.rates(
      request.propertyId,
      request.roomId,
      request.checkIn,
      request.checkOut,
      request.guests,
      request.rooms
    );
  }

  async book(): Promise<BookingActionResult> {
    return {
      allowed: false,
      code: 'DEMO_NOT_BOOKABLE',
      message:
        'Demo data: not bookable. StayAI never fabricates confirmed reservations for seeded demo hotels.',
    };
  }

  async retrieve(): Promise<Booking | null> {
    return null;
  }

  async cancel(): Promise<BookingActionResult> {
    return {
      allowed: false,
      code: 'DEMO_NOT_BOOKABLE',
      message: 'Cancellation mutations require Phase 5 authenticated server bookings.',
    };
  }
}

export const demoInventoryProvider = new DemoInventoryAdapter();
