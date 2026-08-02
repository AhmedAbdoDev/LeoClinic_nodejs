import { Schema, model } from "mongoose";

const AvailabilitySchema = new Schema(
  {
    doctor_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    location_id: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },

    date: {
      type: Date,
      required: true,
    },

    start_time: {
      type: Date,
      required: true,
    },

    end_time: {
      type: Date,
      required: true,
    },

    is_booked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
).index(
  {
    doctor_id: 1,
    start_time: 1,
    end_time: 1,
  },
  { unique: true },
);

export default model("Availability", AvailabilitySchema);
