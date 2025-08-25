import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {createProduct} from "../controllers/productController.js";

const router = express.Router();

// Multer + Cloudinary config
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), createProduct);

export default router;
