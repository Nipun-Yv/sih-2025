import mongoose, { Schema, Document as MDocument } from 'mongoose';

export interface IDocument extends MDocument {
  application: mongoose.Schema.Types.ObjectId;
  category: string; 
  fileName: string;
  ipfsHash: string;
  uploadedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    category: { 
      type: String, 
      required: true 
    },
    fileName: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Document ||
  mongoose.model<IDocument>('Document', DocumentSchema);