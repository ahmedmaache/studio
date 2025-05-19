"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserNav } from "@/components/layout/user-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-r"
      >
        <SidebarHeader className="p-4">
          <ConditionalLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* Example User Profile in Footer - adjust as needed */}
          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="Admin" data-ai-hint="user avatar"/>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-sidebar-foreground/70">admin@wilaya.dz</p>
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 group-data-[collapsible=icon]:hidden">
                <LogOut className="h-4 w-4" />
             </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" /> {/* Show trigger on mobile */}
            <h1 className="text-lg font-semibold">Wilaya Connect Admin</h1>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ConditionalLogo() {
  const { state } = useSidebar(); // state is "expanded" or "collapsed"
  if (state === "collapsed") {
    return (
      <div className="flex justify-center items-center h-full">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 16.5A2.5 2.5 0 0 0 4.5 19H8"/><path d="M16 19h3.5a2.5 2.5 0 0 0 2.5-2.5V15"/><path d="M8 19h8"/><path d="M12 4v8"/><path d="m9 9 3 3 3-3"/></svg>
      </div>
    );
  }
  return <Logo />;
}

