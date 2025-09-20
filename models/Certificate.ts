import mongoose, { Schema, Document as MDocument } from 'mongoose';

export interface ICertificate extends MDocument {
  providerId: number;
  certificateHash: string;
  ipfsHash: string;
  qrCodeData: string;
  fullName: string;
  serviceType: string;
  issuedDate: Date;
  expiryDate: Date;
  city: string;
  verificationScore: number;
  isActive: boolean;
  transactionHash:string;
  blockchainTxUrl:string;
  blockchainVerifyUrl:string;
  certificateNumber: string; 
  application: mongoose.Schema.Types.ObjectId; 
}

const CertificateSchema = new Schema<ICertificate>(
    {
      providerId: { type: Number, required: true, unique: true },
      certificateHash: { type: String, required: true, unique: true },
      ipfsHash: { type: String, required: true },
      qrCodeData: { type: String, required: true },
      fullName: { type: String, required: true },
      serviceType: { type: String, required: true },
      issuedDate: { type: Date, required: true, default: Date.now },
      expiryDate: { type: Date, required: true },
      city: { type: String, required: true },
      verificationScore: { type: Number, required: true, min: 0, max: 100 },
      isActive: { type: Boolean, default: true },
      certificateNumber: { type: String, unique: true }, 
      application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
      transactionHash: {
        type: String,
        required: false,
      },
      blockchainTxUrl: {
        type: String,
        required: false,
      },
      blockchainVerifyUrl: {
        type: String,
        required: false,
      },
    },
    { timestamps: true }
  );
  
  CertificateSchema.pre('save', async function(next) {
    if (!this.certificateNumber || this.certificateNumber === '') {
      const count = await mongoose.model('Certificate').countDocuments();
      const servicePrefix = this.serviceType.split(' ')[0].substring(0, 3).toUpperCase();
      this.certificateNumber = `JH-${servicePrefix}-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    }
    console.log("Certificate no here is ", this.certificateNumber);
    next();
  });
export default mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);