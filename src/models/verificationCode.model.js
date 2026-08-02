import { Schema, model } from "mongoose";

const VerificationCodeSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["email_verification", "password_reset"],
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    used_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
).index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default model("VerificationCode", VerificationCodeSchema);
