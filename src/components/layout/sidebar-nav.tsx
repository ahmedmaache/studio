"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Megaphone,
  PlusSquare,
  Users,
  Send,
  BellRing,
} from "lucide-react";

const navItems = [
  {
    href: "/admin/dashboard",
    icon: <LayoutDashboard />,
    label: "Dashboard",
    tooltip: "Dashboard",
  },
  {
    href: "/admin/announcements",
    icon: <Megaphone />,
    label: "Announcements",
    tooltip: "Manage Announcements",
  },
  {
    href: "/admin/announcements/new",
    icon: <PlusSquare />,
    label: "New Announcement",
    tooltip: "Create Announcement",
  },
  {
    href: "/admin/subscriptions",
    icon: <BellRing />,
    label: "Subscriptions",
    tooltip: "Citizen Subscriptions",
  },
  {
    href: "/admin/communication",
    icon: <Send />,
    label: "Communication",
    tooltip: "InfoCitoyen Connect",
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))}
              tooltip={item.tooltip}
              className="justify-start"
            >
              <a> {/* Link child needs to be an <a> tag for styling from SidebarMenuButton */}
                {item.icon}
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
