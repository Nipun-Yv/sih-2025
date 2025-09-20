export enum UserRole {
    ADMIN = 'admin',
    VENDOR = 'vendor',
    TOURIST = 'tourist'
  }
  
  export enum VendorType {
    GUIDE = 'guide',
    ACCOMMODATION = 'accommodation',
    FOOD_RESTAURANT = 'food_restaurant',
    TRANSPORTATION = 'transport',
    ACTIVITY = 'activity'
  }
  
  export interface UserMetadata {
    role: UserRole;
    vendorType?: VendorType;
    isVerified?: boolean;
    providerId?: number;
    registrationStatus?: 'pending' | 'approved' | 'rejected';
    applicationId?: number;
  }