import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  applicationId: number; 
  user: mongoose.Schema.Types.ObjectId
  vendorType: string;
  panHash: string;
  applicationDataHash: string;
  documentsHash: string;
  razorpayPaymentId: string;
  razorpayAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationId: { type: Number, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendorType: { type: String, required: true },
    panHash: { type: String, required: true },
    applicationDataHash: { type: String, required: true },
    documentsHash: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpayAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Application ||
  mongoose.model<IApplication>('Application', ApplicationSchema);
