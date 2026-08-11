import Availability from "../../models/availability.model.js";
import Appointment from "../../models/appointment.model.js";
import AppError from "../../error/AppError.js";
import User from "../../models/user.model.js";
import Specialty from "../../models/specialty.model.js";
import Location from "../../models/location.model.js";
import { uploadImage } from "../../services/cloudinary.service.js";
import {
  getDayName,
  getMinutesFromDate,
  normalizeDay,
} from "../appointments/appointment.utils.js";
import { minutesToTimeLabel } from "../../utils/time.js";

const generateSlots = ({ start_time, end_time, slot_duration_minutes }) => {
  const slots = [];

  for (
    let slotStart = start_time;
    slotStart + slot_duration_minutes <= end_time;
    slotStart += slot_duration_minutes
  ) {
    slots.push({
      start_time: slotStart,
      end_time: slotStart + slot_duration_minutes,
      is_booked: false,
    });
  }

  return slots;
};

const doNewSlotsOverlapExisting = (existingSlots, newSlots) => {
  return newSlots.some((newSlot) =>
    existingSlots.some(
      (existing) =>
        newSlot.start_time < existing.end_time &&
        newSlot.end_time > existing.start_time,
    ),
  );
};

export const getDoctorAvailableSlots = async ({
  doctorId,
  date,
  locationId,
}) => {
  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) throw new AppError("Doctor not found", 404);

  const appointmentDate = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(appointmentDate.getTime()))
    throw new AppError("Invalid date format", 400);

  const dayName = getDayName(appointmentDate);
  const normalizedDay = normalizeDay(dayName);

  const availabilityQuery = {
    doctor_id: doctorId,
    day: { $regex: new RegExp(`^${normalizedDay}$`, "i") },
  };
  if (locationId) availabilityQuery.location_id = locationId;

  const availabilities = await Availability.find(availabilityQuery);

  const startOfDay = new Date(appointmentDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctor_id: doctorId,
    appointment_date: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: "cancelled" },
  });

  const appointmentMap = new Map();
  for (const appointment of appointments) {
    const key = `${appointment.availability_id}-${appointment.slot_id}`;
    appointmentMap.set(key, appointment);
  }

  const slots = availabilities.flatMap((availability) =>
    availability.slots.map((slot) => {
      const key = `${availability._id}-${slot._id}`;
      const matchedAppointment = appointmentMap.get(key);
      return {
        availabilityId: availability._id,
        locationId: availability.location_id,
        slotId: slot._id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        label: minutesToTimeLabel(slot.start_time),
        available: matchedAppointment ? false : true,
        appointmentId: matchedAppointment?._id || null,
      };
    }),
  );

  const now = new Date();
  const isToday =
    now.getUTCFullYear() === appointmentDate.getUTCFullYear() &&
    now.getUTCMonth() === appointmentDate.getUTCMonth() &&
    now.getUTCDate() === appointmentDate.getUTCDate();

  const finalSlots = slots.map((slot) => {
    if (!slot.available) return slot;
    if (isToday) {
      const slotDate = new Date(appointmentDate);
      const slotMinutes = slot.start_time;
      slotDate.setUTCHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
      if (slotDate.getTime() <= Date.now()) {
        return { ...slot, available: false, past: true };
      }
    }
    return slot;
  });

  return {
    date,
    day: normalizedDay,
    slots: finalSlots,
  };
};

export const defineAvailability = async ({ doctorId, data }) => {
  const { day, location_id, start_time, end_time, slot_duration_minutes } =
    data;

  const doctor = await User.findOne({
    _id: doctorId,
    "doctorProfile.locations": location_id,
  });

  if (!doctor) throw new AppError("This location is not in your profile", 409);

  const newSlots = generateSlots({
    start_time,
    end_time,
    slot_duration_minutes,
  });

  if (newSlots.length === 0)
    throw new AppError(
      "Range is too short to fit a single slot of that duration",
      400,
    );

  let availability = await Availability.findOne({
    doctor_id: doctorId,
    day,
    location_id,
  });

  if (!availability) {
    availability = await Availability.create({
      doctor_id: doctorId,
      day,
      location_id,
      slots: newSlots,
    });
    return availability;
  }

  if (doNewSlotsOverlapExisting(availability.slots, newSlots))
    throw new AppError(
      "New slots overlap with existing availability for this day",
      409,
    );

  availability.slots.push(...newSlots);
  await availability.save();

  return availability;
};

export const updateAvailability = async ({
  doctorId,
  availabilityId,
  data,
}) => {
  const { start_time, end_time, slot_duration_minutes } = data;

  const availability = await Availability.findOne({
    _id: availabilityId,
    doctor_id: doctorId,
  });

  if (!availability) throw new AppError("Availability not found", 404);

  const availabilitySlotIds = availability.slots.map((slot) => slot._id);
  const hasActiveAppointment = await Appointment.exists({
    availability_id: availability._id,
    slot_id: { $in: availabilitySlotIds },
    status: { $ne: "cancelled" },
  });

  if (hasActiveAppointment)
    throw new AppError(
      "Cannot update: this day already has an active appointment on this availability. Cancel or complete it first.",
      409,
    );

  const newSlots = generateSlots({
    start_time,
    end_time,
    slot_duration_minutes,
  });

  if (newSlots.length === 0)
    throw new AppError(
      "Range is too short to fit a single slot of that duration",
      400,
    );

  availability.slots = newSlots;
  await availability.save();

  return availability;
};

