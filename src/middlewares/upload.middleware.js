import multer from "multer";
import AppError from "../error/AppError.js";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/"))
    return cb(new AppError("Only image files are allowed", 400));
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
