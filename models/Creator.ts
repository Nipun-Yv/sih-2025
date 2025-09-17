import mongoose, { Schema, Document } from 'mongoose';

export interface ICreator extends Document {
  clerkUserId: string;
  youtubeChannelId?: string;
  channelData?: {
    name: string;
    subscriberCount: number;
    videoCount: number;
    thumbnailUrl: string;
  };
  verificationDate?: Date;
  analytics?: {
    engagementScore: number;
    calculatedAt: Date;
  };
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'unverified' | 'verified' | 'calculating' | 'tier_assigned' | 'contract_pending' | 'contract_signed' | 'content_submitted';
  createdAt: Date;
  updatedAt: Date;
}

const CreatorSchema = new Schema<ICreator>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true }, // Added index
    youtubeChannelId: { type: String, sparse: true },
    channelData: {
      name: String,
      subscriberCount: Number,
      videoCount: Number,
      thumbnailUrl: String,
    },
    verificationDate: Date,
    analytics: {
      engagementScore: { type: Number, min: 0, max: 100 },
      calculatedAt: Date,
    },
    tier: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'platinum'],
    },
    status: {
      type: String,
      enum: ['unverified', 'verified', 'calculating', 'tier_assigned', 'contract_pending', 'contract_signed', 'content_submitted'],
      default: 'unverified',
    },
  },
  { timestamps: true }
);

// Remove any old indexes
CreatorSchema.index({ clerkUserId: 1 }, { unique: true });

export default mongoose.models.Creator || mongoose.model<ICreator>('Creator', CreatorSchema);