import Specialty from "../../models/specialty.model.js";
import AppError from "../../error/AppError.js";

export async function createSpecialty(data) {
  const { name, description } = data;

  const exists = await Specialty.findOne({
    name: name.trim(),
    isDeleted: false,
  });

  if (exists) {
    throw new AppError("Specialty already exists", 409);
  } else {
    const specialty = await Specialty.create({
      name: name.trim(),
      description,
    });
    return specialty;
  }
}

export async function getAllSpecialties() {
  const specialties = await Specialty.find({
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return specialties;
}



export async function getSpecialtiesById(id) {
  const specialtyId = await Specialty.findOne({
    _id: id,
    isDeleted: false,
  });

  return specialtyId;
}

export async function delSpecialtiesById(id) {
  const deleteById = await Specialty.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!deleteById) {
    throw new AppError("not found", 404);
  }

  deleteById.isDeleted = true;
  deleteById.isActive = false;

  await deleteById.save();

  return deleteById;
}



export async function updateSpecialtiesById(data, id) {
  const { name, description } = data;

  const exists = await Specialty.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!exists) {
    throw new AppError("not found", 404);
  }

  exists.name = name;
  exists.description = description;

  await exists.save();

  return exists;
}
