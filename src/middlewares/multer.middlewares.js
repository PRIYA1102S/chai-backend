// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../../public/temp")
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// })

// export const upload = multer({ storage, })

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// 👇 Create __dirname manually for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempPath = path.join(__dirname, "../../public/temp");
    console.log("Multer saving file to:", tempPath);
    cb(null, tempPath);
  },
  filename: function (req, file, cb) {
    console.log("Multer filename:", file.originalname);
    cb(null, file.originalname);
  }
});

export const upload = multer({ 
  storage,
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

