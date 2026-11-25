import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface HotelImageProps {
  src: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  aspectClassName?: string;
}

export function HotelImage({
  src,
  alt,
  fallbackTitle,
  className,
  aspectClassName = 'aspect-[4/3]',
}: HotelImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#ECE8DF] via-[#F3F1EC] to-[#E2DDD2] text-navy/70 p-4 text-center',
          aspectClassName,
          className
        )}
      >
        <Building2 className="h-7 w-7 text-primary/70 mb-2" aria-hidden="true" />
        <span className="font-display text-sm font-medium text-foreground max-w-[200px] truncate">
          {fallbackTitle ?? alt}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">
          Architectural preview
        </span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-secondary', aspectClassName, className)}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-300 ease-out"
      />
    </div>
  );
}
