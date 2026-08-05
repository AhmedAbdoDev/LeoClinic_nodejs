import * as doctorService from "./doctor.service.js";

export const defineAvailability = async (req, res) => {
  const availability = await doctorService.defineAvailability({
    doctorId: req.user._id,
    data: req.body,
  });

  res.status(201).json({
    success: true,
    message: "Availability updated successfully",
    data: availability,
  });
};

export const updateAvailability = async (req, res) => {
  const availability = await doctorService.updateAvailability({
    doctorId: req.user._id,
    availabilityId: req.params.availabilityId,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Availability updated successfully",
    data: availability,
  });
};

export const deleteAvailabilitySlot = async (req, res) => {
  const result = await doctorService.deleteAvailabilitySlot({
    doctorId: req.user._id,
    availabilityId: req.params.availabilityId,
    slotId: req.params.slotId,
  });

  res.status(200).json({
    success: true,
    message: "Slot deleted successfully",
    data: result,
  });
};

export const updateProfile = async (req, res) => {
  const updatedUser = await doctorService.updateDoctorProfile({
    doctorId: req.user._id,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
};

export const addLocation = async (req, res) => {
  const updatedUser = await doctorService.addDoctorLocation({
    doctorId: req.user._id,
    locationId: req.body.location_id,
  });

  res.status(200).json({
    success: true,
    message: "Location added successfully",
    data: updatedUser,
  });
};

export const removeLocation = async (req, res) => {
  const updatedUser = await doctorService.removeDoctorLocation({
    doctorId: req.user._id,
    locationId: req.params.locationId,
  });

  res.status(200).json({
    success: true,
    message: "Location removed successfully",
    data: updatedUser,
  });
};

export const uploadLicenseCertificate = async (req, res) => {
  const result = await doctorService.uploadLicenseCertificate({
    doctorId: req.user._id,
    file: req.file,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};
