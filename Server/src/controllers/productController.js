import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// Create New Product

export const createProduct = async (req,res) => {
  try{
    const {name,category,sizes,description,priceRange,} = req.body;
    const parseSizes = sizes ? JSON.parse(sizes) : [];
    const product = new Product({
      name,
      category,
      sizes: parseSizes,
      description,
      priceRange,
      images: []
    });
    if(req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {folder: "Products"});
      product.images.push({
        imageUrl: result.secure_url,
        publicId: result.public_id
      });
    }
    await product.save();
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({message:"Error Creating Product"},err)
  }
};

// Get All Products

export const getProducts = async (req,res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch(err) {
    res.status(500).json({ message: "Error fetching products",err});
  }
}