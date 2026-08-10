import * as locationService from "./location.service.js";

export const createLocation = async (req, res) => {
  const result = await locationService.createLocation({
    doctorId: req.user._id,
    data: req.body,
  });

  res.status(201).json({
    success: true,
    data: result,
  });
};

export const updateLocation = async (req, res) => {
  const result = await locationService.updateLocation({
    doctorId: req.user._id,
    data: req.body,
    locationId: req.params.locationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const deleteLocation = async (req, res) => {
  const result = await locationService.deleteLocation({
    doctorId: req.user._id,
    locationId: req.params.locationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getLocations = async (req, res) => {
  const result = await locationService.searchLocation({
    filters: req.query,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getLocationById = async (req, res) => {
  const result = await locationService.getLocationById({
    locationId: req.params.locationId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};
