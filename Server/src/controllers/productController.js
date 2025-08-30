import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// Create New Product
export const createProduct = async (req, res) => {
  try {
    const { name, category, sizes, description } = req.body;
    const parseSizes = sizes ? JSON.parse(sizes) : [];

    // Assign images to sizes
    if (req.files && req.files.length > 0) {
      parseSizes.forEach((s, idx) => {
        if (req.files[idx]) {
          s.imageUrl = req.files[idx].path; // temporary path
        }
      });
    }

    // Upload images to Cloudinary
    for (const [idx, file] of (req.files || []).entries()) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
      parseSizes[idx].imageUrl = result.secure_url; // assign final URL
    }

    const product = new Product({
      name,
      category,
      sizes: parseSizes,
      description,
      images: parseSizes.map((s) => ({ imageUrl: s.imageUrl, publicId: "" })),
    });

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

    let parseSizes = sizes ? JSON.parse(sizes) : product.sizes;

    // Assign images to sizes
    if (req.files && req.files.length > 0) {
      parseSizes.forEach((s, idx) => {
        if (req.files[idx]) {
          s.imageUrl = req.files[idx].path; // temporary path
        }
      });

      for (const [idx, file] of req.files.entries()) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        parseSizes[idx].imageUrl = result.secure_url;
      }
    }

    product.sizes = parseSizes;
    product.images = parseSizes.map((s) => ({
      imageUrl: s.imageUrl,
      publicId: "",
    }));

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

    // Delete all size images from Cloudinary
    await Promise.all(
      product.sizes.map(async (s) => {
        if (s.publicId) {
          try {
            await cloudinary.uploader.destroy(s.publicId);
          } catch (err) {
            console.error(`Failed to delete image ${s.publicId}:`, err.message);
          }
        }
      })
    );

    // Delete product
    await product.deleteOne();
    res.json({ message: "Product and images deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: err.message });
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
