"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building, 
  Utensils, 
  Car, 
  Activity,
  Users,
  Shield
} from "lucide-react";
import { VendorType,UserRole } from "@/types/User";
import { UserMetadata } from "@/types/User";
import dbConnect from "@/lib/mongoose";
const vendorTypes = [
  {
    type: VendorType.GUIDE,
    label: "Tour Guide",
    icon: MapPin,
    description: "Provide guided tours and local expertise"
  },
  {
    type: VendorType.ACCOMMODATION,
    label: "Hotel/Lodge",
    icon: Building,
    description: "Offer accommodation services"
  },
  {
    type: VendorType.FOOD_RESTAURANT,
    label: "Restaurant",
    icon: Utensils,
    description: "Provide food and dining services"
  },
  {
    type: VendorType.TRANSPORTATION,
    label: "Transport",
    icon: Car,
    description: "Offer transportation services"
  },
  {
    type: VendorType.ACTIVITY,
    label: "Activity Provider",
    icon: Activity,
    description: "Organize activities and experiences"
  }
];

export default function SelectRolePage() {
    const { user } = useUser();
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [selectedVendorType, setSelectedVendorType] = useState<VendorType | null>(null);
    const [loading, setLoading] = useState(false);
  
    const handleRoleSelection = async () => {
      if (!selectedRole || !user) return;
  
      setLoading(true);
      try {
        const metadata: UserMetadata = {
          role: selectedRole,
          ...(selectedRole === UserRole.VENDOR && selectedVendorType && {
            vendorType: selectedVendorType,
            isVerified: false,
            registrationStatus: 'pending'
          })
        };
        // const {user,isLoaded,isSignedIn}=useUser();
        const userId=user.id
        console.log(user,metadata);
        const metadataResponse=  await fetch("/api/users/update-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({userId, metadata }),
          });
        if(!metadataResponse.ok){
          throw new Error("Failed to update userMetadata")
        }
        console.log("Meta data resposne ins updated correctyl",metadataResponse)
        const dbUpdateData={
          clerkId: userId,
          role: selectedRole,
          ...(selectedRole === UserRole.VENDOR && selectedVendorType && {
            vendorType: selectedVendorType,
            isVerified: false,
            registrationStatus: 'incomplete'
          }),
          ...(selectedRole === UserRole.TOURIST && {
            isVerified: true,
            registrationStatus: 'complete'
          }),
          ...(selectedRole === UserRole.ADMIN && {
            isVerified: true,
            registrationStatus: 'complete'
          }),
          updatedAt: new Date().toISOString()
  
        }

        const dbResponse=await fetch("/api/users/update-role",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify(dbUpdateData)
        })
        if(!dbResponse.ok){
          const errorData=await dbResponse.json();
          throw new Error(errorData.message||'Failed to update user role in database');
        }
        const dbResult=await dbResponse.json();
        console.log("Database update successful: ",dbResult)
        router.refresh()
        switch (selectedRole) {
          case UserRole.ADMIN:
            router.push("/admin/dashboard");
            break;
          case UserRole.VENDOR:
            router.push("/");
            break;
          case UserRole.TOURIST:
            router.push("/");
            break;
          default:
            router.push("/")
        }
      } catch (error) {
        console.error("Error updating user role:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Tourism Registry
            </h1>
            <p className="text-gray-600">
              Please select your role to get started
            </p>
          </div>
  
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === UserRole.TOURIST 
                  ? "ring-2 ring-blue-500 bg-blue-50" 
                  : ""
              }`}
              onClick={() => {
                setSelectedRole(UserRole.TOURIST);
                setSelectedVendorType(null);
              }}
            >
              <CardHeader className="text-center">
                <Users className="mx-auto h-12 w-12 text-blue-600 mb-2" />
                <CardTitle>Tourist</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Explore destinations, find verified services, and plan your trips
                </p>
                <div className="mt-4 space-y-2">
                  <Badge variant="outline" className="text-xs">
                    Browse Services
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Verify Providers
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Leave Reviews
                  </Badge>
                </div>
              </CardContent>
            </Card>
  
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === UserRole.VENDOR 
                  ? "ring-2 ring-green-500 bg-green-50" 
                  : ""
              }`}
              onClick={() => {
                setSelectedRole(UserRole.VENDOR);
              }}
            >
              <CardHeader className="text-center">
                <Building className="mx-auto h-12 w-12 text-green-600 mb-2" />
                <CardTitle>Service Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Register your tourism business and get verified
                </p>
                <div className="mt-4 space-y-2">
                  <Badge variant="outline" className="text-xs">
                    Get Verified
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Digital Certificate
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Manage Profile
                  </Badge>
                </div>
              </CardContent>
            </Card>
  
            {user?.emailAddresses[0]?.emailAddress?.startsWith("amanpandey") && (
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRole === UserRole.ADMIN 
                    ? "ring-2 ring-purple-500 bg-purple-50" 
                    : ""
                }`}
                onClick={() => {
                  setSelectedRole(UserRole.ADMIN);
                  setSelectedVendorType(null);
                }}
              >
                <CardHeader className="text-center">
                  <Shield className="mx-auto h-12 w-12 text-purple-600 mb-2" />
                  <CardTitle>Administrator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Manage the tourism registry system
                  </p>
                  <div className="mt-4 space-y-2">
                    <Badge variant="outline" className="text-xs">
                      Verify Applications
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      System Management
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Analytics
                    </Badge>
                  </div>
                </CardContent>
                </Card>
              )}
          
          </div>
  
          {selectedRole === UserRole.VENDOR && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-center mb-4">
                Select Your Service Type
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {vendorTypes.map((vendor) => {
                  const Icon = vendor.icon;
                  return (
                    <Card
                      key={vendor.type}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedVendorType === vendor.type
                          ? "ring-2 ring-green-500 bg-green-50"
                          : ""
                      }`}
                      onClick={() => setSelectedVendorType(vendor.type)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="mx-auto h-8 w-8 text-green-600 mb-2" />
                        <h3 className="font-medium text-sm">{vendor.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {vendor.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
  
          <div className="text-center">
            <Button 
              onClick={handleRoleSelection}
              disabled={
                !selectedRole || 
                (selectedRole === UserRole.VENDOR && !selectedVendorType) ||
                loading
              }
              className="px-8 py-2"
            >
              {loading ? "Setting up..." : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  