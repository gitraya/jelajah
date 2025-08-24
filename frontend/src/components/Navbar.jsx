import { LucideLogOut } from "lucide-react";
import { Link, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { pathname } = useLocation();
  const { logout, isAuthenticated } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <header className="w-full flex justify-center border-b bg-background sticky top-0 z-50">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 py-3 sm:py-0 sm:px-4 sm:h-16">
        <Link to="/" className="text-xl font-bold text-blue-800">
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
                    ? "text-blue-800 font-medium"
                    : "text-muted-foreground hover:text-blue-800"
                )}
              >
                <Link to="/trips">Trip</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                {isAuthenticated ? (
                  <Link to="/trips/new" className="hover:bg-transparent">
                    <Button size="sm" className="rounded-md">
                      + New Trip
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" className="hover:bg-transparent">
                    <Button size="sm" className="rounded-md">
                      Login
                    </Button>
                  </Link>
                )}
              </NavigationMenuLink>
            </NavigationMenuItem>
            {isAuthenticated && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Button size="sm" className="rounded-md" onClick={logout}>
                    <LucideLogOut color="white" />
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
