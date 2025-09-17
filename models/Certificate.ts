import mongoose, { Schema, Document as MDocument } from 'mongoose';

export interface ICertificate extends MDocument {
  application: mongoose.Schema.Types.ObjectId;
  name: string;
  issuingAuthority: string;
  issuedDate?: Date;
  expiryDate?: Date;
  ipfsHash: string;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    name: { type: String, required: true },
    issuingAuthority: { type: String, required: true },
    issuedDate: { type: Date },
    expiryDate: { type: Date },
    ipfsHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);
