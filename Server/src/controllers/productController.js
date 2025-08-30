import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// helper to upload buffer to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "products",
          public_id: file.hash, // use sha256 hash from middleware
          overwrite: false, // prevent overwriting duplicates
          resource_type: "image",
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      )
      .end(file.buffer);
  });
};

// Create New Product
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    // Parse sizes from JSON string
    let sizes = [];
    if (req.body.sizes) sizes = JSON.parse(req.body.sizes);

    const uploadedImages = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file);
      uploadedImages.push({
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    }

    const product = new Product({
      name,
      price,
      category,
      description,
      sizes,
      images: uploadedImages,
    });
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
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
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, price, category, sizes, description } = req.body;

    // Upload new images if any
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file);
      uploadedImages.push({
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    }

    if (uploadedImages.length > 0) product.images.push(...uploadedImages);
    if (name) product.name = name;
    if (price) product.price = price;
    if (category) product.category = category;
    if (sizes) product.sizes = JSON.parse(sizes);
    if (description) product.description = description;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete all product images from Cloudinary
    await Promise.all(
      product.images.map(async (img) => {
        if (img.publicId) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (err) {
            console.error(
              `Failed to delete image ${img.publicId}:`,
              err.message
            );
          }
        }
      })
    );

    // Delete product from MongoDB
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
