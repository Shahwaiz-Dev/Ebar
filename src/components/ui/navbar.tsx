import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const navbarVariants = cva(
  "flex items-center justify-between w-full",
  {
    variants: {
      variant: {
        default: "bg-background border-b",
        transparent: "bg-transparent",
        glass: "bg-background/80 backdrop-blur-sm border-b",
      },
      size: {
        default: "h-16 px-4",
        sm: "h-12 px-3",
        lg: "h-20 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface NavbarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, variant, size, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(navbarVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Navbar.displayName = "Navbar"

const NavbarBrand = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
))
NavbarBrand.displayName = "NavbarBrand"

const NavbarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4", className)}
    {...props}
  />
))
NavbarContent.displayName = "NavbarContent"

const NavbarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  />
))
NavbarItem.displayName = "NavbarItem"

const NavbarLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    active?: boolean
  }
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
      active && "bg-accent text-accent-foreground",
      className
    )}
    {...props}
  />
))
NavbarLink.displayName = "NavbarLink"

const NavbarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:hidden",
      className
    )}
    {...props}
  />
))
NavbarToggle.displayName = "NavbarToggle"

const NavbarCollapse = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean
  }
>(({ className, isOpen, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-x-0 top-16 z-50 bg-background/95 backdrop-blur-sm border-b md:static md:top-auto md:z-auto md:border-0 md:bg-transparent md:backdrop-blur-none",
      isOpen ? "block" : "hidden md:block",
      className
    )}
    {...props}
  />
))
NavbarCollapse.displayName = "NavbarCollapse"

const NavbarCollapseContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2 p-4 md:flex-row md:p-0", className)}
    {...props}
  />
))
NavbarCollapseContent.displayName = "NavbarCollapseContent"

export {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarLink,
  NavbarToggle,
  NavbarCollapse,
  NavbarCollapseContent,
} 