import mongoose, { Schema, Document } from 'mongoose';
import User from './User';
export interface IApplication extends Document {
  applicationId: number; 
  user: mongoose.Schema.Types.ObjectId;
  vendorType: string;
  panHash: string;
  applicationDataHash: string;
  documentsHash: string;
  razorpayPaymentId: string;
  providerId?: number;
  razorpayAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  approvedAt: Date;
  verifierNotes?: string;
  verificationScore?: string;
  blockchainTxHash?: string; 
  vendorId:string;


  gstNumber?: string; 
  photo?: string; 
  licenseNumber?:string;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationId: { type: Number, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: User, required: true },
    vendorType: { type: String, required: true },
    panHash: { type: String, required: true },
    applicationDataHash: { type: String, required: true },
    documentsHash: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpayAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    providerId: { type: Number },
    approvedAt: { type: Date, default: Date.now },
    verifierNotes: { type: String },
    verificationScore: { type: String },
    vendorId:{type:String},
    blockchainTxHash: { 
      type: String,
      required: false 
    },
    gstNumber: { type: String, required: false }, 
    photo: { type: String, required: false },    
    licenseNumber: { type: String, required: false }, 
  },
  { timestamps: true }
);

export default mongoose.models.Application ||
  mongoose.model<IApplication>('Application', ApplicationSchema);
