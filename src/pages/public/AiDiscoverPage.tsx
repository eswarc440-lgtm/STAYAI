import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Globe,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { HotelCard } from '@/src/components/shared/HotelCard';
import {
  ErrorStatePanel,
  PhaseBanner,
} from '@/src/components/shared/StatePanels';
import { useAppState } from '@/src/context/AppStateContext';
import type { AiDiscoverResponse } from '@/src/types/domain';

const STARTER_PROMPTS = [
  'Quiet sea-facing stay in South Goa with free cancellation and breakfast',
  'Stays under ₹7,500/night (12% GST slab) across India',
  'Heritage haveli or lakefront palace in Rajasthan for a 3-night trip',
  'Business hotel in South Mumbai with sea view and quiet work desk',
];

const LIVE_TRAVEL_STARTERS = [
  'Best months and current travel weather tips for South Goa & Coorg',
  'Airport transfer options from Udaipur Maharana Pratap Airport to Lake Pichola',
  'Upcoming major cultural festivals in Jaipur and Rajasthan',
  'Current monsoon & road conditions driving from Bengaluru to Coorg',
];

interface TravelSearchCitation {
  title: string;
  uri: string;
}

interface TravelSearchResponse {
  answer: string;
  sources: TravelSearchCitation[];
  webSearchQueries: string[];
  model: string;
}

