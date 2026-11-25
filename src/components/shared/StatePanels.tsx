import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  RefreshCw,
  SearchX,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/card';
import type { Property } from '@/src/types/domain';
import { formatDateTimeIST } from '@/src/lib/format';
import { cn } from '@/src/lib/utils';

export function LoadingCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-busy="true"
      aria-label="Loading stays"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3.5 w-full" />
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingTableRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-4 py-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2 ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function EmptyStatePanel({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-14 text-center max-w-2xl mx-auto">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <SearchX className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl font-medium text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ErrorStatePanel({
  title = 'Unable to load this view',
  description = 'An unexpected issue interrupted the request. No changes were saved.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50/60 px-6 py-10 text-center max-w-2xl mx-auto"
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-destructive">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-medium text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Clean hairline-bordered informational/mode banner (no thick left accent border, no candy pills).
 */
export function PhaseBanner({
  tone = 'amber',
  title,
  description,
  action,
  className,
}: {
  tone?: 'amber' | 'neutral' | 'teal' | 'red';
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const toneClasses = {
    amber: 'border-amber-200/90 bg-amber-50/70 text-amber-950',
    neutral: 'border-border bg-secondary/75 text-foreground',
    teal: 'border-teal-200/80 bg-accent/65 text-accent-foreground',
    red: 'border-red-200 bg-red-50/70 text-red-950',
  }[tone];

  const Icon =
    tone === 'amber'
      ? ShieldAlert
      : tone === 'red'
        ? AlertCircle
        : tone === 'teal'
          ? CheckCircle2
          : Info;

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        toneClasses,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="text-sm">
          <span className="font-semibold">{title}:</span>{' '}
          <span className="opacity-90">{description}</span>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Semantic status text label — never conveys status by color alone, never renders decorative pulsing dots.
 */
export function StatusText({
  tone,
  label,
}: {
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  label: string;
}) {
  const classes = {
    success: 'text-emerald-800',
    warning: 'text-amber-800',
    danger: 'text-red-800',
    neutral: 'text-muted-foreground',
  }[tone];

  const Icon =
    tone === 'success'
      ? CheckCircle2
      : tone === 'warning'
        ? Clock
        : tone === 'danger'
          ? AlertCircle
          : Info;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap',
        classes
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

/**
 * Transparent inventory provenance strip required on every hotel listing detail view.
 */
export function DataProvenanceStrip({ property }: { property: Property }) {
  const sourceText =
    property.dataSource === 'ota_disabled'
      ? 'Partner Inventory'
      : 'Direct Hotel Inventory';

  const verificationText =
    property.verificationStatus === 'suspended'
      ? 'Suspended Listing'
      : property.verificationStatus === 'pending_review'
        ? 'Pending Review'
        : 'Verified Property';

  return (
    <div className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="font-semibold text-primary">
          Instant Booking Available
        </span>
        <span aria-hidden="true">·</span>
        <span>
          Source: <strong className="font-medium text-foreground">{sourceText}</strong>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          Status: <strong className="font-medium text-foreground">{verificationText}</strong>
        </span>
        <span aria-hidden="true">·</span>
        <span className="font-tabular">
          Last checked: {formatDateTimeIST(property.lastCheckedAt)}
        </span>
      </div>
    </div>
  );
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'Unexpected UI error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <ErrorStatePanel
            title="Something went wrong while rendering StayAI"
            description={this.state.message}
            onRetry={() => {
              this.setState({ hasError: false, message: '' });
              window.location.href = '/';
            }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
