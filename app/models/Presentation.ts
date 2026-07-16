import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPresentation extends Document {
  title: string;
  presenterName: string;
  presentationDate: Date;
  fileName: string;
  fileUrl: string;
  totalSlides?: number;
  fileId: mongoose.Types.ObjectId; // Reference to GridFS ppt/pptx file
  uploadedAt: Date;
  createdAt: Date;
}

const PresentationSchema: Schema = new Schema({
  title: { type: String, required: true },
  presenterName: { type: String, required: true },
  presentationDate: { type: Date, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  totalSlides: { type: Number },
  fileId: { type: Schema.Types.ObjectId, required: true },
  uploadedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Avoid compile error on hot-reload
const Presentation: Model<IPresentation> =
  mongoose.models.Presentation ||
  mongoose.model<IPresentation>("Presentation", PresentationSchema);

export default Presentation;
