import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../reuse/Button";
import { useAuth } from "../auth/useAuth";

function ProductCard() {
  const { user, token } = useAuth();
  const [selectedSize, setSelectedSize] = useState(null);
  const [zoomedProductId, setZoomedProductId] = useState(null);
  const [products, setProducts] = useState([]);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  // Handle user selecting a specific size for a product
  const handleSizeSelect = (productId, size) => {
    setSelectedSize({ productId, size });
  };
  // Handle star rating click
  const handleStarClick = async (productId, value) => {
    if (!user) return alert("Please login to rate");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/products/${productId}/rating`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? res.data : p))
      );
    } catch (err) {
      console.error("Failed to rate product:", err);
    }
  };
  // Calculate average rating of a product
  const getAverageRating = (ratings) => {
    if (!ratings?.length) return 0;
    const total = ratings.reduce((sum, r) => sum + r.value, 0);
    return (total / ratings.length).toFixed(1);
  };
  // Check if the current user has already rated a product
  const hasRated = (product) =>
    product.ratings?.some((r) => r.user === user?._id);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {products.map((product) => {
        const currentSize =
          selectedSize?.productId === product._id
            ? selectedSize.size
            : product.sizes[0]?.size;

        const currentSizeObj = product.sizes.find(
          (s) => s.size === currentSize
        );
        const currentPrice = currentSizeObj?.price || 0;
        const currentStock = currentSizeObj?.quantity || 0;

        const averageRating = getAverageRating(product.ratings);

        return (
          <div
            key={product._id}
            className="bg-cardbg shadow-md rounded-lg overflow-hidden flex flex-col font-primary"
          >
            {/* Image + Sold Out Badge */}
            <div className="relative overflow-hidden">
              <img
                src={product.images[0]?.imageUrl || "/placeholder.jpg"}
                alt={product.name}
                className={`w-full h-48 object-cover transform transition-transform duration-300 ease-in-out ${
                  zoomedProductId === product._id ? "scale-110" : ""
                } hover:scale-110`}
                onTouchStart={() =>
                  setZoomedProductId(
                    zoomedProductId === product._id ? null : product._id
                  )
                }
              />
              {currentStock === 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Sold Out
                </span>
              )}
            </div>

            {/* Card Info */}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-bold text-primarytext text-center font-secondary">
                {product.name}
              </h2>

              {/* Stars + Average Rating */}
              <div className="flex justify-center items-center mt-2 gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={`fa-solid fa-star text-sm cursor-pointer ${
                      i < Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } hover:text-yellow-400`}
                    onClick={() => {
                      if (!hasRated(product))
                        handleStarClick(product._id, i + 1);
                    }}
                  ></i>
                ))}
                <span className="ml-2 text-sm text-primarytext">
                  ({averageRating})
                </span>
              </div>

              {/* Sizes Buttons */}
              <div className="flex justify-center mt-3 gap-2">
                {product.sizes.map((s) => (
                  <div key={s.size} className="relative group">
                    <Button
                      value={s.size}
                      onClick={() => handleSizeSelect(product._id, s.size)}
                      className={`px-2 py-1 text-xs border ${
                        currentSize === s.size
                          ? "border-accentone bg-transparent text-secondarytext"
                          : "border-primarytext text-primarybg bg-alert"
                      }`}
                    >
                      {s.size}
                    </Button>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-accentone text-cardbg text-xs px-4 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      ৳{s.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price + Add To Cart */}
              <div className="mt-auto flex flex-col items-center gap-2">
                <p className="font-semibold text-primarytext text-center">
                  ৳ {currentPrice}
                </p>
                <p className="text-secondarytext">In Stock:{currentStock}</p>

                <Button
                  className={`bg-transparent border border-primarytext text-primarytext px-4 py-1 rounded-lg hover:scale-105 cursor-pointer ${
                    currentStock === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={currentStock === 0}
                >
                  {currentStock === 0 ? "Sold Out" : "Add To Cart"}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductCard;
