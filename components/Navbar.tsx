"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { UserRole, VendorType } from "@/types/User";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Shield, CheckCircle, MapPin, Building, Utensils, Car, Activity } from "lucide-react";
import Image from "next/image";
import Verification from "./Verification";

interface NavigationItem {
  name: string;
  href: string;
}

const vendorTypeIcons: Record<VendorType, React.ComponentType<{ size?: number }>> = {
  [VendorType.GUIDE]: MapPin,
  [VendorType.ACCOMMODATION]: Building,
  [VendorType.FOOD_RESTAURANT]: Utensils,
  [VendorType.TRANSPORTATION]: Car,
  [VendorType.ACTIVITY]: Activity,
};

const vendorTypeNames: Record<VendorType, string> = {
  [VendorType.GUIDE]: "Tour Guide",
  [VendorType.ACCOMMODATION]: "Hotel/Lodge",
  [VendorType.FOOD_RESTAURANT]: "Restaurant",
  [VendorType.TRANSPORTATION]: "Transport",
  [VendorType.ACTIVITY]: "Activity Provider",
};

type NavigationConfig = Record<UserRole, NavigationItem[]>;

const getNavigationConfig = (userRole: UserRole, vendorType?: VendorType): NavigationItem[] => {
  const navigationConfig: NavigationConfig = {
    [UserRole.TOURIST]: [
      { name: "Dashboard", href: "/tourist/dashboard" },
      { name: "Browse Services", href: "/tourist/browse" },
      { name: "Verify Provider", href: "/tourist/verify" },
      { name: "My Bookings", href: "/tourist/bookings" },
      {name:"Activities",href:"/attractions"}
    ],
    [UserRole.ADMIN]: [
      { name: "Dashboard", href: "/admin/dashboard" },
      { name: "Applications", href: "/admin/applications" },
      { name: "Providers", href: "/admin/providers" },
      { name: "Analytics", href: "/admin/analytics" },
      { name: "Settings", href: "/admin/settings" }
    ],
    [UserRole.VENDOR]: []  
  };

  if (userRole === UserRole.VENDOR) {
    const baseVendorRoutes: NavigationItem[] = [
      {name:"Verification",href:"/certificates/verification"},
      { name: "Dashboard", href: "/vendor/dashboard" },
      { name: "My Profile", href: "/vendor/profile" },
      { name: "Certificate", href: "/vendor/certificate" },
    ];

    let verificationRoute: NavigationItem;
    switch (vendorType) {
      case VendorType.GUIDE:
        verificationRoute = { name: "Guide Verification", href: "/vendor/verification/guide" };
        break;
      case VendorType.ACCOMMODATION:
        verificationRoute = { name: "Hotel Verification", href: "/vendor/verification/service-provider/accommodation" };
        break;
      case VendorType.FOOD_RESTAURANT:
        verificationRoute = { name: "Restaurant Verification", href: "/vendor/verification/service-provider/restaurant" };
        break;
      case VendorType.TRANSPORTATION:
        verificationRoute = { name: "Transport Verification", href: "/vendor/verification/service-provider/transport" };
        break;
      case VendorType.ACTIVITY:
        verificationRoute = { name: "Activity Verification", href: "/vendor/verification/service-provider/activity" };
        break;
      default:
        verificationRoute = { name: "Verification", href: "/vendor/verification" };
    }

    const vendorRoutes: NavigationItem[] = [
      ...baseVendorRoutes,
      verificationRoute,
      { name: "Renewal", href: "/vendor/renewal" }
    ];

    return vendorRoutes;
  }

  return navigationConfig[userRole] || [];
};

