import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';

const stayButtonStyles = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-teal-deep',
        navy: 'bg-navy text-white hover:bg-navy-soft',
        outline:
          'border border-border bg-card text-foreground hover:bg-secondary',
        ghost: 'text-foreground hover:bg-secondary',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-red-800',
        link: 'text-primary underline-offset-4 hover:underline px-0 py-0',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-11 px-6 text-sm',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof stayButtonStyles> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(stayButtonStyles({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
