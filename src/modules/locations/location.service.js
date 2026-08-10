import AppError from "../../error/AppError.js";
import User from "../../models/user.model.js";
import Location from "../../models/location.model.js";
import Availability from "../../models/availability.model.js";

export const createLocation = async ({ doctorId, data }) => {
  const { name, address, city, phone } = data;

  const existing = await Location.findOne({
    name,
    address,
    city,
    created_by: doctorId,
  });

  if (existing) throw new AppError("You already created this location", 409);

  const location = await Location.create({
    name,
    address,
    city,
    phone,
    created_by: doctorId,
  });

  const doctor = await User.findByIdAndUpdate(
    doctorId,
    { $addToSet: { "doctorProfile.locations": location._id } },
    { new: true, runValidators: true },
  ).select("-password");

  return { location, doctor };
};

export const updateLocation = async ({ doctorId, data, locationId }) => {
  const { name, address, city, phone } = data;

  const current = await Location.findOne({
    _id: locationId,
    created_by: doctorId,
  });
  if (!current) throw new AppError("Location not found", 404);

  const nextName = name ?? current.name;
  const nextAddress = address ?? current.address;
  const nextCity = city ?? current.city;

  if (
    nextName !== current.name ||
    nextAddress !== current.address ||
    nextCity !== current.city
  ) {
    const existing = await Location.findOne({
      name: nextName,
      address: nextAddress,
      city: nextCity,
      created_by: doctorId,
      _id: { $ne: locationId },
    });
    if (existing) throw new AppError("You already created this location", 409);
  }

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (address !== undefined) updateFields.address = address;
  if (city !== undefined) updateFields.city = city;
  if (phone !== undefined) updateFields.phone = phone;

  const location = await Location.findOneAndUpdate(
    { _id: locationId, created_by: doctorId },
    { $set: updateFields },
    { new: true, runValidators: true },
  );

  return location;
};

export const deleteLocation = async ({ doctorId, locationId }) => {
  const location = await Location.findOne({
    _id: locationId,
    created_by: doctorId,
  });

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  const hasAvailability = await Availability.exists({
    doctor_id: doctorId,
    location_id: locationId,
  });

  if (hasAvailability) {
    throw new AppError(
      "This location has active availability slots — remove them first",
      409,
    );
  }
  const doctor = await User.findById(doctorId);
  if (!doctor) throw new AppError("Doctor not found", 404);

  await location.deleteOne();

  const updatedDoctor = await User.findOneAndUpdate(
    { _id: doctorId },
    { $pull: { "doctorProfile.locations": locationId } },
    { new: true, runValidators: true },
  ).select("-password");

  return { deleted: true, doctor: updatedDoctor };
};

export const searchLocation = async ({ filters }) => {
  const { location_id, address, name, city, page, limit } = filters;

  const query = {};

  if (location_id) query._id = location_id;
  if (address) query.address = address;
  if (city) query.city = city;
  if (name) query.name = { $regex: name, $options: "i" };
  const approvedDoctorIds = await User.find(
    { role: "doctor", "doctorProfile.approval_status": "approved" },
    { _id: 1 },
  ).lean();

  query.created_by = { $in: approvedDoctorIds.map((d) => d._id) };

  const skip = (page - 1) * limit;

  const [locations, total] = await Promise.all([
    Location.find(query)
      .populate("created_by", "name email")
      .skip(skip)
      .limit(limit),
    Location.countDocuments(query),
  ]);
  return {
    locations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getLocationById = async ({ locationId }) => {
  const location = await Location.findOne({ _id: locationId }).populate(
    "created_by",
    "name email",
  );

  if (!location) {
    throw new AppError("Location not found", 404);
  }

  return location;
};
