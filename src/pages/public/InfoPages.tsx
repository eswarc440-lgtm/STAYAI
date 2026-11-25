import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input, Label, Textarea } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { useAppState } from '@/src/context/AppStateContext';

function EditorialDocLayout({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="text-xs font-medium text-primary">{kicker}</div>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-navy">
        {title}
      </h1>
      {updated && (
        <p className="mt-2 text-xs text-muted-foreground font-tabular">
          Last updated: {updated}
        </p>
      )}
      <div className="mt-8 space-y-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <EditorialDocLayout
      kicker="About StayAI"
      title="Honest hospitality infrastructure for India."
    >
      <p>
        StayAI is designed for travelers, independent hoteliers, and hospitality teams across
        India who want clear tax-inclusive pricing, verifiable inventory provenance, and
        grounded AI discovery without fabricated listings or hidden checkout fees.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Direct & Authorized Inventory</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Hotels manage their own rooms, rates, and availability calendars directly. OTA
            adapters remain disabled unless authorized API access is configured.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Server-Verified Payments</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Bookings confirm only after server-verified Razorpay capture and provider
            confirmation—never from an unverified browser redirect.
          </CardContent>
        </Card>
      </div>
    </EditorialDocLayout>
  );
}

export function HelpPage() {
  const faqs = [
    {
      q: 'How does StayAI verify hotel listings?',
      a: 'Direct hotels manage their own room types, rates, cancellation rules, and availability calendars inside StayAI with transparent provenance on every listing.',
    },
    {
      q: 'How is Indian hotel GST calculated on StayAI?',
      a: 'We apply standard Indian GST slabs based on nightly room tariff: 0% up to ₹1,000/night, 12% from ₹1,001 to ₹7,500/night, and 18% above ₹7,500/night, itemized before payment.',
    },
    {
      q: 'Can the AI assistant book a room or change prices?',
      a: 'No. StayAI’s Gemini layer is strictly read-only and grounded against backend catalog results. It cannot invent properties, confirm payments, issue refunds, or modify inventory.',
    },
    {
      q: 'What happens if a Razorpay payment succeeds but the room hold expires?',
      a: 'In Phases 5 & 7, the backend reconciles webhooks idempotently and automatically triggers a safe refund or compensation workflow so you are never charged without a verified reservation.',
    },
  ];

  return (
    <EditorialDocLayout kicker="Help Center" title="Frequently asked questions">
      <div className="space-y-4">
        {faqs.map((item) => (
          <Card key={item.q}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-navy">{item.q}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.a}
            </CardContent>
          </Card>
        ))}
      </div>
    </EditorialDocLayout>
  );
}

const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  topic: z.string().min(2, 'Select or enter a topic'),
  message: z.string().min(15, 'Please provide at least 15 characters of detail'),
});

export function ContactPage() {
  const { submitSupportTicket } = useAppState();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: 'General Support' },
  });

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    try {
      const res = await submitSupportTicket({
        category: data.topic,
        subject: `${data.topic} — ${data.name}`,
        message: data.message,
      });
      if (res.persisted) {
        toast.success(`Support ticket ${res.ticketId} saved to Firestore`, {
          description: 'Our team can triage your ticket in the Admin Complaints queue.',
        });
      } else {
        toast.info('Inquiry recorded locally (Sign in to persist to Firestore)', {
          description: `Email/SMS delivery remains Not Configured. Sign in on /login to persist support tickets to Firestore.`,
        });
      }
      reset();
    } catch {
      toast.error('Failed to save support ticket to Firestore', {
        description: 'Ensure your account is signed in and retry.',
      });
    }
  };

  return (
    <EditorialDocLayout kicker="Contact StayAI" title="Reach our hospitality support team">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-name">Your name</Label>
                <Input id="contact-name" {...register('name')} placeholder="Full name" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="contact-email">Email address</Label>
                <Input id="contact-email" type="email" {...register('email')} placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="contact-topic">Topic</Label>
              <Input id="contact-topic" {...register('topic')} />
              {errors.topic && <p className="mt-1 text-xs text-destructive">{errors.topic.message}</p>}
            </div>
            <div>
              <Label htmlFor="contact-msg">Message</Label>
              <Textarea id="contact-msg" {...register('message')} placeholder="Tell us how we can help..." />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </EditorialDocLayout>
  );
}

export function PrivacyPage() {
  return (
    <EditorialDocLayout
      kicker="Legal · Privacy"
      title="Privacy Policy"
      updated="25 Nov 2026"
    >
      <p>
        StayAI collects only the account, booking, and contact details strictly needed to
        manage hotel discovery, reservations, and legally required Indian hospitality guest
        verification and GST invoicing.
      </p>
      <h2 className="text-lg font-semibold text-navy pt-2">Payment Data Minimization</h2>
      <p>
        StayAI never collects, processes, or stores raw card numbers, CVVs, or UPI PINs.
        All payment instruments are handled exclusively through Razorpay’s PCI-DSS compliant
        checkout or single-use fixed-amount UPI QR flows when enabled.
      </p>
      <h2 className="text-lg font-semibold text-navy pt-2">Access & Isolation</h2>
      <p>
        Customer bookings, saved stays, and notifications are strictly scoped to the signed-in
        owner through both Firestore Security Rules and server-side ownership verification.
      </p>
    </EditorialDocLayout>
  );
}

export function TermsPage() {
  return (
    <EditorialDocLayout
      kicker="Legal · Terms"
      title="Terms of Service"
      updated="25 Nov 2026"
    >
      <p>
        StayAI operates as a technology discovery and direct-booking platform connecting
        guests with verified Indian properties with clear GST breakdowns and cancellation policies.
      </p>
      <h2 className="text-lg font-semibold text-navy pt-2">Reservation Confirmation Rule</h2>
      <p>
        A live reservation is binding solely after server-side inventory hold verification,
        verified Razorpay payment capture via signed webhook or server reconciliation, and
        hotel provider confirmation. Browser redirects alone never constitute confirmation.
      </p>
    </EditorialDocLayout>
  );
}

export function CancellationPolicyPage() {
  return (
    <EditorialDocLayout
      kicker="Legal · Cancellations & Refunds"
      title="Cancellation & Refund Policy"
      updated="25 Nov 2026"
    >
      <p>
        Cancellation windows are defined transparently on each room rate before checkout
        (typically 24, 48, or 72 hours prior to 2:00 PM IST check-in for flexible rates).
      </p>
      <h2 className="text-lg font-semibold text-navy pt-2">Refund Processing</h2>
      <p>
        Approved refunds and failed-booking compensations are initiated back to the original
        Razorpay payment instrument and tracked via immutable audit logs and in-app
        notifications. Standard bank settlement timelines in India are 5–7 business days.
      </p>
    </EditorialDocLayout>
  );
}
