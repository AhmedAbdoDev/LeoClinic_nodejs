import { Schema, model } from "mongoose";

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

    review: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
).index({ doctor_id: 1 });

export default model("Rating", RatingSchema);
