import { useUser } from "@clerk/nextjs";
import { UserRole,VendorType,UserMetadata } from "../../types/User";

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  
  const userMetadata = (user?.publicMetadata as unknown) as UserMetadata;

  const hasRole = (role: UserRole): boolean => {
    return userMetadata?.role === role;
  };
  
  const hasVendorType = (vendorType: VendorType): boolean => {
    return userMetadata?.vendorType === vendorType;
  };
  
  const isAdmin = hasRole(UserRole.ADMIN);
  const isVendor = hasRole(UserRole.VENDOR);
  const isTourist = hasRole(UserRole.TOURIST);
  
  return {
    user,
    isLoaded,
    isSignedIn,
    userMetadata,
    hasRole,
    hasVendorType,
    isAdmin,
    isVendor,
    isTourist,
    vendorType: userMetadata?.vendorType,
    isVerified: userMetadata?.isVerified || false,
    providerId: userMetadata?.providerId,
    registrationStatus: userMetadata?.registrationStatus
  };
}