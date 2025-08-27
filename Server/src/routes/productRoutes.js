import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addRating,
  getProduct,
  getCategories,
  getSizes,
} from "../controllers/productController.js";
import { authenticateToken, isAdmin } from "../middlewares/authorization.js";

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
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/sizes", getSizes);
router.get("/:id", getProduct);
router.post("/:id/rating", authenticateToken, addRating);

// Admin-only
router.post(
  "/",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  createProduct
);
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  updateProduct
);
router.delete("/:id", authenticateToken, isAdmin, deleteProduct);
export default router;