export const deleteAvailabilitySlot = async ({
  doctorId,
  availabilityId,
  slotId,
}) => {
  const availability = await Availability.findOne({
    _id: availabilityId,
    doctor_id: doctorId,
  });

  if (!availability) throw new AppError("Availability not found", 404);

  const slot = availability.slots.id(slotId);

  if (!slot) throw new AppError("Slot not found", 404);

  const hasActiveAppointment = await Appointment.exists({
    availability_id: availability._id,
    slot_id: slot._id,
    status: { $ne: "cancelled" },
  });

  if (hasActiveAppointment)
    throw new AppError(
      "Cannot delete a slot with active appointments", 409,
    );

  slot.deleteOne();

  if (availability.slots.length === 0) {
    await availability.deleteOne();
    return { deleted: true, availabilityRemoved: true };
  }

  await availability.save();

  return { deleted: true, availabilityRemoved: false };
};

export const updateDoctorProfile = async ({ doctorId, data }) => {
  const { contact_number, bio, price, specialty_id } = data;

  if (specialty_id) {
    const specialty = await Specialty.findById(specialty_id);
    if (!specialty || !specialty.isActive || specialty.isDeleted)
      throw new AppError("Invalid specialtyId", 400);
  }

  const updateFields = {};

  if (contact_number !== undefined)
    updateFields.contact_number = contact_number;
  if (bio !== undefined) updateFields["doctorProfile.bio"] = bio;
  if (price !== undefined) updateFields["doctorProfile.price"] = price;
  if (specialty_id !== undefined)
    updateFields["doctorProfile.specialty_id"] = specialty_id;

  const updatedUser = await User.findByIdAndUpdate(
    doctorId,
    { $set: updateFields },
    { new: true, runValidators: true },
  ).select("-password");

  return updatedUser;
};

// export const addDoctorLocation = async ({ doctorId, locationId }) => {
//   const location = await Location.findById(locationId);
//   if (!location) throw new AppError("Location not found", 404);

//   if (location.created_by?.toString() !== doctorId.toString())
//     throw new AppError("You can only add locations you created", 403);

//   const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
//   if (!doctor) throw new AppError("Doctor not found", 404);

//   const alreadyLinked = doctor.doctorProfile.locations.some(
//     (id) => id.toString() === locationId,
//   );
//   if (alreadyLinked) throw new AppError("Location already added", 409);

//   const updatedUser = await User.findByIdAndUpdate(
//     doctorId,
//     { $addToSet: { "doctorProfile.locations": locationId } },
//     { new: true },
//   ).select("-password");

//   return updatedUser;
// };

// export const removeDoctorLocation = async ({ doctorId, locationId }) => {
//   const updatedUser = await User.findByIdAndUpdate(
//     doctorId,
//     { $pull: { "doctorProfile.locations": locationId } },
//     { new: true },
//   ).select("-password");

//   if (!updatedUser) throw new AppError("Doctor not found", 404);

//   return updatedUser;
// };

export const uploadLicenseCertificate = async ({ doctorId, file }) => {
  if (!file) throw new AppError("License certificate is required", 400);

  const doctor = await User.findById(doctorId);

  if (!doctor) throw new AppError("User not found", 404);
  const oldImage = doctor.doctorProfile?.license_certificate?.public_id;
  if (oldImage)
    throw new AppError(
      "You have already uploaded your license certificate.",
      400,
    );

  if (doctor.doctorProfile.approval_status !== "pending_license")
    throw new AppError(
      "Your account is no longer awaiting a license upload.",
      400,
    );
  const uploadedImage = await uploadImage(file.buffer, "doctor-certificates");
  doctor.doctorProfile.license_certificate = {
    url: uploadedImage.url,
    public_id: uploadedImage.publicId,
  };

  doctor.doctorProfile.approval_status = "pending";

  await doctor.save();

  return {
    message: "License certificate uploaded successfully",
  };
};

export const searchDoctors = async ({ filters }) => {
  const { location_id, specialty_id, name, page, limit } = filters;
  const query = { role: "doctor", "doctorProfile.approval_status": "approved" };
  if (specialty_id) query["doctorProfile.specialty_id"] = specialty_id;
  if (location_id) query["doctorProfile.locations"] = location_id;
  if (name) query.name = { $regex: name, $options: "i" };
  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    User.find(query)
      .populate("doctorProfile.specialty_id", "name")
      .populate("doctorProfile.locations", "name address city")
      .skip(skip)
      .limit(limit)
      .select("-password"),

    User.countDocuments(query),
  ]);
  return {
    doctors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getDoctorProfile = async ({ doctorId }) => {
  const doctor = await User.findOne({
    _id: doctorId,
    role: "doctor",
    "doctorProfile.approval_status": "approved",
  })
    .populate("doctorProfile.specialty_id", "name")
    .populate("doctorProfile.locations", "name address city")
    .select("-password");

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }
  const availability = await Availability.find({
    doctor_id: doctorId,
  });

  const availabilities = availability.map((avail) => {
    return {
      ...avail.toObject(),
      slots: avail.slots,
    };
  });

  return {
    doctor,
    availabilities,
  };
};
