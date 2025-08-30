import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import Button from "../../reuse/Button";
import { useCart } from "../../context/UseCart";
import ContentLoader from "react-content-loader";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullIng, setShowFullIng] = useState(false);
  const [stockMap, setStockMap] = useState({});
  const thumbsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `https://desh-perfume.onrender.com/api/products/${id}`
        );
        const p = res.data;
        setProduct(p);

        if (!selectedSize) {
          const firstSize = p.sizes[0]?.size || "";
          setSelectedSize(firstSize);
          setSelectedImage(p.images?.[0]?.imageUrl || "/placeholder.jpg");
        }

        const initialStock = {};
        p.sizes.forEach((s) => {
          const inCart =
            cartItems.find((i) => i.product._id === p._id && i.size === s.size)
              ?.quantity || 0;
          initialStock[`${p._id}-${s.size}`] = s.quantity - inCart;
        });
        setStockMap(initialStock);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const updatedStock = {};
    product.sizes.forEach((s) => {
      const inCart =
        cartItems.find(
          (i) => i.product._id === product._id && i.size === s.size
        )?.quantity || 0;
      updatedStock[`${product._id}-${s.size}`] = s.quantity - inCart;
    });
    setStockMap(updatedStock);
  }, [cartItems, product]);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const idx = product.sizes.findIndex((s) => s.size === size);
    setSelectedImage(
      product.images?.[idx]?.imageUrl || product.images?.[0]?.imageUrl
    );
  };

  useEffect(() => {
    const checkScroll = () => {
      if (!thumbsRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = thumbsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    };
    const el = thumbsRef.current;
    if (el) {
      checkScroll();
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [product?.images]);

  // Fancy Skeleton Loader
  const SkeletonLoader = () => (
    <ContentLoader
      speed={2}
      width="100%"
      height={500}
      viewBox="0 0 800 500"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Left: Main Image */}
      <rect x="0" y="0" rx="10" ry="10" width="380" height="384" />
      {/* Left: Thumbnails */}
      <rect x="0" y="400" rx="5" ry="5" width="80" height="80" />
      <rect x="90" y="400" rx="5" ry="5" width="80" height="80" />
      <rect x="180" y="400" rx="5" ry="5" width="80" height="80" />

      {/* Right: Product Info */}
      <rect x="400" y="0" rx="5" ry="5" width="380" height="32" /> {/* Name */}
      <rect x="400" y="50" rx="5" ry="5" width="180" height="24" /> {/* Category */}
      <rect x="400" y="90" rx="5" ry="5" width="140" height="32" /> {/* Price */}
      <rect x="400" y="140" rx="5" ry="5" width="64" height="32" /> {/* Sizes */}
      <rect x="470" y="140" rx="5" ry="5" width="64" height="32" />
      <rect x="540" y="140" rx="5" ry="5" width="64" height="32" />
      <rect x="400" y="190" rx="5" ry="5" width="200" height="24" /> {/* Stock */}
      <rect x="400" y="230" rx="5" ry="5" width="380" height="48" /> {/* Button */}
    </ContentLoader>
  );

  if (loading) return <SkeletonLoader />;
  if (!product) return <p className="text-center mt-20">Product not found.</p>;

  const stockKey = `${product._id}-${selectedSize}`;
  const inStock = stockMap[stockKey] > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto font-primary">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="flex flex-col items-center">
          <div className="w-full mb-3">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 hover:scale-105 shadow-lg"
            />
          </div>
          {/* Thumbnails */}
          <div className="relative w-full mt-4">
            {canScrollLeft && (
              <Button
                onClick={() =>
                  thumbsRef.current.scrollBy({ left: -120, behavior: "smooth" })
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-primarytext border rounded-full z-10 px-[3px] py-[5px] cursor-pointer"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </Button>
            )}
            <div
              ref={thumbsRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide px-8"
            >
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img.imageUrl}
                  alt={`thumb-${i}`}
                  className={`w-20 h-20 object-contain border rounded-md cursor-pointer transition-all duration-300 ${
                    selectedImage === img.imageUrl
                      ? "border-primarytext scale-105"
                      : "border-gray-300 hover:border-primarytext"
                  }`}
                  onClick={() => setSelectedImage(img.imageUrl)}
                />
              ))}
            </div>
            {canScrollRight && (
              <Button
                onClick={() =>
                  thumbsRef.current.scrollBy({ left: 120, behavior: "smooth" })
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-primarytext border rounded-full z-10 px-[3px] py-[5px] cursor-pointer"
              >
                <i className="fa-solid fa-arrow-right"></i>
              </Button>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primarytext">
              {product.name}
            </h1>
            <p className="text-lg text-secondarytext font-secondary mt-1 font-semibold">
              Category:{" "}
              <span className="text-primarytext font-primary font-medium">
                {product.category}
              </span>
            </p>

            <p className="text-2xl text-primarytext font-semibold mt-4">
              ৳
              {product.sizes.find((s) => s.size === selectedSize)?.price ||
                Math.min(...product.sizes.map((s) => s.price))}
            </p>

            {/* Description */}
            <div className="mt-4 text-primarytext">
              <p>
                {product.ingredients.split(" ").length > 20
                  ? showFullIng
                    ? product.ingredients
                    : product.ingredients.split(" ").slice(0, 20).join(" ") +
                      "..."
                  : product.ingredients}
              </p>
              {product.ingredients.split(" ").length > 20 && (
                <button
                  className="text-primarytext underline text-sm mt-1"
                  onClick={() => setShowFullIng(!showFullIng)}
                >
                  {showFullIng ? "Read Less" : "Read More"}
                </button>
              )}
            </div>

            {/* Sizes */}
            <div className="flex gap-2 mt-6 flex-wrap">
              {product.sizes.map((s, i) => (
                <Button
                  key={i}
                  onClick={() => handleSizeChange(s.size)}
                  className={`px-4 py-1 border text-sm sm:text-base transition-all cursor-pointer ${
                    selectedSize === s.size
                      ? "border-accentone bg-transparent text-secondarytext"
                      : "border-primarytext text-primarybg bg-alert"
                  }`}
                >
                  {s.size}
                </Button>
              ))}
            </div>

            <p className="mt-2 text-secondarytext">
              In Stock: {stockMap[stockKey] || 0}
            </p>
          </div>

          {/* Add To Cart Button */}
          <Button
            className={`relative mt-4 w-full overflow-hidden group ${
              inStock
                ? "bg-success text-primarytext hover:opacity-90 cursor-pointer"
                : "bg-danger text-primarytext cursor-not-allowed"
            }`}
            disabled={!inStock}
            onClick={() => addToCart(product, selectedSize)}
          >
            {inStock ? (
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
        </div>
      </div>
      {/* Description */}
      <div className="mt-6 text-primarytext">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p>
          {product.description.split(" ").length > 20
            ? showFullDesc
              ? product.description
              : product.description.split(" ").slice(0, 20).join(" ") + "..."
            : product.description}
        </p>
        {product.description.split(" ").length > 20 && (
          <button
            className="text-primarytext underline text-sm mt-1"
            onClick={() => setShowFullDesc(!showFullDesc)}
          >
            {showFullDesc ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
