import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Monitor, MessageSquare, Calendar, Map, CreditCard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("GuestInterface"),
    icon: Monitor,
    description: "Welcome screen"
  },
  {
    title: "Call Front Desk",
    url: createPageUrl("VideoChat"),
    icon: MessageSquare,
    description: "Video call staff"
  },
  {
    title: "Hotel Map",
    url: createPageUrl("HotelMap"),
    icon: Map,
    description: "Find your way around"
  },
  {
    title: "Amenity Bookings",
    url: createPageUrl("Bookings"),
    icon: Calendar,
    description: "Reserve amenities"
  },
  {
    title: "My Bill",
    url: createPageUrl("PaymentCheck"),
    icon: CreditCard,
    description: "View pending charges"
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <Sidebar className="border-r border-blue-100 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-blue-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">🏔️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">The Rockies Lodge</h2>
                <p className="text-sm text-gray-500">Guest Services</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <div className="flex-1">
                            <span className="font-semibold">{item.title}</span>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-blue-100 p-6">
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm">🏔️ The Rockies Lodge</p>
              <p className="text-xs text-gray-500">1 Alpine Drive, Canmore, AB</p>
              <p className="text-xs text-blue-600 font-medium mt-1">Front Desk: Dial 0 · Open 24/7</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-xl transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">The Rockies Lodge</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
