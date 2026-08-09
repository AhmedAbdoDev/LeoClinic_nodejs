import { Schema, model } from 'mongoose';

const PaymentSchema = new Schema(
  {
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paid_at: Date,
  },
  { timestamps: true, versionKey: false }
);

export default model('Payment', PaymentSchema);