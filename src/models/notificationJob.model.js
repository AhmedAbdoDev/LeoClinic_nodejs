import { Schema, model } from "mongoose";

const NotificationJobSchema = new Schema(
  {
    notification_id: {
      type: Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },
    event_key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ["email"],
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    max_attempts: {
      type: Number,
      default: 5,
    },
    next_retry_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    last_error: {
      type: String,
      default: null,
    },
    sent_at: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

NotificationJobSchema.index({
  status: 1,
  next_retry_at: 1,
});

export default model("NotificationJob", NotificationJobSchema);
