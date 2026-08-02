import { Schema, model } from "mongoose";

const Specialty = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: false, trim: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);
export default model("Specialty", Specialty);
