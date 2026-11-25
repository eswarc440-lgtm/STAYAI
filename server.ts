import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import {
  DEMO_PROPERTIES,
  DEMO_REVIEWS,
} from './src/services/inventory/DemoInventoryAdapter.ts';
import { getIndianHotelGstRate } from './src/lib/format.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

// Server-only Gemini client initialization (never exposed to browser)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const aiClient = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// --- Per-IP Sliding-Window Rate Limiter for AI Endpoints ---
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const ipRequestBuckets = new Map<string, number[]>();

function checkAiRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (ipRequestBuckets.get(ip) || []).filter((t) => t > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequestBuckets.set(ip, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  ipRequestBuckets.set(ip, timestamps);
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - timestamps.length };
}

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

// --- Grounded Backend Catalog Context ---
const ALLOWED_HOTEL_IDS = new Set(DEMO_PROPERTIES.map((p) => p.id));

const GROUNDED_CATALOG_JSON = JSON.stringify(
  DEMO_PROPERTIES.map((p) => {
    const gstPercent = Math.round(getIndianHotelGstRate(p.startingRateInr) * 100);
    const matchingReviews = DEMO_REVIEWS.filter((r) => r.propertyId === p.id).map(
      (r) => ({ rating: r.rating, title: r.title, comment: r.comment })
    );
    return {
      id: p.id,
      name: p.name,
      city: p.city,
      state: p.state,
      locality: p.locality,
      category: p.category,
      starRating: p.starRating,
      guestRating: p.guestRating,
      reviewCount: p.reviewCount,
      startingRateInr: p.startingRateInr,
      gstSlabPercent: gstPercent,
      freeCancellation: p.freeCancellation,
      breakfastIncluded: p.breakfastIncluded,
      amenities: p.amenities,
      tagline: p.tagline,
      policies: {
        checkInTime: p.policies.checkInTime,
        checkOutTime: p.policies.checkOutTime,
        cancellationPolicy: p.policies.cancellationPolicy,
      },
      rooms: p.rooms.map((r) => ({
        name: r.name,
        nightlyRateInr: r.nightlyRateInr,
        maxGuests: r.maxGuests,
        refundable: r.refundable,
        breakfastIncluded: r.breakfastIncluded,
      })),
      sampleReviews: matchingReviews,
      dataSource: p.dataSource,
      bookable: p.bookable,
      label: p.demoLabel,
    };
  })
);

// --- Grounding Source Extractor ---
interface WebCitation {
  title: string;
  uri: string;
}

function extractGroundingCitations(response: unknown): {
  sources: WebCitation[];
  webSearchQueries: string[];
} {
  const candidates = (response as { candidates?: Array<{ groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>; webSearchQueries?: string[] } }> })?.candidates;
  const meta = candidates?.[0]?.groundingMetadata;
  const chunks = meta?.groundingChunks || [];
  const seen = new Set<string>();
  const sources: WebCitation[] = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    if (uri && (uri.startsWith('https://') || uri.startsWith('http://')) && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        uri,
        title: chunk?.web?.title || new URL(uri).hostname,
      });
    }
  }

  return {
    sources,
    webSearchQueries: Array.isArray(meta?.webSearchQueries)
      ? meta.webSearchQueries.slice(0, 6)
      : [],
  };
}

// --- Zod Request Schemas ---
const discoverSchema = z.object({
  prompt: z.string().trim().min(3, 'Enter at least 3 characters').max(500),
});

const travelSearchSchema = z.object({
  query: z.string().trim().min(3, 'Enter a travel question').max(300),
  city: z.string().trim().max(60).optional(),
});

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        text: z.string().trim().min(1).max(2000),
      })
    )
    .min(1)
    .max(24),
  persona: z
    .enum(['travel_concierge', 'gst_policy_advisor', 'manager_analyst'])
    .default('travel_concierge'),
  speedMode: z.enum(['balanced', 'fast']).default('balanced'),
  useSearchGrounding: z.boolean().default(false),
});