export function AiDiscoverPage() {
  const { properties, serverHealth } = useAppState();
  const [activeTab, setActiveTab] = useState<'catalog' | 'travel_search'>(
    'catalog'
  );

  // Grounded Catalog Discovery State
  const [prompt, setPrompt] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [result, setResult] = useState<
    (AiDiscoverResponse & { rejectedUnknownIdsCount?: number }) | null
  >(null);

  // Live Google Search Grounding State
  const [travelQuery, setTravelQuery] = useState('');
  const [travelCity, setTravelCity] = useState('');
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [travelError, setTravelError] = useState<string | null>(null);
  const [travelResult, setTravelResult] = useState<TravelSearchResponse | null>(
    null
  );

  const runGroundedDiscovery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setPrompt(trimmed);
    setIsSearching(true);
    setDiscoverError(null);

    try {
      const response = await fetch('/api/ai/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = (await response.json()) as AiDiscoverResponse & {
        error?: string;
        rejectedUnknownIdsCount?: number;
      };

      if (!response.ok) {
        throw new Error(
          data.error || 'Server Gemini hotel discovery failed. Please retry.'
        );
      }

      // Secondary client-side allowlist guard matching server allowlist
      const allowedIds = new Set(properties.map((p) => p.id));
      const verifiedIds = (data.hotelIds || []).filter((id) =>
        allowedIds.has(id)
      );
      const verifiedRecs = (data.recommendations || []).filter((r) =>
        allowedIds.has(r.hotelId)
      );

      setResult({
        ...data,
        hotelIds: verifiedIds,
        recommendations: verifiedRecs,
      });
    } catch (err) {
      setDiscoverError(
        err instanceof Error
          ? err.message
          : 'Unable to run server-side Gemini discovery.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const runLiveTravelSearch = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setTravelQuery(trimmed);
    setIsSearchingWeb(true);
    setTravelError(null);

    try {
      const response = await fetch('/api/ai/travel-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          city: travelCity || undefined,
        }),
      });

      const data = (await response.json()) as TravelSearchResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || 'Google Search grounded travel lookup failed.'
        );
      }

      setTravelResult(data);
    } catch (err) {
      setTravelError(
        err instanceof Error
          ? err.message
          : 'Unable to complete live travel search.'
      );
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const matchedProperties = result
    ? properties.filter((p) => result.hotelIds.includes(p.id))
    : [];

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Server-Side Gemini AI & Live Search Grounding
        </div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-navy">
          Discover Indian stays with verified facts.
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-muted-foreground">
          Match stays strictly from StayAI’s backend catalog using structured
          Gemini JSON responses, or check real-time Indian destination weather,
          festivals, and transit via Google Search Grounding.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div
          className="inline-flex rounded-lg bg-secondary p-1 text-xs"
          role="tablist"
          aria-label="AI Discovery mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'catalog'}
            onClick={() => setActiveTab('catalog')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-card text-navy shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Grounded Hotel Catalog
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'travel_search'}
            onClick={() => setActiveTab('travel_search')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'travel_search'
                ? 'bg-card text-navy shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Live India Travel Search (Google Search)
          </button>
        </div>

        <span className="text-xs text-muted-foreground font-tabular">
          Server Gemini:{' '}
          <strong className="text-foreground">
            {serverHealth.checked
              ? serverHealth.geminiConfigured
                ? 'Connected (Server-Only)'
                : 'Not configured'
              : 'Checking...'}
          </strong>
        </span>
      </div>

      {serverHealth.checked && !serverHealth.geminiConfigured && (
        <PhaseBanner
          tone="amber"
          title="Server Gemini API Key Not Configured"
          description="Set GEMINI_API_KEY in the server environment to activate live Gemini hotel discovery and Google Search Grounding. Keys are never exposed in client code."
          className="mt-6"
        />
      )}

      {/* TAB 1: Grounded Catalog Discovery */}
      {activeTab === 'catalog' && (
        <div className="mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runGroundedDiscovery(prompt);
            }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <label htmlFor="ai-prompt" className="sr-only">
              Describe the hotel stay you want in India
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Quiet heritage stay in Jaipur under ₹15,000/night with breakfast"
                className="flex-1 h-11"
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSearching || !prompt.trim()}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {isSearching ? 'Analyzing Catalog...' : 'Discover Stays'}
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => runGroundedDiscovery(starter)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-left cursor-pointer"
                >
                  {starter}
                </button>
              ))}
            </div>
          </form>

          {/* Guardrail Notice */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck
                className="h-3.5 w-3.5 text-primary"
                aria-hidden="true"
              />
              AI Safety Boundaries:
            </span>
            <span>Unknown hotel IDs rejected server-side</span>
            <span aria-hidden="true">·</span>
            <span>Never invents prices or availability</span>
            <span aria-hidden="true">·</span>
            <span>Cannot book, refund, or change inventory</span>
          </div>

          {discoverError && (
            <div className="mt-6">
              <ErrorStatePanel
                title="AI Discovery Request Unavailable"
                description={discoverError}
                onRetry={() => runGroundedDiscovery(prompt)}
              />
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-8">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-navy">
                    Validated Gemini JSON Response
                  </span>
                  <span className="font-tabular">
                    Source: {result.groundedSource} · Verified IDs:{' '}
                    {result.hotelIds.length}
                    {typeof result.rejectedUnknownIdsCount === 'number' &&
                    result.rejectedUnknownIdsCount > 0
                      ? ` · Rejected unknown IDs: ${result.rejectedUnknownIdsCount}`
                      : ''}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.responseText}
                </p>

                {result.recommendations.length > 0 && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <h2 className="text-xs font-semibold text-navy">
                      Catalog Highlights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.recommendations.map((rec) => (
                        <div
                          key={rec.hotelId}
                          className="rounded-lg border border-border bg-background p-3 text-xs"
                        >
                          <div className="font-semibold text-navy">
                            {rec.highlight}
                          </div>
                          <div className="mt-1 text-muted-foreground">
                            {rec.fitScoreNote}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <h2 className="text-xs font-semibold text-navy mb-2">
                      Matching Reasons
                    </h2>
                    <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                      {result.matchingReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-navy mb-2">
                      Suggested Follow-up Questions
                    </h2>
                    <div className="flex flex-col gap-1.5 items-start">
                      {result.followUpQuestions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => runGroundedDiscovery(q)}
                          className="text-xs text-primary hover:underline text-left cursor-pointer"
                        >
                          → {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {matchedProperties.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl font-medium text-navy">
                      Matched Catalog Stays
                    </h2>
                    <Link
                      to="/explore"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Open full Explore filters
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchedProperties.map((p) => (
                      <HotelCard key={p.id} property={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live India Travel Search (Google Search Grounding) */}
      {activeTab === 'travel_search' && (
        <div className="mt-6 space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runLiveTravelSearch(travelQuery);
            }}
            className="rounded-xl border border-border bg-card p-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-3">
                <label
                  htmlFor="travel-city"
                  className="block text-xs font-medium text-muted-foreground mb-1"
                >
                  Destination Focus
                </label>
                <NativeSelect
                  id="travel-city"
                  value={travelCity}
                  onChange={(e) => setTravelCity(e.target.value)}
                  className="h-11"
                >
                  <option value="">All India</option>
                  <option value="Goa">Goa</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Udaipur">Udaipur</option>
                  <option value="Coorg">Coorg</option>
                </NativeSelect>
              </div>
              <div className="sm:col-span-7">
                <label
                  htmlFor="travel-query"
                  className="block text-xs font-medium text-muted-foreground mb-1"
                >
                  Live Travel Question (Weather, Transit, Festivals, Advisories)
                </label>
                <Input
                  id="travel-query"
                  value={travelQuery}
                  onChange={(e) => setTravelQuery(e.target.value)}
                  placeholder="e.g., Current ferry or airport transfer timings from Mopa Airport to South Goa"
                  className="h-11"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11"
                  disabled={isSearchingWeb || !travelQuery.trim()}
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  {isSearchingWeb ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {LIVE_TRAVEL_STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => runLiveTravelSearch(starter)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-left cursor-pointer"
                >
                  {starter}
                </button>
              ))}
            </div>
          </form>

          {travelError && (
            <ErrorStatePanel
              title="Live Travel Search Unavailable"
              description={travelError}
              onRetry={() => runLiveTravelSearch(travelQuery)}
            />
          )}

          {travelResult && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground border-b border-border pb-3">
                <span className="inline-flex items-center gap-1.5 font-semibold text-navy">
                  <Globe className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Grounded with Google Search
                </span>
                <span className="font-tabular">
                  Model: {travelResult.model} · Citations:{' '}
                  {travelResult.sources.length}
                </span>
              </div>

              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {travelResult.answer}
              </div>

              {travelResult.sources.length > 0 && (
                <div className="pt-4 border-t border-border space-y-2.5">
                  <h2 className="text-xs font-semibold text-navy">
                    Verified Web Sources
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {travelResult.sources.map((src) => (
                      <a
                        key={src.uri}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-primary hover:border-primary/50 hover:underline"
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
