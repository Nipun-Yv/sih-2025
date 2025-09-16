"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { UserRole } from "@/types/User";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleBasedRoute({ 
  allowedRoles, 
  children, 
  fallback 
}: RoleBasedRouteProps) {
  const { isLoaded, isSignedIn, hasRole, userMetadata } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && isSignedIn && !userMetadata?.role) {
      router.push("/select-role");
      return;
    }

    if (isLoaded && isSignedIn && userMetadata?.role) {
      const hasAccess = allowedRoles.some(role => hasRole(role));
      if (!hasAccess) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isLoaded, isSignedIn, userMetadata, hasRole, allowedRoles, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn || !userMetadata?.role) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasAccess = allowedRoles.some(role => hasRole(role));
  if (!hasAccess) {
    return fallback || (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
