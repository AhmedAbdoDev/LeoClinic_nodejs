import { Schema, model } from "mongoose";

const SessionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refresh_token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    revoked_at: {
      type: Date,
      default: null,
    },
    last_used_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
).index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default model("Session", SessionSchema);
