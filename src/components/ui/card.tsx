import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-2xl border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] container-type-inline-size",
  {
    variants: {
      variant: {
        default: "border-linen-200 bg-white shadow-soft hover:shadow-soft-lg",
        elevated: "border-linen-300 bg-white shadow-soft-lg hover:shadow-glow",
        nutrition: "border-sage-200 bg-gradient-to-br from-white to-sage-50 shadow-soft hover:shadow-glow hover:border-sage-300",
        premium: "border-turmeric-200 bg-gradient-to-br from-white via-turmeric-50 to-linen-50 shadow-soft-lg hover:shadow-glow",
        interactive: "border-linen-200 bg-white shadow-soft hover:shadow-soft-lg hover:bg-linen-50 cursor-pointer",
      },
      size: {
        sm: "p-3",
        default: "p-6", 
        lg: "p-8",
        xl: "p-10",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, size, className }))}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display text-xl font-medium leading-tight tracking-tight text-sage-900 text-balance",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-sage-600 leading-relaxed text-pretty", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pb-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between gap-2 px-6 pb-6", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Composants spécialisés nutrition avec container queries
const NutritionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "recipe" | "meal" | "score" | "tip" | "program"
  }
>(({ className, variant = "recipe", ...props }, ref) => {
  const variantStyles = {
    recipe: "border-turmeric-200 bg-gradient-to-br from-white to-turmeric-50 hover:from-turmeric-50 hover:to-turmeric-100",
    meal: "border-sage-200 bg-gradient-to-br from-white to-sage-50 hover:from-sage-50 hover:to-sage-100",
    score: "border-linen-200 bg-gradient-to-br from-white to-linen-50 hover:from-linen-50 hover:to-linen-100",
    tip: "border-success-200 bg-gradient-to-br from-white to-success-50 hover:from-success-50 hover:to-success-100",
    program: "border-turmeric-300 bg-gradient-to-br from-turmeric-50 via-white to-sage-50 hover:shadow-glow"
  }

  return (
    <Card
      ref={ref}
      variant="interactive"
      className={cn(
        variantStyles[variant], 
        // Container queries pour responsive design
        "container-xs:p-4 container-md:p-6 container-lg:p-8",
        className
      )}
      {...props}
    />
  )
})
NutritionCard.displayName = "NutritionCard"

// Composant Card pour les métriques
const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    metric: string
    value: string | number
    trend?: "up" | "down" | "stable"
    icon?: React.ReactNode
  }
>(({ className, metric, value, trend, icon, ...props }, ref) => (
  <Card
    ref={ref}
    variant="elevated"
    size="sm"
    className={cn(
      "text-center relative overflow-hidden group",
      className
    )}
    {...props}
  >
    {icon && (
      <div className="absolute top-3 right-3 text-sage-400 group-hover:text-sage-600 transition-colors">
        {icon}
      </div>
    )}
    <div className="space-y-2">
      <p className="text-sm font-medium text-sage-600 uppercase tracking-wide">
        {metric}
      </p>
      <p className="text-2xl font-display font-semibold text-sage-900">
        {value}
      </p>
      {trend && (
        <div className={cn(
          "text-xs flex items-center justify-center gap-1",
          trend === "up" && "text-success-600",
          trend === "down" && "text-danger-600",
          trend === "stable" && "text-sage-500"
        )}>
          {trend === "up" && "↗"}
          {trend === "down" && "↘"}
          {trend === "stable" && "→"}
          <span className="capitalize">{trend}</span>
        </div>
      )}
    </div>
  </Card>
))
MetricCard.displayName = "MetricCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  NutritionCard,
  MetricCard,
  cardVariants,
}