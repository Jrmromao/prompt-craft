import * as React from "react"
import { ChevronRight, Home, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ComponentType<{ className?: string }>
    variant?: "default" | "modern" | "minimal"
  }
>(({ className, separator: Separator = ChevronRight, variant = "modern", ...props }, ref) => {
  const baseClasses = "flex items-center gap-2 break-words text-sm"
  
  const variantClasses = {
    default: "text-muted-foreground",
    modern: "text-gray-600 dark:text-gray-400",
    minimal: "text-gray-500 dark:text-gray-500"
  }

  return (
    <nav ref={ref} aria-label="breadcrumb" {...props}>
      <ol className={cn(baseClasses, variantClasses[variant], className)}>
        {props.children}
      </ol>
    </nav>
  )
})
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol"> & {
    variant?: "default" | "modern" | "minimal"
  }
>(({ className, variant = "modern", ...props }, ref) => {
  const baseClasses = "flex items-center gap-2 break-words text-sm"
  
  const variantClasses = {
    default: "text-muted-foreground",
    modern: "text-gray-600 dark:text-gray-400",
    minimal: "text-gray-500 dark:text-gray-500"
  }

  return (
    <ol
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
})
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li"> & {
    variant?: "default" | "modern" | "minimal"
  }
>(({ className, variant = "modern", ...props }, ref) => {
  const baseClasses = "inline-flex items-center gap-2"
  
  const variantClasses = {
    default: "",
    modern: "group",
    minimal: ""
  }

  return (
    <li
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
})
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link> & {
    variant?: "default" | "modern" | "minimal"
    showIcon?: boolean
  }
>(({ className, variant = "modern", showIcon = true, children, ...props }, ref) => {
  const baseClasses = "transition-all duration-200 flex items-center gap-1.5"
  
  const variantClasses = {
    default: "hover:text-foreground",
    modern: "hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-2 py-1 rounded-md -mx-2 -my-1",
    minimal: "hover:text-gray-900 dark:hover:text-gray-100"
  }

  return (
    <Link
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {showIcon && props.href === "/" && (
        <Home className="h-4 w-4 flex-shrink-0" />
      )}
      {children}
    </Link>
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    variant?: "default" | "modern" | "minimal"
  }
>(({ className, variant = "modern", ...props }, ref) => {
  const baseClasses = "flex items-center gap-1.5"
  
  const variantClasses = {
    default: "font-normal text-foreground",
    modern: "font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-md",
    minimal: "font-medium text-gray-900 dark:text-gray-100"
  }

  return (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
})
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  variant = "modern",
  ...props
}: React.ComponentProps<"li"> & {
  variant?: "default" | "modern" | "minimal"
}) => {
  const baseClasses = "flex items-center justify-center"
  
  const variantClasses = {
    default: "[&>svg]:size-3.5 text-muted-foreground",
    modern: "[&>svg]:size-4 text-gray-400 dark:text-gray-500",
    minimal: "[&>svg]:size-3 text-gray-400"
  }

  const iconClasses = {
    default: "h-3.5 w-3.5",
    modern: "h-4 w-4",
    minimal: "h-3 w-3"
  }

  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children ?? (
        variant === "modern" ? (
          <ArrowRight className={iconClasses[variant]} />
        ) : (
          <ChevronRight className={iconClasses[variant]} />
        )
      )}
    </li>
  )
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

// New modern breadcrumb component with enhanced styling
const ModernBreadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    items: Array<{
      label: string
      href?: string
      icon?: React.ComponentType<{ className?: string }>
      current?: boolean
    }>
  }
>(({ className, items, ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" {...props}>
    <ol className={cn("flex items-center gap-1 text-sm", className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <li className="flex items-center gap-1.5">
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-1.5 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-2 py-1 rounded-md -mx-2 -my-1 group"
              >
                {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span
                className={cn(
                  "flex items-center gap-1.5 font-medium",
                  item.current
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-md"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                {item.label}
              </span>
            )}
          </li>
          {index < items.length - 1 && (
            <li className="flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </li>
          )}
        </React.Fragment>
      ))}
    </ol>
  </nav>
))
ModernBreadcrumb.displayName = "ModernBreadcrumb"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  ModernBreadcrumb,
}
