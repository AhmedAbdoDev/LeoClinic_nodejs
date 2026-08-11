import { Schema, model } from "mongoose";

const AppointmentSchema = new Schema(
  {
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    availability_id: {
      type: Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
    },
    slot_id: {
      type: Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
    },
    appointment_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: String,
    doctor_snapshot: {
      name: String,
      specialty: String,
      price: Number,
    },
  },
  { timestamps: true, versionKey: false },
)
  .index({ doctor_id: 1, status: 1 })
  .index({ patient_id: 1 })
  .index({ slot_id: 1 })
  .index({ doctor_id: 1, appointment_date: 1 })
  .index(
    { availability_id: 1, slot_id: 1, appointment_date: 1 },
    {
      unique: true,
      partialFilterExpression: { status: { $ne: "cancelled" } },
    },
  );

export default model("Appointment", AppointmentSchema);
