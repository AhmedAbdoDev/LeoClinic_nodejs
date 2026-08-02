import { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    message: {
      type: String,
      required: true,
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
);

export default model("Notification", NotificationSchema);
