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
    contact_number: { type: String, required: true },
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
    is_approved: { type: Boolean, default: false },
  },
  { _id: false },
);

const PatientProfileSchema = new Schema(
  {
    contact_number: { type: String, required: true },
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
    is_blocked: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

UserSchema.pre("validate", function () {
  if (this.role === "doctor") this.patientProfile = undefined;
  if (this.role === "patient") this.doctorProfile = undefined;
});

export default model("User", UserSchema);
