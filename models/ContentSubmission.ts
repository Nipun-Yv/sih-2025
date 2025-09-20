import mongoose, { Schema, Document } from 'mongoose';

export interface IContentSubmission extends Document {
  creatorId: string;
  contractId: string;
  platform: 'youtube' | 'instagram' | 'twitter' | 'blog' | 'other';
  contentUrl: string;
  title: string;
  description?: string;
  publishedAt: Date;
  submittedAt: Date;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    lastUpdated?: Date;
  };
  reviewStatus: 'pending' | 'approved' | 'needs_revision';
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSubmissionSchema = new Schema<IContentSubmission>(
  {
    creatorId: { type: String, required: true },
    contractId: { type: String, required: true },
    platform: {
      type: String,
      enum: ['youtube', 'instagram', 'twitter', 'blog', 'other'],
      required: true,
    },
    contentUrl: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    publishedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: Date.now },
    metrics: {
      views: Number,
      likes: Number,
      comments: Number,
      shares: Number,
      lastUpdated: Date,
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'needs_revision'],
      default: 'pending',
    },
    reviewNotes: String,
  },
  { timestamps: true }
);

export default mongoose.models.ContentSubmission || 
  mongoose.model<IContentSubmission>('ContentSubmission', ContentSubmissionSchema);