"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Mail,
  ShoppingBag,
  Link2,
  Eye,
  LayoutDashboard,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "purple",
  },
  {
    href: "/admin/posts",
    label: "Posts",
    icon: FileText,
    color: "blue",
  },
  {
    href: "/admin/email-marketing",
    label: "Email",
    icon: Mail,
    color: "yellow",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: ShoppingBag,
    color: "orange",
  },
  {
    href: "/admin/affiliates",
    label: "Affiliates",
    icon: Link2,
    color: "green",
  },
  {
    href: "/admin/import",
    label: "Import",
    icon: Upload,
    color: "gray",
  },
  {
    href: "/blog",
    label: "View Blog",
    icon: Eye,
    color: "default",
    external: true,
  },
]

const colorClasses: Record<string, { border: string; hover: string; icon: string }> = {
  purple: {
    border: "border-purple-500/30",
    hover: "hover:bg-purple-500/10",
    icon: "text-purple-500",
  },
  blue: {
    border: "border-blue-500/30",
    hover: "hover:bg-blue-500/10",
    icon: "text-blue-500",
  },
  yellow: {
    border: "border-yellow-500/30",
    hover: "hover:bg-yellow-500/10",
    icon: "text-yellow-500",
  },
  orange: {
    border: "border-orange-500/30",
    hover: "hover:bg-orange-500/10",
    icon: "text-orange-500",
  },
  green: {
    border: "border-green-500/30",
    hover: "hover:bg-green-500/10",
    icon: "text-green-500",
  },
  gray: {
    border: "border-gray-500/30",
    hover: "hover:bg-gray-500/10",
    icon: "text-gray-500",
  },
  default: {
    border: "",
    hover: "",
    icon: "",
  },
}

interface AdminNavProps {
  className?: string
  compact?: boolean
}

export function AdminNav({ className, compact = false }: AdminNavProps) {
  const pathname = usePathname()

  if (compact) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {navItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(item.href) && item.href !== "/admin"
          const colors = colorClasses[item.color]
          const Icon = item.icon

          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                !isActive && colors.border,
                !isActive && colors.hover,
              )}
              asChild
            >
              <Link href={item.href} target={item.external ? "_blank" : undefined}>
                <Icon className={cn("mr-2 h-4 w-4", !isActive && colors.icon)} />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-7", className)}>
      {navItems.map((item) => {
        const isActive = item.href === "/admin"
          ? pathname === "/admin"
          : pathname?.startsWith(item.href) && item.href !== "/admin"
        const colors = colorClasses[item.color]
        const Icon = item.icon

        return (
          <Button
            key={item.href}
            variant="outline"
            className={cn(
              "h-auto py-4",
              colors.border,
              colors.hover,
              isActive && "bg-secondary ring-2 ring-primary/20"
            )}
            asChild
          >
            <Link href={item.href} target={item.external ? "_blank" : undefined}>
              <div className="flex flex-col items-center gap-2">
                <Icon className={cn("h-6 w-6", colors.icon)} />
                <span>{item.label}</span>
              </div>
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
