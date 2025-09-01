import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Button from "../reuse/Button";
import ContentLoader from "react-content-loader";

function ProductCard({
  searchQuery,
  sortBy,
  size,
  category,
  nameFilter,
  targetCategory,
}) {
  const navigateTo = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading
  const [selectedOptions, setSelectedOptions] = useState({}); // { productId: { size, imageUrl } }
  const [currentPages, setCurrentPages] = useState({}); // { categoryName: currentPage }
  const productsPerPage = 12; // You can adjust this as needed

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
            imageUrl: p.images?.[0]?.imageUrl || "",
          };
        });
        setSelectedOptions(initOptions);

        // Initialize currentPages per category
        const initPages = {};
        res.data.forEach((p) => {
          if (!initPages[p.category]) initPages[p.category] = 1;
        });
        setCurrentPages(initPages);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter, sort, group
  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    // Filter by targetCategory first
    .filter((p) => (targetCategory ? p.category === targetCategory : true))
    // Filter by search query
    // extra filter for perfume/oil collection
    .filter((p) =>
      nameFilter ? new RegExp(nameFilter, "i").test(p.name) : true
    )
    .filter((p) => (category === "all" ? true : p.category === category))
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
      if (sortBy === "low-to-high")
        return (
          Math.min(...a.sizes.map((s) => s.price)) -
          Math.min(...b.sizes.map((s) => s.price))
        );
      if (sortBy === "high-to-low")
        return (
          Math.max(...b.sizes.map((s) => s.price)) -
          Math.max(...a.sizes.map((s) => s.price))
        );
      return 0;
    });

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  // Fancy Skeleton with react-content-loader
  const SkeletonCard = () => (
    <ContentLoader
      speed={2}
      width="100%"
      height={250}
      viewBox="0 0 200 250"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      className="w-full h-full"
    >
      <rect x="0" y="0" rx="10" ry="10" width="200" height="120" />{" "}
      {/* Image */}
      <rect x="10" y="130" rx="4" ry="4" width="180" height="20" /> {/* Name */}
      <rect x="10" y="160" rx="4" ry="4" width="100" height="20" />{" "}
      {/* Price */}
      <rect x="10" y="190" rx="6" ry="6" width="180" height="30" />{" "}
      {/* Button */}
    </ContentLoader>
  );

  const handlePageChange = (categoryName, page) => {
    setCurrentPages((prev) => ({ ...prev, [categoryName]: page }));
  };

  // Generate visible page numbers (5 max)
  const getVisiblePages = (currentPage, totalPages) => {
    const maxVisible = 5;
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        Object.entries(groupedProducts).map(([catName, catProducts]) => {
          const currentPage = currentPages[catName] || 1;
          const totalPages = Math.ceil(catProducts.length / productsPerPage);
          const startIndex = (currentPage - 1) * productsPerPage;
          const currentProducts = catProducts.slice(
            startIndex,
            startIndex + productsPerPage
          );
          const visiblePages = getVisiblePages(currentPage, totalPages);

          return (
            <div key={catName} className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">
                {catName} ({catProducts.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 p-4">
                {currentProducts.map((product) => {
                  const selected = selectedOptions[product._id] || {};
                  const currentPrice =
                    product.sizes.find((s) => s.size === selected.size)
                      ?.price || Math.min(...product.sizes.map((s) => s.price));

                  return (
                    <div
                      key={product._id}
                      className="bg-cardbg shadow-md rounded-lg overflow-hidden flex flex-col justify-between h-full cursor-pointer relative"
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
                      {/* BADGES */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.sizes.some((s) => s.isOnSale) && (
                          <span className="bg-secondarytext text-primarybg text-xs px-2 py-1 rounded">
                            On Sale
                          </span>
                        )}
                        {product.sizes.every((s) => s.quantity === 0) && (
                          <span className="bg-danger text-primarybg text-xs px-2 py-1 rounded">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1">
                        <div className="text-center">
                          <h2 className="text-lg font-semibold leading-[21px]">
                            {product.name}
                          </h2>
                          {/* PRICE DISPLAY */}
                          {product.sizes.some((s) => s.isOnSale) ? (
                            <>
                              <p className="text-primarytext line-through decoration-[2px] decoration-danger">
                                ৳{" "}
                                {Math.min(...product.sizes.map((s) => s.price))}
                              </p>
                              <p className="text-danger font-bold mt-1">
                                ৳{" "}
                                {Math.min(
                                  ...product.sizes
                                    .filter((s) => s.isOnSale)
                                    .map((s) => s.salePrice)
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold mt-1">
                              ৳ {currentPrice}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() =>
                            navigateTo(`/store/product/${product._id}`)
                          }
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  {/* Prev Button */}
                  <Button
                    onClick={() => handlePageChange(catName, currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-1 rounded-full transition ${
                      currentPage === 1
                        ? "bg-secondarytext  text-primatytext cursor-not-allowed"
                        : "bg-transparent border text-primarytext hover:bg-secondarytext transition-all duration-300"
                    }`}
                  >
                    Prev
                  </Button>

                  {/* Page Numbers (5 max) */}
                  {visiblePages.map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(catName, page)}
                      className={`px-4 py-1 rounded-full transition ${
                        currentPage === page
                          ? "bg-secondarytext text-primarytext shadow-md"
                          : "bg-secondarytext/65 text-primarytext/65 hover:bg-secondarytext"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}

                  {/* Next Button */}
                  <Button
                    onClick={() => handlePageChange(catName, currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-1 rounded-full transition ${
                      currentPage === totalPages
                        ? "bg-secondarytext  text-primatytext cursor-not-allowed"
                        : "bg-transparent border text-primarytext hover:bg-secondarytext transition-all duration-300"
                    }`}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

export default ProductCard;
