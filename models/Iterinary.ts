// models/Itinerary.js
import mongoose, { Schema, Document } from 'mongoose';

export interface IItinerary extends Document {
  userId: string; // Tourist's clerkId
  tripName?: string;
  startDate: Date;
  endDate?: Date;
  locationId: string; // jharkhand_india
  attractions: string[]; // attraction IDs from PostgreSQL
  activities: [{
    activityId: string;
    attractionId: string;
    scheduledDate?: Date;
    scheduledTime?: string;
    duration: number; // in minutes
    price?: number;
    status: 'planned' | 'booked' | 'completed' | 'cancelled';
    notes?: string;
  }];
  vendors: {
    hotels: [{
      vendorId: string;
      bookingStatus: 'interested' | 'contacted' | 'booked' | 'confirmed';
      checkIn?: Date;
      checkOut?: Date;
      rooms?: number;
      guests?: number;
      price?: number;
      notes?: string;
    }];
    restaurants: [{
      vendorId: string;
      bookingStatus: 'interested' | 'contacted' | 'booked' | 'confirmed';
      reservationDate?: Date;
      reservationTime?: string;
      partySize?: number;
      price?: number;
      specialRequests?: string;
    }];
    guides: [{
      vendorId: string;
      bookingStatus: 'interested' | 'contacted' | 'booked' | 'confirmed';
      serviceDate?: Date;
      duration?: string;
      attractions: string[]; // which attractions they'll guide for
      price?: number;
      languages?: string[];
      specializations?: string[];
    }];
    transport: [{
      vendorId: string;
      bookingStatus: 'interested' | 'contacted' | 'booked' | 'confirmed';
      serviceType: 'airport_pickup' | 'city_tour' | 'intercity' | 'local_transport';
      pickupLocation?: string;
      dropLocation?: string;
      serviceDate?: Date;
      serviceTime?: string;
      vehicleType?: string;
      capacity?: number;
      price?: number;
    }];
  };
  budget: {
    totalBudget?: number;
    spentAmount: number;
    categoryWise: {
      accommodation: number;
      food: number;
      transport: number;
      activities: number;
      guides: number;
      miscellaneous: number;
    };
  };
  preferences: {
    budgetType: 'budget' | 'mid-range' | 'luxury';
    groupSize: number;
    travelStyle: 'solo' | 'couple' | 'family' | 'group' | 'business';
    specialRequirements?: string[];
  };
  status: 'draft' | 'planning' | 'finalized' | 'active' | 'completed' | 'cancelled';
  shareSettings: {
    isPublic: boolean;
    sharedWith: string[]; // user IDs
    allowBookings: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  tripName: {
    type: String,
    
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    
  },
  locationId: {
    type: String,
    required: true,
  },
  attractions: [{
    type: String,
    required: true,
  }],
  activities: [{
    activityId: {
      type: String,
      required: true,
    },
    attractionId: {
      type: String,
      required: true,
    },
    scheduledDate: Date,
    scheduledTime: String,
    duration: {
      type: Number,
      required: true,
      min: 15, // minimum 15 minutes
    },
    price: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['planned', 'booked', 'completed', 'cancelled'],
      default: 'planned',
    },
    notes: String,
  }],
  vendors: {
    hotels: [{
      vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true,
      },
      bookingStatus: {
        type: String,
        enum: ['interested', 'contacted', 'booked', 'confirmed'],
        default: 'interested',
      },
      checkIn: Date,
      checkOut: Date,
      rooms: {
        type: Number,
        min: 1,
        default: 1,
      },
      guests: {
        type: Number,
        min: 1,
        default: 2,
      },
      price: {
        type: Number,
        min: 0,
      },
      notes: String,
    }],
    restaurants: [{
      vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true,
      },
      bookingStatus: {
        type: String,
        enum: ['interested', 'contacted', 'booked', 'confirmed'],
        default: 'interested',
      },
      reservationDate: Date,
      reservationTime: String,
      partySize: {
        type: Number,
        min: 1,
        default: 2,
      },
      price: {
        type: Number,
        min: 0,
      },
      specialRequests: String,
    }],
    guides: [{
      vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true,
      },
      bookingStatus: {
        type: String,
        enum: ['interested', 'contacted', 'booked', 'confirmed'],
        default: 'interested',
      },
      serviceDate: Date,
      duration: String,
      attractions: [String],
      price: {
        type: Number,
        min: 0,
      },
      languages: [String],
      specializations: [String],
    }],
    transport: [{
      vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true,
      },
      bookingStatus: {
        type: String,
        enum: ['interested', 'contacted', 'booked', 'confirmed'],
        default: 'interested',
      },
      serviceType: {
        type: String,
        enum: ['airport_pickup', 'city_tour', 'intercity', 'local_transport'],
        required: true,
      },
      pickupLocation: String,
      dropLocation: String,
      serviceDate: Date,
      serviceTime: String,
      vehicleType: String,
      capacity: Number,
      price: {
        type: Number,
        min: 0,
      },
    }],
  },
  budget: {
    totalBudget: {
      type: Number,
      min: 0,
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    categoryWise: {
      accommodation: {
        type: Number,
        default: 0,
        min: 0,
      },
      food: {
        type: Number,
        default: 0,
        min: 0,
      },
      transport: {
        type: Number,
        default: 0,
        min: 0,
      },
      activities: {
        type: Number,
        default: 0,
        min: 0,
      },
      guides: {
        type: Number,
        default: 0,
        min: 0,
      },
      miscellaneous: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  preferences: {
    budgetType: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury'],
      default: 'mid-range',
    },
    groupSize: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },
    travelStyle: {
      type: String,
      enum: ['solo', 'couple', 'family', 'group', 'business'],
      default: 'couple',
    },
    specialRequirements: [String],
  },
  status: {
    type: String,
    enum: ['draft', 'planning', 'finalized', 'active', 'completed', 'cancelled'],
    default: 'draft',
  },
  shareSettings: {
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [String],
    allowBookings: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
ItinerarySchema.index({ userId: 1, status: 1 });
ItinerarySchema.index({ locationId: 1, status: 1 });
ItinerarySchema.index({ startDate: 1, endDate: 1 });
ItinerarySchema.index({ "vendors.hotels.vendorId": 1 });
ItinerarySchema.index({ "vendors.restaurants.vendorId": 1 });
ItinerarySchema.index({ "vendors.guides.vendorId": 1 });
ItinerarySchema.index({ "vendors.transport.vendorId": 1 });

export default mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);