import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface ILink extends Document {
  name: string;
  link: string;
}

const LinkSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
    unique: true,
  },
});

export default models.Link || model<ILink>('Link', LinkSchema);