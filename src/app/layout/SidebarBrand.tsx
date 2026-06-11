import { Link } from "@tanstack/react-router";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/kit";
import type { SidebarBrand as SidebarBrandConfig } from "./types";

type SidebarBrandProps = {
  brand: SidebarBrandConfig;
};

export function SidebarBrand({ brand }: SidebarBrandProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild tooltip={brand.name}>
          <Link to="/app/dashboard">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <brand.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-semibold">{brand.name}</span>
              <span className="truncate text-muted-foreground text-xs">
                {brand.tagline}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
