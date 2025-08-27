import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../reuse/Button";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../context/UseCart";

function ProductCard({ searchQuery, sortBy, size }) {
  const { user, token } = useAuth();
  const { addToCart, cartItems } = useCart();

  const [selectedSize, setSelectedSize] = useState(null);
  const [zoomedProductId, setZoomedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({}); // Tracks real stock per product-size

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://desh-perfume.onrender.com/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Update stockMap whenever products or cartItems change
  useEffect(() => {
    const updatedStock = {};
    products.forEach((product) => {
      product.sizes.forEach((s) => {
        const key = `${product._id}-${s.size}`;
        const inCart = cartItems.find(
          (i) => i.product._id === product._id && i.size === s.size
        )?.quantity || 0;
        updatedStock[key] = s.quantity - inCart;
      });
    });
    setStockMap(updatedStock);
  }, [products, cartItems]);

  // Rating logic
  const handleStarClick = async (productId, value) => {
    if (!user) return alert("Please login to rate");

    try {
      const res = await axios.post(
        `https://desh-perfume.onrender.com/api/products/${productId}/rating`,
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

  const getAverageRating = (ratings) => {
    if (!ratings?.length) return 0;
    const total = ratings.reduce((sum, r) => sum + r.value, 0);
    return (total / ratings.length).toFixed(1);
  };

  const hasRated = (product) =>
    product.ratings?.some((r) => r.user === user?._id);

  //  Filtering dynamically
  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((p) =>
      size.length === 0
        ? true
        : p.sizes.some((s) =>
            size.some(
              (selectedSize) =>
                s.size.toLowerCase() === selectedSize.toLowerCase()
            )
          )
    )
    .sort((a, b) => {
      if (sortBy === "low-to-high") {
        return (
          Math.min(...a.sizes.map((s) => s.price)) -
          Math.min(...b.sizes.map((s) => s.price))
        );
      }
      if (sortBy === "high-to-low") {
        return (
          Math.max(...b.sizes.map((s) => s.price)) -
          Math.max(...a.sizes.map((s) => s.price))
        );
      }
      return 0;
    });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {filteredProducts.map((product) => {
        const currentSize =
          selectedSize?.productId === product._id
            ? selectedSize.size
            : product.sizes[0]?.size;

        const currentSizeObj = product.sizes.find(
          (s) => s.size === currentSize
        );
        const currentPrice = currentSizeObj?.price || 0;

        // Real stock from stockMap
        const currentStock = stockMap[`${product._id}-${currentSize}`] || 0;

        const averageRating = getAverageRating(product.ratings);

        return (
          <div
            key={product._id}
            className="bg-cardbg shadow-md rounded-lg overflow-hidden flex flex-col font-primary"
          >
            {/* Product Image */}
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
              {currentStock <= 0 && (
                <span className="absolute top-2 right-2 bg-danger text-primarybg text-xs font-bold px-2 py-1 rounded">
                  Sold Out
                </span>
              )}
            </div>

            {/* Card Info */}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-bold text-primarytext text-center">
                {product.name}
              </h2>

              {/* Stars + Avg */}
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

              {/* Sizes */}
              <div className="flex justify-center mt-3 gap-2">
                {product.sizes.map((s) => (
                  <div key={s.size} className="relative group">
                    <Button
                      value={s.size}
                      onClick={() =>
                        setSelectedSize({
                          productId: product._id,
                          size: s.size,
                        })
                      }
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

              {/* Price + Stock + Cart */}
              <div className="mt-auto flex flex-col items-center gap-2">
                <p className="font-semibold text-primarytext text-center">
                  ৳ {currentPrice}
                </p>
                <p className="text-secondarytext">In Stock: {currentStock}</p>

                <Button
                  className={`relative overflow-hidden bg-transparent border border-primarytext text-primarytext px-4 py-1 rounded-lg cursor-pointer ${
                    currentStock <= 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 transition"
                  }`}
                  disabled={currentStock <= 0}
                  onClick={() => addToCart(product, currentSize)}
                >
                  <span className="absolute inset-0 bg-primarytext w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
                  <span className="relative z-10 group-hover:text-primarybg transition-colors duration-300">
                    {currentStock <= 0 ? "Sold Out" : "Add To Cart"}
                  </span>
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
