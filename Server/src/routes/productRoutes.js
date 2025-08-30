import express from "express";
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
import { upload, dedupFiles } from "../middlewares/upload.js";

const router = express.Router();

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
  upload.array("images", 10),
  dedupFiles,
  createProduct
);
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  upload.array("images", 10),
  dedupFiles,
  updateProduct
);
router.delete("/:id", authenticateToken, isAdmin, deleteProduct);

export default router;
