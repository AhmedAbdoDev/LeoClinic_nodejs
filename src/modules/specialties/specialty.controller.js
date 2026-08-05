import { success } from "zod";
import * as adminService from "./specialty.service.js";

export async function createSpecialty(req, res, next) {
  const specialty = await adminService.createSpecialty(req.body);

  return res.status(201).json({
    success: true,
    message: "Specialty created successfully",
    data: specialty,
  });
}

export async function getAllSpecialties(req, res, next) {
  const specialties = await adminService.getAllSpecialties();

  return res.status(200).json({
    success: true,
    data: specialties,
  });
}

export async function getSpecialtiesById(req, res, next) {
  const id = req.params.id;
  const specialtyById = await adminService.getSpecialtiesById(id);

  return res.status(200).json({
    success: true,
    data: specialtyById,
  });
}

export async function delSpecialtiesById(req, res, next) {
  const id = req.params.id;

  const deleted = await adminService.delSpecialtiesById(id);
  return res.status(200).json({
    success: true,
    message: "deleted successfully",
    data: deleted,
  });
}

export async function updateSpecialtiesById(req, res, next) {
  const id = req.params.id;
  const updeated = await adminService.updateSpecialtiesById(req.body, id);
  return res.status(200).json({
    success: true,
    message: "Updated successfully",
    data: updeated,
  });
}

export async function getAllDeletedSpecialties(req, res) {
  const specialties = await adminService.getAllDeleSpecialties();

  return res.status(200).json({
    success: true,
    data: specialties,
  });
}
export async function restoreDeletedSpecialties(req, res) {
    const id = req.params.id;
  const restored = await adminService.restoreDeletedSpecialties(id);

  return res.status(200).json({
    success: true,
    message:"restored successfully",
    data: restored,
  });
}
