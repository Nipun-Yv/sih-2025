"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { UserRole, VendorType } from "@/types/User";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Shield, CheckCircle, MapPin, Building, Utensils, Car, Activity } from "lucide-react";
import Image from "next/image";
import Verification from "./Verification";

// Vendor type icons mapping
const vendorTypeIcons = {
  [VendorType.GUIDE]: MapPin,
  [VendorType.ACCOMMODATION]: Building,
  [VendorType.FOOD_RESTAURANT]: Utensils,
  [VendorType.TRANSPORTATION]: Car,
  [VendorType.ACTIVITY]: Activity,
};

// Vendor type display names
const vendorTypeNames = {
  [VendorType.GUIDE]: "Tour Guide",
  [VendorType.ACCOMMODATION]: "Hotel/Lodge",
  [VendorType.FOOD_RESTAURANT]: "Restaurant",
  [VendorType.TRANSPORTATION]: "Transport",
  [VendorType.ACTIVITY]: "Activity Provider",
};

// Dynamic navigation configuration based on user role and vendor type
const getNavigationConfig = (userRole: UserRole, vendorType?: VendorType) => {
  const baseConfig = {
    [UserRole.TOURIST]: [
      { name: "Dashboard", href: "/tourist/dashboard" },
      { name: "Browse Services", href: "/tourist/browse" },
      { name: "Verify Provider", href: "/tourist/verify" },
      { name: "My Bookings", href: "/tourist/bookings" },
    ],
    [UserRole.ADMIN]: [
      { name: "Dashboard", href: "/admin/dashboard" },
      { name: "Applications", href: "/admin/applications" },
      { name: "Providers", href: "/admin/providers" },
      { name: "Analytics", href: "/admin/analytics" },
      { name: "Settings", href: "/admin/settings" }
    ]
  };

  // Dynamic vendor navigation based on vendor type
  if (userRole === UserRole.VENDOR) {
    const baseVendorRoutes = [
      { name: "Dashboard", href: "/vendor/dashboard" },
      { name: "My Profile", href: "/vendor/profile" },
      { name: "Certificate", href: "/vendor/certificate" },
    ];

    // Add vendor-type specific verification route
    let verificationRoute;
    switch (vendorType) {
      case VendorType.GUIDE:
        verificationRoute = { name: "Guide Verification", href: "/vendor/verification/guide" };
        break;
      case VendorType.ACCOMMODATION:
        verificationRoute = { name: "Hotel Verification", href: "/vendor/verification/accommodation" };
        break;
      case VendorType.FOOD_RESTAURANT:
        verificationRoute = { name: "Restaurant Verification", href: "/vendor/verification/restaurant" };
        break;
      case VendorType.TRANSPORTATION:
        verificationRoute = { name: "Transport Verification", href: "/vendor/verification/transport" };
        break;
      case VendorType.ACTIVITY:
        verificationRoute = { name: "Activity Verification", href: "/vendor/verification/activity" };
        break;
      default:
        verificationRoute = { name: "Verification", href: "/vendor/verification" };
    }

    const vendorRoutes = [
      ...baseVendorRoutes,
      verificationRoute,
      { name: "Renewal", href: "/vendor/renewal" }
    ];

    return { [UserRole.VENDOR]: vendorRoutes };
  }

  return baseConfig;
};

const createUserInDatabase = async (userData: any) => {
  try {
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

  // Effect to handle user creation when they first sign in
  useEffect(() => {
    const handleUserCreation = async () => {
      if (isLoaded && isSignedIn && user && !userMetadata?.role && !isCreatingUser) {
        setIsCreatingUser(true);
        
        try {
          // First, update Clerk metadata with default TOURIST role
          await fetch('/api/users/update-metadata', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              metadata: {
                role: UserRole.TOURIST,
                registrationStatus: 'incomplete',
                isVerified: false,
                createdAt: new Date().toISOString(),
              }
            }),
          });

          // Then create user in your database
          await createUserInDatabase({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            role: UserRole.TOURIST,
            registrationStatus: 'incomplete',
            isVerified: false,
            createdAt: new Date().toISOString(),
          });

          // Force a page refresh to get updated metadata
          window.location.reload();
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

  // Show loading state while creating user
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
                Setting up account...
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
  const navigationConfig = getNavigationConfig(userRole, vendorType);
  const navigation = userRole ? navigationConfig[userRole] : [];

  // Get vendor type icon and name for display
  const VendorIcon = vendorType ? vendorTypeIcons[vendorType] : null;
  const vendorTypeName = vendorType ? vendorTypeNames[vendorType] : null;

  return (
    <nav className="w-full bg-white dark:bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">

            <span className="font-bold text-lg">Jharkhand Tourism</span>
          </Link>

          {/* User Role and Vendor Type Display */}
          <div className="hidden md:flex items-center gap-2">
            {userRole && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                  {userRole.toLowerCase()}
                </span>
                
                {/* Vendor Type Display */}
                {userRole === UserRole.VENDOR && VendorIcon && vendorTypeName && (
                  <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    <VendorIcon size={12} />
                    <span>{vendorTypeName}</span>
                  </div>
                )}
                
                {/* Verification Status */}
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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isSignedIn ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-blue-600 transition px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Verification Component for vendors */}
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

          {/* Mobile Menu Button */}
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

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-black px-4 py-3 space-y-2">
          {/* Mobile User Info */}
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
                <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full inline-flex ${
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
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Verification Component */}
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