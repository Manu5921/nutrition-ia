import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-11 w-full rounded-xl border border-linen-200 bg-white px-4 py-2 text-sm text-sage-900 placeholder:text-sage-400 transition-all duration-200",
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-linen-50",
          // Error state
          error && "border-danger-300 focus:ring-danger-400",
          // Success state
          success && "border-success-300 focus:ring-success-400",
          // Hover state
          "hover:border-linen-300",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-sage-700",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Composant Input avec label intégré pour les formulaires nutritionnels
const LabeledInput = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    label: string
    description?: string
    unit?: string
  }
>(({ className, label, description, unit, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-sage-700">
        {label}
        {props.required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <Input
          ref={ref}
          className={cn(unit && "pr-12", className)}
          {...props}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm text-sage-500 font-medium">{unit}</span>
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-sage-500">{description}</p>
      )}
    </div>
  )
})
LabeledInput.displayName = "LabeledInput"

// Input de recherche spécialisé pour les aliments
const SearchInput = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    onClear?: () => void
  }
>(({ className, onClear, ...props }, ref) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-sage-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <Input
        ref={ref}
        className={cn("pl-10 pr-10", className)}
        {...props}
      />
      {props.value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-sage-700"
        >
          <svg
            className="h-4 w-4 text-sage-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
})
SearchInput.displayName = "SearchInput"

export { Input, LabeledInput, SearchInput }