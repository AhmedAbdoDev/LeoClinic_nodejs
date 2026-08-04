import { date, success } from "zod";
import { approveDoctor, rejectDoctor } from "./approveDoctor.service.js";

export async function doctorApprove(req, res, next) {
  const id = req.params.doctorId;
  const data = await approveDoctor(id);

  return res.status(200).json({
    success: true,
    message: "Doctor approved successfully",
    data: data,
  });
}

export async function doctorReject(req, res, next) {
  const id = req.params.doctorId;
  const data = await rejectDoctor(id);
  return res.status(200).json({
    success: true,
    message: "Doctor rejected successfully",
    data: data,
  });
}
