import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../reuse/Button";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../context/UseCart";

function ProductCard({ searchQuery, sortBy, size, category }) {
  const { user, token } = useAuth();
  const { addToCart, cartItems } = useCart();

  const [products, setProducts] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({}); // { productId: { size, imageUrl } }
  const [stockMap, setStockMap] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null); // Modal

  const [imgLoaded, setImgLoaded] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "https://desh-perfume.onrender.com/api/products"
        );
        setProducts(res.data);

        // Initialize selectedOptions for each product
        const initOptions = {};
        res.data.forEach((p) => {
          const firstSize = p.sizes[0];
          initOptions[p._id] = {
            size: firstSize?.size,
            // CHANGE: initialize image by index 0
            imageUrl: p.images?.[0]?.imageUrl || "",
          };
        });
        setSelectedOptions(initOptions);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  //reset fade state whenever the displayed modal image changes
  const selectedProductId = selectedProduct?._id;
  const selectedImageUrl =
    selectedProductId && selectedOptions[selectedProductId]
      ? selectedOptions[selectedProductId].imageUrl
      : null;

  useEffect(() => {
    if (!selectedProduct) return;
    setImgLoaded(false);
  }, [selectedProduct, selectedImageUrl]);

  // Update stockMap
  useEffect(() => {
    const updatedStock = {};
    products.forEach((product) => {
      product.sizes.forEach((s) => {
        const key = `${product._id}-${s.size}`;
        const inCart =
          cartItems.find(
            (i) => i.product._id === product._id && i.size === s.size
          )?.quantity || 0;
        updatedStock[key] = s.quantity - inCart;
      });
    });
    setStockMap(updatedStock);
  }, [products, cartItems]);

  // Rating helpers
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

  // Filter & sort
  const filteredProducts = products
    // Filter by search query
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by selected category
    .filter((p) => (category === "all" ? true : p.category === category))

    // Filter by size
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

    // Sort by price
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

  // Handle size change
  const handleSizeChange = (productId, size) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    // index-mapped image
    const idx = product.sizes.findIndex((s) => s.size === size);
    const imageUrl =
      product.images?.[idx]?.imageUrl || product.images?.[0]?.imageUrl || "";
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: { size, imageUrl },
    }));
  };
  // Disable scrolling o popup
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedProduct]);
  const [showFullDesc, setShowFullDesc] = useState(false);

  return (
    <>
      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-4">
        {filteredProducts.map((product) => {
          const selected = selectedOptions[product._id] || {};
          const currentPrice =
            product.sizes.find((s) => s.size === selected.size)?.price ||
            Math.min(...product.sizes.map((s) => s.price));

          return (
            <div
              key={product._id}
              className="bg-cardbg shadow-md rounded-lg overflow-hidden flex flex-col justify-between h-full cursor-pointer"
            >
              <img
                src={
                  selected.imageUrl ||
                  product.images[0]?.imageUrl ||
                  "/placeholder.jpg"
                }
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-3 flex flex-col justify-between flex-1">
                <div className="text-center">
                  <h2 className="text-lg font-bold">{product.name}</h2>
                  <p className="font-semibold mt-1">৳ {currentPrice}</p>
                </div>
                <Button
                  onClick={() => setSelectedProduct(product)}
                  className="mt-2 py-[0.3] xs:py-1 px-[0.5] xs:px-4 cursor-pointer"
                >
                  <span className="absolute inset-0 bg-primarytext w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
                  <span className="relative z-10 group-hover:text-primarybg transition-colors duration-300">
                    View Details
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-tranparent backdrop-blur-md bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative bg-cardbg p-4 sm:p-6 rounded-lg max-w-lg w-full mx-2 sm:mx-0">
            <button
              className="absolute top-0 xs:top-1 right-0 xs:right-1 text-primarytext text-2xl font-bold bg-transparent px-[0.3px] xs:px-1 py-[0.2] xs:py-[0.5px] sm:py-1"
              onClick={() => setSelectedProduct(null)}
            >
              <i
                className="fa-solid fa-xmark cursor-pointer text-[18px] xs:text-xl transition-colors
            hover:text-danger hover:animate-spin-forward"
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove("animate-spin-forward");
                  e.currentTarget.classList.add("animate-spin-backward");
                  setTimeout(() => {
                    e.currentTarget.classList.remove("animate-spin-backward");
                  }, 300);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.classList.remove("animate-spin-backward");
                  e.currentTarget.classList.add("animate-spin-forward");
                }}
              />
            </button>

            {/*single image with smooth fade; object-contain to show full image */}
            <div className="w-full h-64 mb-4 flex items-center justify-center overflow-hidden rounded-lg group">
              <img
                key={
                  selectedOptions[selectedProduct._id]?.imageUrl ||
                  selectedProduct.images[0]?.imageUrl
                }
                src={
                  selectedOptions[selectedProduct._id]?.imageUrl ||
                  selectedProduct.images[0]?.imageUrl
                }
                alt={selectedProduct.name}
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-contain transition-transform duration-500 ease-in-out
     ${imgLoaded ? "opacity-100" : "opacity-0"}
     group-hover:scale-110 rounded-lg`}
              />
            </div>

            <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
            <p className="mt-2 text-primarytext font-semibold">
              ৳{" "}
              {selectedProduct.sizes.find(
                (s) => s.size === selectedOptions[selectedProduct._id]?.size
              )?.price ||
                Math.min(...selectedProduct.sizes.map((s) => s.price))}
            </p>
            {/* Description with toggle */}
            {/* Description with toggle */}
            <div className="mt-2 text-secondarytext max-h-24 overflow-y-auto custom-scrollbar">
              <p>
                Description:{" "}
                {selectedProduct.description.split(" ").length > 5
                  ? showFullDesc
                    ? selectedProduct.description
                    : selectedProduct.description
                        .split(" ")
                        .slice(0, 5)
                        .join(" ") + "..."
                  : selectedProduct.description}
              </p>
            </div>

            {selectedProduct.description.split(" ").length > 5 && (
              <button
                className="text-primarytext underline text-sm mt-1"
                onClick={() => setShowFullDesc(!showFullDesc)}
              >
                {showFullDesc ? "Read Less" : "Read More"}
              </button>
            )}

            {/* Sizes */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
              {selectedProduct.sizes.map((s) => (
                <Button
                  key={s.size}
                  value={s.size}
                  onClick={() => handleSizeChange(selectedProduct._id, s.size)}
                  className={`px-[1px] py-[1px] sm:px-3 sm:py-1 border cursor-pointer  text-sm sm:text-base ${
                    selectedOptions[selectedProduct._id]?.size === s.size
                      ? "border-accentone bg-transparent text-secondarytext"
                      : "border-primarytext text-primarybg bg-alert"
                  }`}
                >
                  {s.size}
                </Button>
              ))}
            </div>

            {/* Stock */}
            <p className="mt-2 text-secondarytext">
              In Stock:{" "}
              {stockMap[
                `${selectedProduct._id}-${
                  selectedOptions[selectedProduct._id]?.size
                }`
              ] || 0}
            </p>

            {/* Add to Cart */}
            <Button
              className={`relative mt-4 w-full overflow-hidden group
   ${
     stockMap[
       `${selectedProduct._id}-${selectedOptions[selectedProduct._id]?.size}`
     ] > 0
       ? "bg-success text-primarytext hover:opacity-90 cursor-pointer"
       : "bg-danger text-primarytext cursor-not-allowed"
   }
 `}
              disabled={
                stockMap[
                  `${selectedProduct._id}-${
                    selectedOptions[selectedProduct._id]?.size
                  }`
                ] <= 0
              }
              onClick={() =>
                addToCart(
                  selectedProduct,
                  selectedOptions[selectedProduct._id]?.size
                )
              }
            >
              {stockMap[
                `${selectedProduct._id}-${
                  selectedOptions[selectedProduct._id]?.size
                }`
              ] > 0 ? (
                <>
                  <span className="absolute inset-0 bg-primarytext w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
                  <span className="relative z-10 group-hover:text-primarybg transition-colors duration-300">
                    Add To Cart
                  </span>
                </>
              ) : (
                <>
                  <span className="absolute inset-0 bg-primarytext w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
                  <span className="relative z-10 group-hover:text-primarybg transition-colors duration-300">
                    Sold Out
                  </span>
                </>
              )}
            </Button>

            {/* Star Rating */}
            <div className="flex justify-center items-center mt-3 gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <i
                  key={i}
                  className={`fa-solid fa-star text-sm cursor-pointer ${
                    i < Math.round(getAverageRating(selectedProduct.ratings))
                      ? "text-yellow-400"
                      : "text-gray-300"
                  } hover:text-yellow-400`}
                  onClick={() => {
                    if (!hasRated(selectedProduct))
                      handleStarClick(selectedProduct._id, i + 1);
                  }}
                ></i>
              ))}
              <span className="ml-2 text-sm text-primarytext">
                ({getAverageRating(selectedProduct.ratings)})
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;
