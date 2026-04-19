import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FilePlus2, Plug, Leaf, Settings as SettingsIcon, MapPin } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Data Entry", url: "/entry", icon: FilePlus2 },
  { title: "Appliances", url: "/appliances", icon: Plug },
];

export function AppSidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display font-bold text-sidebar-foreground leading-tight truncate">
                Smart Energy Tracker
              </p>
              <p className="text-[11px] text-muted-foreground">Eco dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <RouterNavLink to={item.url} end className="transition-smooth">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </RouterNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-2 p-2">
            <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-2.5">
              <Avatar className="h-9 w-9 ring-2 ring-primary/30">
                <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                  RJ
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">Rishabh Jain</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Agra
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={onOpenSettings}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-2">
            <Avatar className="h-8 w-8 ring-2 ring-primary/30">
              <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                RJ
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={onOpenSettings} className="h-8 w-8">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
