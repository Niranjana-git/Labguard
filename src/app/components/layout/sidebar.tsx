
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  BookUser,
  Bot,
  Settings,
  Users,
  FileText,
  Book,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LabGuardLogo } from "@/app/components/icons";
import { cn } from "@/lib/utils";

const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Admin Dashboard", roles: ["Admin"] },
  { href: "/users", icon: Users, label: "Users", roles: ["Admin"] },
  { href: "/reports", icon: FileText, label: "Reports", roles: ["Admin"] },
  { href: "/guidebook", icon: Book, label: "Guidebook", roles: ["Admin", "Technician", "Teacher"]},
  { href: "/technician", icon: Wrench, label: "Technician Dashboard", roles: ["Technician"] },
  { href: "/technician/alerts", icon: AlertTriangle, label: "Technician Alerts", roles: ["Technician"] },
  { href: "/teacher", icon: BookUser, label: "Teacher Dashboard", roles: ["Teacher"] },
  { href: "/ai-tools", icon: Bot, label: "AI Tools", roles: ["Admin", "Technician"] },
  { href: "/chatroom", icon: MessageSquare, label: "Chatroom", roles: ["Admin", "Technician", "Teacher"] },
];

export function AppSidebar({ userRole }: { userRole: string | null }) {
  const pathname = usePathname();

  const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <LabGuardLogo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">LabGuard Pro</span>
          </Link>

          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    pathname.startsWith(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
