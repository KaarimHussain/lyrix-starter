import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-100 outline-none select-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-2 border-[color-mix(in_oklch,var(--color-primary)_40%,black)] bg-primary text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--color-primary)_40%,black)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_color-mix(in_oklch,var(--color-primary)_40%,black)] active:translate-y-1 active:shadow-[0_0px_0_0_color-mix(in_oklch,var(--color-primary)_40%,black)]",
        destructive:
          "border-2 border-[color-mix(in_oklch,var(--color-destructive)_40%,black)] bg-destructive text-destructive-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--color-destructive)_40%,black)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_color-mix(in_oklch,var(--color-destructive)_40%,black)] active:translate-y-1 active:shadow-[0_0px_0_0_color-mix(in_oklch,var(--color-destructive)_40%,black)]",
        outline:
          "border-2 border-foreground bg-transparent text-foreground shadow-[0_4px_0_0_var(--color-foreground)] hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_0_0_var(--color-foreground)] active:translate-y-1 active:shadow-[0_0px_0_0_var(--color-foreground)]",
        secondary:
          "border-2 border-[color-mix(in_oklch,var(--color-secondary)_40%,black)] bg-secondary text-secondary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--color-secondary)_40%,black)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_color-mix(in_oklch,var(--color-secondary)_40%,black)] active:translate-y-1 active:shadow-[0_0px_0_0_color-mix(in_oklch,var(--color-secondary)_40%,black)]",
        ghost:
          "border-2 border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:translate-y-1",
        link: "text-primary underline-offset-4 hover:underline active:translate-y-1",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4",
        xs: "h-8 px-3 py-1 text-xs has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 px-4 py-1.5 text-xs has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-14 px-8 py-3 text-base has-[>svg]:px-6",
        icon: "size-11",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
