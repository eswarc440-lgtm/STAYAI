import { useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  Globe,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input, NativeSelect } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/controls';

type ChatPersona = 'travel_concierge' | 'gst_policy_advisor' | 'manager_analyst';
type SpeedMode = 'balanced' | 'fast';

interface WebCitation {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  model?: string;
  sources?: WebCitation[];
}

const PERSONA_STARTERS: Record<ChatPersona, string[]> = {
  travel_concierge: [
    'Compare Goa vs Coorg for a quiet 3-night retreat',
    'Which stays have complimentary breakfast and free cancellation?',
    'Suggest a 3-day Jaipur & Udaipur itinerary using StayAI catalog stays',
  ],
  gst_policy_advisor: [
    'Explain Indian hotel GST slabs for ₹6,800 vs ₹14,500 rooms',
    'Which StayAI catalog properties fall in the 12% GST bracket?',
    'What ID verification is required at check-in across Indian hotels?',
  ],
  manager_analyst: [
    'Summarize key themes from our demo guest reviews',
    'How does pricing at ₹7,500 vs ₹7,800 impact guest GST total?',
    'What policy strengths differentiate our direct listings?',
  ],
};

export function GeminiChatDrawer() {
  const [open, setOpen] = useState(false);
  const [persona, setPersona] = useState<ChatPersona>('travel_concierge');
  const [speedMode, setSpeedMode] = useState<SpeedMode>('balanced');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Namaste — I am the StayAI Concierge. Ask me to compare our Indian properties, calculate GST-inclusive totals, plan itineraries, or toggle Live Web Search for current weather and transit conditions.',
    },
  ]);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, isLoading]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const sendTurn = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Send conversation history excluding the static welcome message if it's the first turn
      const payloadMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .slice(-16)
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          persona,
          speedMode,
          useSearchGrounding,
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        model?: string;
        sources?: WebCitation[];
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Unable to reach StayAI server chat.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.reply || '',
          model: data.model,
          sources: Array.isArray(data.sources) ? data.sources : [],
        },
      ]);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unexpected error calling AI chat.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setErrorMsg(null);
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Conversation cleared. Ask about StayAI properties across Goa, Jaipur, Mumbai, Udaipur, or Coorg, GST slabs, or toggle Live Web Search for current India travel updates.',
      },
    ]);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open StayAI Gemini Concierge Chat"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-navy/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        >
          <MessageSquare className="h-4 w-4 text-teal-300" aria-hidden="true" />
          <span>StayAI Concierge</span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
          role="dialog"
          aria-label="StayAI Gemini Concierge Chat"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5 bg-background">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-navy">
                  StayAI Concierge
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Multi-turn server Gemini · Grounded catalog
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetChat}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                aria-label="Close concierge chat"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="border-b border-border bg-secondary/40 px-4 py-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="chat-persona"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Assistant Persona
                </label>
                <NativeSelect
                  id="chat-persona"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value as ChatPersona)}
                  className="h-8 text-xs"
                >
                  <option value="travel_concierge">Travel Concierge</option>
                  <option value="gst_policy_advisor">GST & Policy Advisor</option>
                  <option value="manager_analyst">Manager Insights</option>
                </NativeSelect>
              </div>
              <div>
                <label
                  htmlFor="chat-speed"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Response Profile
                </label>
                <NativeSelect
                  id="chat-speed"
                  value={speedMode}
                  onChange={(e) => setSpeedMode(e.target.value as SpeedMode)}
                  className="h-8 text-xs"
                  disabled={useSearchGrounding}
                >
                  <option value="balanced">Balanced (Hydrogen)</option>
                  <option value="fast">Fast (Flash Lite)</option>
                </NativeSelect>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-foreground">
                <Globe className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Google Search Grounding (live travel info)</span>
              </div>
              <Switch
                checked={useSearchGrounding}
                onCheckedChange={setUseSearchGrounding}
                aria-label="Enable Google Search Grounding"
              />
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-navy text-white'
                      : 'border border-border bg-background text-foreground'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 max-w-[88%] space-y-1">
                    <div className="text-[11px] font-medium text-muted-foreground">
                      Grounded Web Sources:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src) => (
                        <a
                          key={src.uri}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-primary hover:border-primary/50 hover:underline max-w-full"
                        >
                          <span className="truncate max-w-[200px]">
                            {src.title}
                          </span>
                          <ExternalLink
                            className="h-3 w-3 shrink-0"
                            aria-hidden="true"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {msg.model && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-tabular text-muted-foreground">
                    {msg.model === 'gemini-3.1-flash-lite' && (
                      <Zap className="h-2.5 w-2.5 text-primary" aria-hidden="true" />
                    )}
                    {msg.model}
                  </span>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-muted-foreground">
                  {useSearchGrounding
                    ? 'Searching live travel sources & StayAI catalog...'
                    : 'Thinking with StayAI catalog...'}
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
              >
                {errorMsg}
              </div>
            )}

            {messages.length <= 1 && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] font-medium text-muted-foreground">
                  Suggested prompts:
                </div>
                {PERSONA_STARTERS[persona].map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => sendTurn(starter)}
                    className="block w-full rounded-lg border border-border bg-card px-3 py-2 text-left text-xs text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-background p-3.5 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendTurn(input);
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hotels, GST, itineraries, or travel..."
                disabled={isLoading}
                className="flex-1 h-10 text-sm"
                aria-label="Message StayAI Concierge"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="h-10 px-3.5"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck
                className="h-3.5 w-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                Read-only grounded AI · Never invents hotels or confirms bookings.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
