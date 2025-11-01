import multer from "multer";
import path from "path";

// 1️⃣ Ensure temp folder exists
const tempDir = path.join(process.cwd(), "Server/public/temp");


// 2️⃣ Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir); // use the ensured folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
