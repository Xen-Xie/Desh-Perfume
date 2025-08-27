import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Button from "../reuse/Button";

function Store() {
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
      {/* Desktop Filters Section*/}
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
            menuPortalTarget={document.body} // render menu in body
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }), // keep it on top
            }}
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

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Mobile Filter & Search Bar */}
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
            className="flex-1  border rounded-full p-2 px-5 outline-0 focus:ring-1 focus:ring-secondarytext caret-primarytext placeholder:text-secondarytext"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Mobile Filter Drawer */}
        <div className={`fixed inset-0 z-40 pointer-events-none md:hidden`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              openFilters ? "opacity-100 pointer-events-auto" : "opacity-0"
            }`}
            onClick={() => setOpenFilters(false)}
          />

          {/* Drawer */}
          <div
            className={`absolute left-0 top-0 w-3/4 h-full bg-primarybg p-4 z-50 shadow-lg transform transition-transform duration-300 ${
              openFilters
                ? "translate-x-0 pointer-events-auto"
                : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold mt-5">Filters</h2>
              <button
                className="text-xl"
                onClick={() => setOpenFilters(false)}
                aria-label="Close filters"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

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

            {/* Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 py-2 border rounded"
                onClick={() => {
                  clearFilters();
                  setOpenFilters(false);
                }}
              >
                Clear
              </button>
              <button
                className="flex-1 py-2 bg-primarytext text-cardbg rounded"
                onClick={() => setOpenFilters(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Search bar */}
        <div className="hidden md:flex mb-4">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border rounded-full p-2 px-5 outline-0 focus:ring-1 focus:ring-secondarytext caret-primarytext placeholder:text-secondarytext"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Products */}
        <ProductCard
          searchQuery={searchQuery}
          category={category}
          sortBy={sortBy}
          size={size}
        />
      </main>
    </div>
  );
}

export default Store;
