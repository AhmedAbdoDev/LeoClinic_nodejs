import { Schema, model } from "mongoose";
import { DAYS } from "../modules/doctors/doctor.constants.js";

const SlotSchema = new Schema(
  {
    start_time: {
      type: Number,
      required: true,
      min: 0,
      max: 1439,
    },
    end_time: {
      type: Number,
      required: true,
      min: 1,
      max: 1440,
    },
    is_booked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const AvailabilitySchema = new Schema(
  {
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location_id: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    day: {
      type: String,
      enum: DAYS,
      required: true,
    },

    slots: {
      type: [SlotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
).index({ doctor_id: 1, day: 1, location_id: 1 }, { unique: true });

export default model("Availability", AvailabilitySchema);