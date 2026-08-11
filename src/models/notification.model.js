import { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    event_key: {
      type: String,
      required: true,
      unique: true,
    },
    recipient_role: {
      type: String,
      enum: ["doctor", "patient", "admin"],
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
).index({
  user_id: 1,
  createdAt: -1,
});

export default model("Notification", NotificationSchema);