const createUserInDatabase = async (userData: any) => {
  try {
    console.log("Userdagta in the frontedn is ",userData)
    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user in database');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
};

export function Navbar() {
  const { isLoaded, userMetadata, isSignedIn, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    const handleUserCreation = async () => {
      if (isLoaded && isSignedIn && user && !userMetadata?.role && !isCreatingUser) {
        setIsCreatingUser(true);
        
        try {
          console.log("Data in the document create request is ",user.id,user.primaryEmailAddress?.emailAddress)
          const response=await createUserInDatabase({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            registrationStatus: 'incomplete',
            isVerified: false,
            createdAt: new Date().toISOString(),
          });
          console.log("Data creating response in the frontend is ",response)
          window.location.href = '/select-role';
        } catch (error) {
          console.error('Error setting up new user:', error);
        } finally {
          setIsCreatingUser(false);
        }
      }
    };

    handleUserCreation();
  }, [isLoaded, isSignedIn, user, userMetadata?.role, isCreatingUser]);

  if (!isLoaded) {
    return <nav className="bg-white dark:bg-black shadow-md border-b h-16" />;
  }

  if (isSignedIn && !userMetadata?.role && isCreatingUser) {
    return (
      <nav className="w-full bg-white dark:bg-black shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-lg">Jharkhand Tourism</span>
              </Link>
              <span className="ml-3 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                Creating account...
              </span>
            </div>
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const userRole = userMetadata?.role;
  const vendorType = userMetadata?.vendorType;
  const isVerified = userMetadata?.isVerified;
  const navigation: NavigationItem[] = userRole ? getNavigationConfig(userRole, vendorType) : [];

  const VendorIcon = vendorType ? vendorTypeIcons[vendorType] : null;
  const vendorTypeName = vendorType ? vendorTypeNames[vendorType] : null;

  return (
    <nav className="w-full bg-white dark:bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">Jharkhand Tourism</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {userRole && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                  {userRole.toLowerCase()}
                </span>
                
                {userRole === UserRole.VENDOR && VendorIcon && vendorTypeName && (
                  <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    <VendorIcon size={12} />
                    <span>{vendorTypeName}</span>
                  </div>
                )}
                
                {userRole === UserRole.VENDOR && (
                  <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {isVerified ? (
                      <>
                        <CheckCircle size={12} />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <Shield size={12} />
                        <span>Pending</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {isSignedIn ? (
              <>
                {navigation.map((item: NavigationItem) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-blue-600 transition px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
                
                {userRole === UserRole.VENDOR && (
                  <Verification />
                )}
                
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link href="/" className="hover:text-blue-600 transition">
                  Home
                </Link>
                <Link href="/about" className="hover:text-blue-600 transition">
                  About
                </Link>
                <Link href="/services" className="hover:text-blue-600 transition">
                  Services
                </Link>
                <Link href="/contact" className="hover:text-blue-600 transition">
                  Contact
                </Link>
                
                <SignInButton mode="modal">
                  <button className="text-gray-600 hover:text-blue-600 transition px-3 py-2 rounded-md text-sm font-medium">
                    Sign In
                  </button>
                </SignInButton>
                
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 dark:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-black px-4 py-3 space-y-2">
          {isSignedIn && userRole && (
            <div className="border-b pb-2 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                  {userRole.toLowerCase()}
                </span>
                
                {userRole === UserRole.VENDOR && VendorIcon && vendorTypeName && (
                  <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    <VendorIcon size={12} />
                    <span>{vendorTypeName}</span>
                  </div>
                )}
              </div>
              
              {userRole === UserRole.VENDOR && (
                <div className={` items-center gap-1 px-2 py-1 text-xs rounded-full inline-flex ${
                  isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {isVerified ? (
                    <>
                      <CheckCircle size={12} />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <Shield size={12} />
                      <span>Pending Verification</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {isSignedIn ? (
            <>
              {navigation.map((item: NavigationItem) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {userRole === UserRole.VENDOR && (
                <div className="block py-2">
                  <Verification isMobile={true} />
                </div>
              )}
              
              <div className="py-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <>
              <Link href="/" className="block hover:text-blue-600 py-2">
                Home
              </Link>
              <Link href="/about" className="block hover:text-blue-600 py-2">
                About
              </Link>
              <Link href="/services" className="block hover:text-blue-600 py-2">
                Services
              </Link>
              <Link href="/contact" className="block hover:text-blue-600 py-2">
                Contact
              </Link>
              
              <SignInButton mode="modal">
                <button 
                  className="block w-full text-left hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <button 
                  className="block w-full px-4 py-2 mt-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-left"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      )}
    </nav>
  );
}