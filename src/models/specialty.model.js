import { Schema, model } from "mongoose";

const Specialty = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true, versionKey: false },
);
export default model("Specialty", Specialty);
