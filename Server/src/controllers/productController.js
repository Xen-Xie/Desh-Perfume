import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// Create New Product
export const createProduct = async (req, res) => {
  try {
    const { name, category, sizes, description } = req.body;
    const parseSizes = sizes ? JSON.parse(sizes) : [];

    const product = new Product({
      name,
      category,
      sizes: parseSizes,
      description,
      images: [],
    });

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      product.images.push({
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    }

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating product", error: err.message });
  }
};

// Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // no populate since category is string
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: err.message });
  }
};

// Get Single Product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: err.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { name, category, sizes, description } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (sizes) product.sizes = JSON.parse(sizes);

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      product.images.push({
        imageUrl: result.secure_url,
        publicId: result.public_id,
        caption: req.body.caption || "",
      });
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating product", error: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// Add rating
export const addRating = async (req, res) => {
  try {
    const { value } = req.body;
    const userId = req.user.id; // Assuming auth middleware sets req.user

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingRating = product.ratings.find(
      (r) => r.user.toString() === userId
    );

    if (existingRating) {
      existingRating.value = value;
    } else {
      product.ratings.push({ user: userId, value });
    }

    const total = product.ratings.reduce((sum, r) => sum + r.value, 0);
    product.averageRating = total / product.ratings.length;

    await product.save();
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding rating", error: error.message });
  }
};

// Get Category
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};
// Get Sizes
export const getSizes = async (req, res) => {
  try {
    const products = await Product.find({}, "sizes").lean();

    // Extract just the size names
    const allSizes = products.flatMap(
      (p) => p.sizes.map((s) => s.size) // extract 'size' property
    );

    const uniqueSizes = [...new Set(allSizes)]; // get unique values

    res.json(uniqueSizes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
