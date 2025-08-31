import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router";
import ProductCard from "../components/ProductCard";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Button from "../reuse/Button";
import HeroCard from "../components/HeroCard";

function Store({ nameFilter = "", targetCategory }) {
  const location = useLocation(); // Get current route
  const isMainStore = location.pathname === "/store"; // Check if at main store page

  const [openFilters, setOpenFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [size, setSize] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const animatedComponents = makeAnimated();

  // Fetch dynamic categories and sizes
  useEffect(() => {
    axios
      .get("https://desh-perfume.onrender.com/api/products/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));

    axios
      .get("https://desh-perfume.onrender.com/api/products/sizes")
      .then((res) => setSizes(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Prevent background scroll when mobile filter drawer is open
  useEffect(() => {
    document.body.style.overflow = openFilters ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openFilters]);

  const clearFilters = () => {
    setCategory("all");
    setSize([]);
    setSortBy("");
  };

  // Helper to map API data for react-select
  const mapToOptions = (arr, field) =>
    arr.map((item) => ({
      value: item[field] || item, // fallback if item is a string
      label: item[field] || item,
    }));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-primarybg text-primarytext font-primary">
      {/* Desktop Filters Section (hide on main store page) */}
      {!isMainStore && (
        <aside className="hidden md:block w-64 p-4 border-r border-gray-300">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Category</label>
            <Select
              options={[
                { value: "all", label: "All" },
                ...mapToOptions(categories, "name"),
              ]}
              value={{ value: category, label: category }}
              onChange={(selected) => setCategory(selected.value)}
            />
          </div>

          {/* Size Filter */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Size</label>
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={[...mapToOptions(sizes, "size")]}
              value={size.map((s) => ({ value: s, label: s }))}
              onChange={(selected) => setSize(selected.map((s) => s.value))}
            />
          </div>

          {/* Sort Filter */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Sort By Price</label>
            <Select
              options={[
                { value: "", label: "None" },
                { value: "low-to-high", label: "Low to High" },
                { value: "high-to-low", label: "High to Low" },
              ]}
              value={{ value: sortBy, label: sortBy || "None" }}
              onChange={(selected) => setSortBy(selected.value)}
            />
          </div>

          <Button
            onClick={clearFilters}
            className="relative overflow-hidden w-full py-2 border border-primarytext text-primarytext rounded-lg mt-2 bg-transparent group cursor-pointer"
          >
            <span className="absolute inset-0 bg-primarytext w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
            <span className="relative z-10 group-hover:text-primarybg transition-colors duration-300">
              Clear Filters
            </span>
          </Button>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4">
        {isMainStore ? (
          // If at /store show hero card
          <HeroCard />
        ) : (
          // Otherwise show product grid
          <>
            {/* Mobile Search & Filters */}
            <div className="md:hidden flex items-center gap-2 mb-4">
              <button
                className="p-2 rounded text-primarytext"
                onClick={() => setOpenFilters(true)}
                aria-label="Open filters"
              >
                <div className="flex flex-col">
                  <i className="fa-solid fa-filter text-xl"></i>
                  <span className="text-primarytext">Filter</span>
                </div>
              </button>
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 border rounded-full p-2 px-5 outline-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border rounded-full p-2 px-5 outline-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Product Cards */}
            <ProductCard
              searchQuery={searchQuery}
              category={category}
              sortBy={sortBy}
              size={size}
              nameFilter={nameFilter}
              targetCategory={targetCategory}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default Store;
