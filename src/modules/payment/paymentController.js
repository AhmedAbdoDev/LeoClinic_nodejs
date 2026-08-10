import {
  getPaymentRecords,
  getRevenueReport,
} from "../appointments/appointment.service.js";

export const getPaymentRecordsHandler = async (req, res) => {
  const filters = req.query;

  const result = await getPaymentRecords(filters);

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const getRevenueReportHandler = async (req, res) => {
  const filters = req.query;

  const result = await getRevenueReport(filters);

  return res.status(200).json({
    success: true,
    data: result,
  });
};
