import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input, Label, NativeSelect } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Switch } from '@/src/components/ui/controls';
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from '@/src/components/ui/table';
import { StatusText } from '@/src/components/shared/StatePanels';
import { formatDateTimeIST, formatINR } from '@/src/lib/format';
import { useAppState } from '@/src/context/AppStateContext';
import { useAuth } from '@/src/context/AuthContext';

export function AdminPaymentsPage() {
  const { payments, webhooks } = useAppState();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">
          Payments & Webhook Verification Log
        </h1>
        <p className="text-sm text-muted-foreground">
          Server-verified Razorpay transactions and raw-body HMAC-SHA256 webhook deduplication ledger.
        </p>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Payment ID</DataTableTh>
            <DataTableTh>Booking</DataTableTh>
            <DataTableTh>Mode</DataTableTh>
            <DataTableTh>Verified Server-Side</DataTableTh>
            <DataTableTh>Status</DataTableTh>
            <DataTableTh className="text-right">Amount</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {payments.map((p) => (
            <DataTableRow key={p.id}>
              <DataTableTd className="font-tabular text-xs">{p.id}</DataTableTd>
              <DataTableTd className="font-tabular text-xs">{p.bookingReference}</DataTableTd>
              <DataTableTd className="text-xs capitalize">{p.mode}</DataTableTd>
              <DataTableTd className="text-xs">{p.verifiedServerSide ? 'Yes' : 'No (Demo)'}</DataTableTd>
              <DataTableTd>
                <StatusText
                  tone={p.status === 'refunded' ? 'success' : 'warning'}
                  label={p.status}
                />
              </DataTableTd>
              <DataTableTd className="text-right font-tabular font-medium">
                {formatINR(p.amountInr)}
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>

      <div>
        <h2 className="text-base font-semibold text-navy mb-3">
          Webhook Idempotency & Signature Log (Sample)
        </h2>
        <DataTable>
          <DataTableHead>
            <tr>
              <DataTableTh>Provider Event ID</DataTableTh>
              <DataTableTh>Event Type</DataTableTh>
              <DataTableTh>Raw-Body Signature</DataTableTh>
              <DataTableTh>Outcome</DataTableTh>
              <DataTableTh className="text-right">Processed At</DataTableTh>
            </tr>
          </DataTableHead>
          <tbody>
            {webhooks.map((w) => (
              <DataTableRow key={w.id}>
                <DataTableTd className="font-tabular text-xs">{w.providerEventId}</DataTableTd>
                <DataTableTd className="font-tabular text-xs">{w.eventType}</DataTableTd>
                <DataTableTd>
                  <StatusText
                    tone={w.signatureVerified ? 'success' : 'danger'}
                    label={w.signatureVerified ? 'Verified' : 'Invalid Rejected'}
                  />
                </DataTableTd>
                <DataTableTd className="text-xs">{w.status.replaceAll('_', ' ')}</DataTableTd>
                <DataTableTd className="text-right font-tabular text-xs text-muted-foreground">
                  {formatDateTimeIST(w.processedAt)}
                </DataTableTd>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      </div>
    </div>
  );
}

export function AdminRefundsPage() {
  const { refunds } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Refunds & Compensations</h1>
        <p className="text-sm text-muted-foreground">
          Track full/partial refunds and automatic compensation if payment succeeds after hold expiry.
        </p>
      </div>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Refund ID</DataTableTh>
            <DataTableTh>Booking</DataTableTh>
            <DataTableTh>Guest</DataTableTh>
            <DataTableTh>Reason</DataTableTh>
            <DataTableTh>Status</DataTableTh>
            <DataTableTh className="text-right">Amount</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {refunds.map((r) => (
            <DataTableRow key={r.id}>
              <DataTableTd className="font-tabular text-xs">{r.id}</DataTableTd>
              <DataTableTd className="font-tabular text-xs">{r.bookingReference}</DataTableTd>
              <DataTableTd className="text-sm">{r.guestName}</DataTableTd>
              <DataTableTd className="text-xs text-muted-foreground max-w-xs">{r.reason}</DataTableTd>
              <DataTableTd>
                <StatusText tone="success" label={`${r.status} (demo)`} />
              </DataTableTd>
              <DataTableTd className="text-right font-tabular font-medium">
                {formatINR(r.amountInr)}
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

export function AdminComplaintsPage() {
  const { tickets, updateTicketStatusPreview } = useAppState();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">Support Tickets & Complaints</h1>
        <p className="text-sm text-muted-foreground">
          Investigate guest disputes, billing questions, and property policy escalations.
        </p>
      </div>
      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Ticket</DataTableTh>
            <DataTableTh>User</DataTableTh>
            <DataTableTh>Subject</DataTableTh>
            <DataTableTh>Priority</DataTableTh>
            <DataTableTh className="text-right">Status</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {tickets.map((t) => (
            <DataTableRow key={t.id}>
              <DataTableTd className="font-tabular text-xs font-medium">{t.id}</DataTableTd>
              <DataTableTd className="text-sm">{t.userName}</DataTableTd>
              <DataTableTd>
                <div className="text-sm text-navy">{t.subject}</div>
                <div className="text-xs text-muted-foreground">{t.category}</div>
              </DataTableTd>
              <DataTableTd className="capitalize text-xs">{t.priority}</DataTableTd>
              <DataTableTd className="text-right">
                <NativeSelect
                  aria-label={`Status for ticket ${t.id}`}
                  value={t.status}
                  onChange={(e) => {
                    updateTicketStatusPreview(t.id, e.target.value as typeof t.status);
                    toast.success(`Ticket ${t.id} updated (preview)`);
                  }}
                  className="w-32 h-8 text-xs inline-block"
                >
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                </NativeSelect>
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

const commissionSchema = z.object({
  defaultCommissionPercent: z.number().min(0).max(30),
  luxuryCommissionPercent: z.number().min(0).max(30),
  inventoryHoldMinutes: z.number().min(5).max(30),
});

export function AdminCommissionPage() {
  const { settings, updateSettingsPreview } = useAppState();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof commissionSchema>>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      defaultCommissionPercent: settings.defaultCommissionPercent,
      luxuryCommissionPercent: settings.luxuryCommissionPercent,
      inventoryHoldMinutes: settings.inventoryHoldMinutes,
    },
  });

  const onSubmit = (values: z.infer<typeof commissionSchema>) => {
    updateSettingsPreview(values);
    toast.success('Commission & hold settings updated (preview + audit logged)');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">
          Commission & Feature Flags
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform commission rates, inventory hold TTL, and feature flags.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commercial Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="adm-comm">Standard Commission (%)</Label>
                <Input id="adm-comm" type="number" className="font-tabular" {...register('defaultCommissionPercent', { valueAsNumber: true })} />
                {errors.defaultCommissionPercent && (
                  <p className="mt-1 text-xs text-destructive">{errors.defaultCommissionPercent.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="adm-lux">5-Star Commission (%)</Label>
                <Input id="adm-lux" type="number" className="font-tabular" {...register('luxuryCommissionPercent', { valueAsNumber: true })} />
              </div>
              <div>
                <Label htmlFor="adm-ttl">Hold TTL (minutes)</Label>
                <Input id="adm-ttl" type="number" className="font-tabular" {...register('inventoryHoldMinutes', { valueAsNumber: true })} />
              </div>
            </div>
            <Button type="submit">Save Commercial Settings</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Flags (Preview Controls)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">Single-use fixed-amount UPI QR</div>
              <div className="text-xs text-muted-foreground">Feature-flagged Razorpay UPI QR checkout.</div>
            </div>
            <Switch
              checked={settings.upiQrEnabled}
              onCheckedChange={(v) => updateSettingsPreview({ upiQrEnabled: v })}
            />
          </div>
          <div className="flex items-center justify-between gap-4 opacity-70">
            <div>
              <div className="text-sm font-medium text-foreground">OTA Inventory Adapter</div>
              <div className="text-xs text-muted-foreground">Locked off without authorized OTA partner credentials.</div>
            </div>
            <Switch checked={false} disabled />
          </div>
          <div className="flex items-center justify-between gap-4 opacity-70">
            <div>
              <div className="text-sm font-medium text-foreground">Marketplace Payouts</div>
              <div className="text-xs text-muted-foreground">Disabled pending formal Razorpay Route compliance approval.</div>
            </div>
            <Switch checked={false} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminHealthAuditPage() {
  const { settings, auditLogs, serverHealth } = useAppState();
  const { firestoreStatus } = useAuth();

  const integrations = [
    { name: 'Runtime Mode', status: 'Active (Universal Access · Instant Booking)', tone: 'success' as const },
    {
      name: 'Firebase Auth & Firestore',
      status:
        firestoreStatus === 'connected'
          ? 'Connected (Hardened Rules Deployed)'
          : firestoreStatus === 'offline'
            ? 'Offline / Check Configuration'
            : 'Checking connection...',
      tone:
        firestoreStatus === 'connected'
          ? ('success' as const)
          : ('warning' as const),
    },
    {
      name: 'Gemini AI (@google/genai server)',
      status: serverHealth.geminiConfigured
        ? 'Connected (Server-Only + Search Grounding)'
        : 'Not configured (GEMINI_API_KEY missing)',
      tone: serverHealth.geminiConfigured ? ('success' as const) : ('warning' as const),
    },
    {
      name: 'Google Maps Platform',
      status: serverHealth.mapsConfigured
        ? 'Configured (@vis.gl/react-google-maps)'
        : 'Not configured (VITE_GOOGLE_MAPS_API_KEY unset)',
      tone: serverHealth.mapsConfigured ? ('success' as const) : ('neutral' as const),
    },
    { name: 'Firebase Storage Uploads', status: settings.storageUploadsEnabled ? 'Enabled' : 'Not configured (Feature-flagged)', tone: 'warning' as const },
    { name: 'Razorpay Payments & Webhooks', status: 'Not configured · Test Mode', tone: 'warning' as const },
    { name: 'OTA Inventory Adapter', status: 'Disabled (No partner access)', tone: 'neutral' as const },
    { name: 'Email & SMS Providers', status: 'Not configured (In-app active)', tone: 'neutral' as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-navy">
          System Health & Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Honest configuration readiness across integrations and append-only security audit records.
        </p>
      </div>

      <DataTable>
        <DataTableHead>
          <tr>
            <DataTableTh>Service / Subsystem</DataTableTh>
            <DataTableTh className="text-right">Current Status</DataTableTh>
          </tr>
        </DataTableHead>
        <tbody>
          {integrations.map((item) => (
            <DataTableRow key={item.name}>
              <DataTableTd className="font-medium text-navy">{item.name}</DataTableTd>
              <DataTableTd className="text-right">
                <StatusText tone={item.tone} label={item.status} />
              </DataTableTd>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>

      <div>
        <h2 className="text-base font-semibold text-navy mb-3">
          Immutable Audit Log Viewer (Demo Preview)
        </h2>
        <DataTable>
          <DataTableHead>
            <tr>
              <DataTableTh>Timestamp (IST)</DataTableTh>
              <DataTableTh>Actor</DataTableTh>
              <DataTableTh>Action</DataTableTh>
              <DataTableTh>Outcome</DataTableTh>
              <DataTableTh>Details</DataTableTh>
            </tr>
          </DataTableHead>
          <tbody>
            {auditLogs.map((log) => (
              <DataTableRow key={log.id}>
                <DataTableTd className="font-tabular text-xs whitespace-nowrap text-muted-foreground">
                  {formatDateTimeIST(log.timestamp)}
                </DataTableTd>
                <DataTableTd className="text-xs capitalize">{log.actorRole}</DataTableTd>
                <DataTableTd className="font-tabular text-xs font-medium text-navy">
                  {log.action}
                </DataTableTd>
                <DataTableTd>
                  <StatusText
                    tone={
                      log.outcome === 'denied'
                        ? 'danger'
                        : log.outcome === 'allowed'
                          ? 'success'
                          : 'neutral'
                    }
                    label={log.outcome}
                  />
                </DataTableTd>
                <DataTableTd className="text-xs text-muted-foreground max-w-md">
                  {log.details}
                </DataTableTd>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      </div>
    </div>
  );
}
