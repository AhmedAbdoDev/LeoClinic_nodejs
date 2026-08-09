import { Schema, model } from "mongoose";

const AdminResponseSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    responded_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responded_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const RatingSchema = new Schema(
  {
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    rate: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      trim: true,
    },
    admin_response: {
      type: AdminResponseSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
).index({ doctor_id: 1 });

export default model("Rating", RatingSchema);