function buildPersonaSystemInstruction(
  persona: 'travel_concierge' | 'gst_policy_advisor' | 'manager_analyst'
): string {
  const sharedGuardrails = `
STRICT STAYAI RULES:
1. For any hotel names, prices, ratings, amenities, rooms, or policies on StayAI, ONLY use facts present in the StayAI Backend Catalog JSON below.
2. NEVER invent hotels, room rates, ratings, reviews, or live room availability.
3. Direct travelers to open any recommended StayAI property page to review full GST breakdowns and complete their reservation through checkout.
4. You CANNOT create bookings, confirm payments, issue refunds, or alter rates/inventory. If asked to perform transactions, explain clearly that StayAI requires the checkout & server-verified payment workflow.
5. Format prices in Indian Rupees (INR, ₹) and respect Indian Hotel GST slabs: 0% <= ₹1,000/night, 12% for ₹1,001-₹7,500/night, 18% > ₹7,500/night.

STAYAI BACKEND CATALOG JSON:
${GROUNDED_CATALOG_JSON}
`;

  if (persona === 'gst_policy_advisor') {
    return `You are the StayAI India GST & Policy Advisor. Help travelers and hoteliers understand Indian hotel GST slabs, cancellation windows, ID verification rules (Aadhaar/Passport/Driving Licence), and transparent price breakdowns using exact arithmetic. Keep responses clear, concise, and structured.\n${sharedGuardrails}`;
  }

  if (persona === 'manager_analyst') {
    return `You are the StayAI Hospitality Revenue & Operations Insights Advisor for Indian hotel managers. Summarize guest review themes, GST slab pricing strategy (e.g., staying at or below ₹7,500 to keep guests in the 12% GST bracket vs 18%), cancellation policy clarity, and direct-booking positioning based strictly on the provided StayAI catalog and reviews.\n${sharedGuardrails}`;
  }

  return `You are the StayAI Concierge, a refined, helpful Indian hospitality discovery assistant. Help travelers compare stays across Goa, Jaipur, Mumbai, Udaipur, and Coorg, build realistic day-by-day Indian itineraries, and weigh trade-offs honestly.\n${sharedGuardrails}`;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '128kb' }));

  // --- Health & Honest Integration Readiness Endpoint ---
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      mode: 'demo',
      geminiConfigured: Boolean(aiClient),
      mapsConfigured: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY),
      firebaseConfigured: true,
      razorpayConfigured: false,
      otaEnabled: false,
      storageConfigured: false,
      emailSmsConfigured: false,
      timestamp: new Date().toISOString(),
    });
  });

  // --- Grounded Structured Hotel Discovery (Gemini Server-Only) ---
  app.post('/api/ai/discover', async (req, res) => {
    const rate = checkAiRateLimit(getClientIp(req));
    if (!rate.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded. Please wait a few minutes before sending more AI discovery requests.',
      });
      return;
    }

    const parsed = discoverSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid discovery prompt.',
      });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'Gemini AI is not configured on the server (GEMINI_API_KEY missing).',
      });
      return;
    }

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Traveler request: "${parsed.data.prompt}"\n\nSelect the best matching StayAI properties (1 to 4 properties) strictly from the provided catalog JSON, explain why they match with exact INR base rates and GST slabs, and propose 3 practical follow-up questions.`,
        config: {
          systemInstruction: buildPersonaSystemInstruction('travel_concierge'),
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              responseText: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hotelId: { type: Type.STRING },
                    highlight: { type: Type.STRING },
                    fitScoreNote: { type: Type.STRING },
                  },
                  required: ['hotelId', 'highlight', 'fitScoreNote'],
                },
              },
              matchingReasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              hotelIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              followUpQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'responseText',
              'recommendations',
              'matchingReasons',
              'hotelIds',
              'followUpQuestions',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini model.');
      }

      const modelJson = JSON.parse(rawText) as {
        responseText?: string;
        recommendations?: Array<{
          hotelId: string;
          highlight: string;
          fitScoreNote: string;
        }>;
        matchingReasons?: string[];
        hotelIds?: string[];
        followUpQuestions?: string[];
      };

      // Strict unknown-hotel-ID rejection guard
      const rawRecommendations = Array.isArray(modelJson.recommendations)
        ? modelJson.recommendations
        : [];
      const verifiedRecommendations = rawRecommendations.filter((rec) =>
        ALLOWED_HOTEL_IDS.has(rec.hotelId)
      );

      const rawIds = Array.isArray(modelJson.hotelIds) ? modelJson.hotelIds : [];
      const combinedIds = Array.from(
        new Set([
          ...rawIds.filter((id) => ALLOWED_HOTEL_IDS.has(id)),
          ...verifiedRecommendations.map((r) => r.hotelId),
        ])
      );

      const rejectedCount =
        rawIds.filter((id) => !ALLOWED_HOTEL_IDS.has(id)).length +
        rawRecommendations.filter((r) => !ALLOWED_HOTEL_IDS.has(r.hotelId)).length;

      res.json({
        responseText:
          modelJson.responseText ||
          'Matched properties from the StayAI backend catalog.',
        recommendations: verifiedRecommendations,
        matchingReasons: Array.isArray(modelJson.matchingReasons)
          ? modelJson.matchingReasons.slice(0, 6)
          : [],
        hotelIds: combinedIds,
        followUpQuestions: Array.isArray(modelJson.followUpQuestions)
          ? modelJson.followUpQuestions.slice(0, 4)
          : [],
        groundedSource: 'server_gemini_catalog',
        rejectedUnknownIdsCount: rejectedCount,
        remainingQuota: rate.remaining,
      });
    } catch (error) {
      console.error('Gemini /api/ai/discover error:', error);
      res.status(502).json({
        error: 'Unable to complete AI hotel discovery right now. Please try again shortly.',
      });
    }
  });

  // --- Live Google Search Grounding for Indian Travel Context ---
  app.post('/api/ai/travel-search', async (req, res) => {
    const rate = checkAiRateLimit(getClientIp(req));
    if (!rate.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded. Please wait a few minutes before retrying.',
      });
      return;
    }

    const parsed = travelSearchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid travel search query.',
      });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'Gemini AI is not configured on the server (GEMINI_API_KEY missing).',
      });
      return;
    }

    try {
      const cityContext = parsed.data.city
        ? `Focus specifically on ${parsed.data.city}, India.`
        : 'Focus on India travel logistics and destinations.';

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `${cityContext}\n\nTraveler question: ${parsed.data.query}\n\nProvide an up-to-date, factual, well-structured answer grounded in live Google Search results (weather, seasonal windows, airport/train connections, festivals, or local advisories). Do not fabricate hotel availability or prices.`,
        config: {
          systemInstruction:
            'You are StayAI Live Travel Intelligence for India. Use Google Search grounding to answer real-time destination, weather, festival, airport transit, and travel-advisory questions concisely and factually. Never invent hotel bookings or claim live hotel availability.',
          tools: [{ googleSearch: {} }],
        },
      });

      const { sources, webSearchQueries } = extractGroundingCitations(response);

      res.json({
        answer:
          response.text ||
          'No live travel summary could be produced for this query.',
        sources,
        webSearchQueries,
        model: 'gemini-4-hydrogen',
        groundedWithGoogleSearch: true,
        remainingQuota: rate.remaining,
      });
    } catch (error) {
      console.error('Gemini /api/ai/travel-search error:', error);
      res.status(502).json({
        error: 'Unable to run Google Search grounded travel lookup right now.',
      });
    }
  });

  // --- Multi-Turn Gemini Chatbot Endpoint ---
  app.post('/api/ai/chat', async (req, res) => {
    const rate = checkAiRateLimit(getClientIp(req));
    if (!rate.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded. Please wait a few minutes before continuing.',
      });
      return;
    }

    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid chat request payload.',
      });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'Gemini AI is not configured on the server (GEMINI_API_KEY missing).',
      });
      return;
    }

    const { messages, persona, speedMode, useSearchGrounding } = parsed.data;
    const modelName =
      speedMode === 'fast' && !useSearchGrounding
        ? 'gemini-3.1-flash-lite'
        : 'gemini-4-hydrogen';

    try {
      const contents = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const config: {
        systemInstruction: string;
        tools?: Array<{ googleSearch: Record<string, never> }>;
      } = {
        systemInstruction: buildPersonaSystemInstruction(persona),
      };

      if (useSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await aiClient.models.generateContent({
        model: modelName,
        contents,
        config,
      });

      const { sources, webSearchQueries } = useSearchGrounding
        ? extractGroundingCitations(response)
        : { sources: [], webSearchQueries: [] };

      res.json({
        reply: response.text || 'I could not generate a response for that turn.',
        model: modelName,
        persona,
        sources,
        webSearchQueries,
        remainingQuota: rate.remaining,
      });
    } catch (error) {
      console.error('Gemini /api/ai/chat error:', error);
      res.status(502).json({
        error: 'Gemini chat turn failed. Please retry in a moment.',
      });
    }
  });

  // --- Vite Middleware (Dev) or Static Dist Serving (Prod) ---
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `StayAI server running on http://0.0.0.0:${PORT} (${IS_PROD ? 'production' : 'development'})`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start StayAI server:', err);
  process.exit(1);
});
