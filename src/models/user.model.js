import { Schema, model } from "mongoose";

const DoctorProfileSchema = new Schema(
  {
    specialty_id: {
      type: Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },
    price: { type: Number, required: true },
    bio: String,
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
    approval_status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
      required: true,
    },
  },
  { _id: false },
);

const PatientProfileSchema = new Schema(
  {
    date_of_birth: { type: Date, required: true },
    address: { type: String, required: true },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      required: true,
    },
    contact_number: { type: String, required: true },
    doctorProfile: {
      type: DoctorProfileSchema,
      required() {
        return this.role === "doctor";
      },
    },
    patientProfile: {
      type: PatientProfileSchema,
      required() {
        return this.role === "patient";
      },
    },
    is_verified: { type: Boolean, default: false },
    is_blocked: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

UserSchema.pre("validate", function () {
  if (this.role === "doctor") this.patientProfile = undefined;
  if (this.role === "patient") this.doctorProfile = undefined;
});

export default model("User", UserSchema);
