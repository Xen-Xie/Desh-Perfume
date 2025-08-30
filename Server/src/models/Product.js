import mongoose from "mongoose";

// Product Size,Price,In-Stock,Quantity Schema
const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
  imageUrl: { type: String, default: "" },
});

// Image Schema
const imageSchema = new mongoose.Schema({
  imageUrl: String,
  publicId: String,
  createdAt: { type: Date, default: Date.now },
});

// Rating Schema
const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  value: { type: Number, min: 1, max: 5, required: true },
});

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Product Category is required"],
      trim: true,
    },
    sizes: [sizeSchema],
    images: {
      type: [imageSchema],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one image is required"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    ratings: [ratingSchema],
    priceRange: {
      type: String,
      default: "0-0",
    },
    soldOut: {
      type: Boolean,
      default: false,
    },
    ingredients: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to compute priceRange and soldOut
productSchema.pre("save", function (next) {
  if (this.sizes && this.sizes.length > 0) {
    const inStockSizes = this.sizes.filter((s) => s.inStock && s.quantity > 0);
    if (inStockSizes.length === 0) {
      this.soldOut = true;
      this.priceRange = "0-0";
    } else {
      this.soldOut = false;
      const prices = inStockSizes.map((s) => s.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      this.priceRange =
        minPrice === maxPrice ? `${minPrice}` : `${minPrice}-${maxPrice}`;
    }
  } else {
    this.soldOut = true;
    this.priceRange = "0-0";
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
