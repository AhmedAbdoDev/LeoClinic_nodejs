import { success } from "zod";
import * as adminService from "./specialty.service.js";

export async function createSpecialty(req, res, next) {
  try {
    const specialty = await adminService.createSpecialty(req.body);

    return res.status(201).json({
      success: true,
      message: "Specialty created successfully",
      data: specialty,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllSpecialties(req, res, next) {
  try {
    const specialties = await adminService.getAllSpecialties();

    return res.status(200).json({
      success: true,
      data: specialties,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSpecialtiesById(req, res, next) {
  const id = req.params.id;
  try {
    const specialtyById = await adminService.getSpecialtiesById(id);

    return res.status(200).json({
      success: true,
      data: specialtyById,
    });
  } catch (err) {
    next(err);
  }
}

export async function delSpecialtiesById(req, res, next) {
  const id = req.params.id;

  try {
    const deleted = await adminService.delSpecialtiesById(id);
    return res.status(200).json({
      success: true,
      message: "deleted successfully",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSpecialtiesById(req, res, next) {
  const id = req.params.id;
  try {
    const updeated = await adminService.updateSpecialtiesById(req.body, id);
    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updeated,
    });
  } catch (err) {
    next(err);
  }
}
