// models/VendorProfile.js
import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorProfile extends Document {
  userId: string; // Reference to User clerkId
  businessName: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    pincode?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  serviceArea: {
    radius: number; // in kilometers
    locations: string[]; // location IDs they serve (jharkhand_india, etc.)
    attractions: string[]; // specific attraction IDs they serve
  };
  businessDetails: {
    priceRange?: string; // 'budget', 'mid-range', 'luxury'
    capacity?: number;
    amenities?: string[];
    specializations?: string[];
    languages?: string[];
    experience?: number; // years of experience
  };
  ratings: {
    average: number;
    count: number;
    reviews: [{
      userId: string;
      rating: number;
      comment?: string;
      date: Date;
    }];
  };
  images: string[];
  availability: {
    days: string[]; // ['monday', 'tuesday', etc.]
    hours?: string; // '9:00 AM - 6:00 PM'
    seasonalAvailability?: {
      availableMonths: string[];
      unavailableDates: Date[];
    };
  };
  pricing: {
    basePrice?: number;
    priceUnit?: string; 
    packages?: [{
      name: string;
      description: string;
      price: number;
      duration?: string;
      inclusions?: string[];
    }];
  };
  vendorType: 'guide' | 'accomodation' | 'food_restaurant' | 'transportation' | 'activity';
  isActive: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const VendorProfileSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: String,
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
  },
  serviceArea: {
    radius: {
      type: Number,
      required: true,
      min: 1,
      max: 100, // max 100km radius
    },
    locations: [{
      type: String,
      required: true,
    }],
    attractions: [{
      type: String, // attraction IDs from PostgreSQL
    }],
  },
  businessDetails: {
    priceRange: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury'],
      default: 'mid-range',
    },
    capacity: {
      type: Number,
      min: 1,
    },
    amenities: [String],
    specializations: [String],
    languages: [String],
    experience: {
      type: Number,
      min: 0,
      max: 50,
    },
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
    reviews: [{
      userId: String,
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  images: [{
    type: String,

  }],
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    }],
    hours: String,
    seasonalAvailability: {
      availableMonths: [{
        type: String,
        enum: ['january', 'february', 'march', 'april', 'may', 'june', 
               'july', 'august', 'september', 'october', 'november', 'december'],
      }],
      unavailableDates: [Date],
    },
  },
  pricing: {
    basePrice: {
      type: Number,
      min: 0,
    },
    priceUnit: {
      type: String,
      enum: ['per_hour', 'per_day', 'per_person', 'per_group', 'fixed'],
      default: 'per_person',
    },
    packages: [{
      name: {
        type: String,
        required: true,
      },
      description: String,
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      duration: String,
      inclusions: [String],
    }],
  },
  vendorType: {
    type: String,
    enum: ['guide', 'accomodation', 'food_restaurant', 'transportation', 'activity'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  verificationStatus: {
    type: String,
    enum: ['verified', 'pending', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Create geospatial index for location-based queries
VendorProfileSchema.index({ "address.coordinates": "2dsphere" });
VendorProfileSchema.index({ vendorType: 1, isActive: 1, verificationStatus: 1 });
VendorProfileSchema.index({ "serviceArea.locations": 1 });
VendorProfileSchema.index({ "serviceArea.attractions": 1 });
VendorProfileSchema.index({ "ratings.average": -1 });

export default mongoose.models.VendorProfile || mongoose.model<IVendorProfile>('VendorProfile', VendorProfileSchema);