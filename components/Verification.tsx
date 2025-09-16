"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Shield,
  User,
  Building,
  Car,
  UtensilsCrossed,
  Palette,
} from "lucide-react";
import { FC } from "react";

interface VerificationProps {
  isMobile?: boolean;
}

const Verification: FC<VerificationProps> = ({ isMobile = false }) => {
  const baseButtonClass = isMobile
    ? "w-full justify-start hover:text-blue-600 transition"
    : "hover:text-blue-600 transition";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`${baseButtonClass} flex items-center gap-2`}
        >
          <Shield className="h-4 w-4" />
          Verification
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Get Verified
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Guide Verification */}
        <DropdownMenuItem asChild>
          <Link
            href="/verification/guide"
            className="flex items-center gap-3 cursor-pointer"
          >
            <User className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-medium">Guide Verification</div>
              <div className="text-sm text-muted-foreground">
                Verify your credentials as a tour guide
              </div>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Service Provider Verification with Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-3">
            <Building className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-medium">Service Provider Verification</div>
              <div className="text-sm text-muted-foreground">
                Verify your business services
              </div>
            </div>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-64">
            <DropdownMenuLabel>Choose Service Type</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Hotels & Accommodations */}
            <DropdownMenuItem asChild>
              <Link
                href="/verification/service-provider/hotels"
                className="flex items-center gap-3 cursor-pointer"
              >
                <Building className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="font-medium">Hotels & Accommodations</div>
                  <div className="text-xs text-muted-foreground">
                    Hotels, homestays, guesthouses
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>

            {/* Transportation Services */}
            <DropdownMenuItem asChild>
              <Link
                href="/verification/service-provider/transportation"
                className="flex items-center gap-3 cursor-pointer"
              >
                <Car className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="font-medium">Transportation Services</div>
                  <div className="text-xs text-muted-foreground">
                    Taxi, bus, vehicle rentals
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>

            {/* Food & Dining Services */}
            <DropdownMenuItem asChild>
              <Link
                href="/verification/service-provider/food"
                className="flex items-center gap-3 cursor-pointer"
              >
                <UtensilsCrossed className="h-4 w-4 text-red-600" />
                <div>
                  <div className="font-medium">Food & Dining Services</div>
                  <div className="text-xs text-muted-foreground">
                    Restaurants, local food vendors
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>

            {/* Activity & Experience Providers */}
            <DropdownMenuItem asChild>
              <Link
                href="/verification/service-provider/activities"
                className="flex items-center gap-3 cursor-pointer"
              >
                <Palette className="h-4 w-4 text-teal-600" />
                <div>
                  <div className="font-medium">Activity & Experience</div>
                  <div className="text-xs text-muted-foreground">
                    Cultural shows, adventure activities
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Verification;
