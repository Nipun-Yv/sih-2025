import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'TOURIST' | 'VENDOR' | 'ADMIN';
  vendorType?: 'HOTEL' | 'RESTAURANT' | 'TRANSPORT' | 'TOUR_GUIDE';
  registrationStatus: 'incomplete' | 'pending' | 'completed' | 'rejected';
  isVerified: boolean;
  providerId?: string;
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
  role: {
    type: String,
    enum: ['tourist', 'vendor', 'admin'],
    required: true,
    default: 'tourist',
  },
  vendorType: {
    type: String,
    enum: ['HOTEL', 'RESTAURANT', 'TRANSPORT', 'TOUR_GUIDE'],
    required: false,
  },
  registrationStatus: {
    type: String,
    enum: ['incomplete', 'pending', 'completed', 'rejected'],
    default: 'incomplete',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  providerId: {
    type: String,
    required: false,
  },
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt
});

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);