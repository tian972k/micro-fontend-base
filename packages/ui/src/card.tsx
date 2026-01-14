import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    gradient?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, gradient, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md",
                gradient && "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black",
                className
            )}
            {...props}
        />
    )
)
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
    )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
)
CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
    )
)
CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    )
)
CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
    )
)
CardFooter.displayName = "CardFooter"
