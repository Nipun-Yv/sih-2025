import { UserRole } from "@/types/User";
import { RoleBasedRoute } from "../itinerary/components/RoleBasedRoute";
export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleBasedRoute allowedRoles={[UserRole.VENDOR]}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </RoleBasedRoute>
  );
}