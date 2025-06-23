import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-sage-600 text-white shadow-soft hover:bg-sage-700 hover:shadow-soft-lg active:scale-[0.98] hover:scale-[1.02]",
        secondary:
          "bg-turmeric-500 text-white shadow-soft hover:bg-turmeric-600 hover:shadow-soft-lg active:scale-[0.98] hover:scale-[1.02]",
        outline:
          "border-2 border-sage-200 bg-transparent text-sage-700 shadow-soft hover:bg-sage-50 hover:border-sage-300 hover:shadow-soft-lg active:scale-[0.98]",
        ghost: 
          "text-sage-700 hover:bg-sage-50 hover:text-sage-800 active:scale-[0.98]",
        link: 
          "text-sage-600 underline-offset-4 hover:underline hover:text-sage-700 active:scale-[0.98]",
        success:
          "bg-success-600 text-white shadow-soft hover:bg-success-700 hover:shadow-soft-lg active:scale-[0.98] hover:scale-[1.02]",
        warning:
          "bg-warning-600 text-white shadow-soft hover:bg-warning-700 hover:shadow-soft-lg active:scale-[0.98] hover:scale-[1.02]",
        danger:
          "bg-danger-600 text-white shadow-soft hover:bg-danger-700 hover:shadow-soft-lg active:scale-[0.98] hover:scale-[1.02]",
        nutrition:
          "bg-gradient-to-r from-sage-500 to-turmeric-500 text-white shadow-soft hover:from-sage-600 hover:to-turmeric-600 hover:shadow-glow active:scale-[0.98] hover:scale-[1.02]",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-4 py-2 rounded-md",
        lg: "h-12 px-8 text-base rounded-lg",
        xl: "h-14 px-10 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            <span className="sr-only">Chargement...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children && <span className="flex-1">{children}</span>}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };