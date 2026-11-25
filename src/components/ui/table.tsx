import * as React from 'react';
import { cn } from '@/src/lib/utils';

export function DataTable({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-border bg-card', className)}>
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-secondary/70 text-xs font-medium text-muted-foreground">
      {children}
    </thead>
  );
}

export function DataTableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-border/70 last:border-b-0 transition-colors hover:bg-secondary/40',
        className
      )}
      {...props}
    />
  );
}

export function DataTableTh({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-4 py-3 font-medium whitespace-nowrap', className)}
      {...props}
    />
  );
}

export function DataTableTd({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 align-middle text-foreground', className)} {...props} />
  );
}
