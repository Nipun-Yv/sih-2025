import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  creatorId: string;
  tier: string;
  terms: {
    tripDuration: number;
    compensation: number;
    contentRequirements: string[];
    deadline: string;
  };
  status: 'draft' | 'pending' | 'signed' | 'expired';
  signedAt?: Date;
  documentUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    creatorId: { type: String, required: true },
    tier: { type: String, required: true },
    terms: {
      tripDuration: Number,
      compensation: Number,
      contentRequirements: [String],
      deadline: String,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'signed', 'expired'],
      default: 'pending',
    },
    signedAt: Date,
    documentUrl: String,
  },
  { timestamps: true }
);

export default mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);