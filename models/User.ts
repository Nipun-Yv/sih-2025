import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?:string;
  role: 'tourist' | 'vendor' | 'admin';
  vendorType?: 'guide' | 'accomodation' | 'food_restaurant' | 'transportation' | 'activity';
  registrationStatus: 'incomplete' | 'pending' | 'approved' | 'rejected' | 'suspended'|'complete';
  isVerified: boolean;
  providerId?: number; 
  applicationId?: number; 
  panHash?: string; 
  razorpayPaymentId?: string; 
  razorpayAmount?: number; 
  documentsHash?: string; 
  applicationDataHash?: string; 
  verificationScore?: number; 
  expiryDate?: Date; 
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  fullName: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['tourist', 'vendor', 'admin'],
    required: true,
    default: 'tourist',
  },
  vendorType: {
    type: String,
    enum: ['guide', 'accomodation', 'food_restaurant', 'transportation', 'activity'],
    required: false,
  },
  registrationStatus: {
    type: String,
    enum: ['incomplete', 'pending', 'approved', 'rejected', 'suspended','complete'],
    default: 'incomplete',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  providerId: {
    type: Number,
    required: false,
  },
  applicationId: {
    type: Number,
    required: false,
  },
  panHash: {
    type: String,
    required: false,
  },
  razorpayPaymentId: {
    type: String,
    required: false,
  },
  razorpayAmount: {
    type: Number,
    required: false,
  },
  documentsHash: {
    type: String,
    required: false,
  },
  applicationDataHash: {
    type: String,
    required: false,
  },
  verificationScore: {
    type: Number,
    min: 0,
    max: 100,
    required: false,
  },
  expiryDate: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
});

UserSchema.index({ panHash: 1 });
UserSchema.index({ providerId: 1 });
UserSchema.index({ applicationId: 1 });
UserSchema.index({ registrationStatus: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);