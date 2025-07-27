import { Link, useLocation } from "react-router";

import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path;

  return (
    <header className="w-full flex justify-center border-b bg-background sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-primary">
          Jelajah
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  "text-sm transition-colors",
                  isActive("/trips")
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Link to="/trips">Trip</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/trips/new"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "rounded-md"
                  )}
                >
                  + Buat Trip
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
