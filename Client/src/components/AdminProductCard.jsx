/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Button from "../reuse/Button";

function AdminProductCard() {
  // Base button styling for reuse in edit/delete buttons
  const btnBase =
    "flex-1 h-10 px-3 text-sm font-semibold inline-flex items-center justify-center rounded-md whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-offset-0";

  // State to store all products fetched from the backend
  const [products, setProducts] = useState([]);

  // State to handle the form inputs for adding/editing a product
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    ingredients: "",
    sizes: [
      {
        size: "",
        price: 0,
        quantity: 0,
        image: null,
        existingImage: null,
      },
    ],
  });
  const formRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [expandedIng, setExpandedIng] = useState({});

  // Fetch all products from backend API
  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "https://desh-perfume.onrender.com/api/products"
      );
      const productsWithIndex = res.data.map((p) => ({
        ...p,
        currentImageIndex: 0,
      }));
      setProducts(productsWithIndex);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle text inputs (name, category, description)
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle changes in sizes array (size, price, quantity)
  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[index][field] =
      field === "price" || field === "quantity" ? Number(value) : value;
    setFormData({ ...formData, sizes: updatedSizes });
  };

  // Add a new size object to the sizes array
  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [
        ...formData.sizes,
        { size: "", price: 0, quantity: 0, image: null, existingImage: null },
      ],
    });
  };

  // Remove a size from the sizes array
  const removeSize = (index) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes.splice(index, 1);
    setFormData({ ...formData, sizes: updatedSizes });
  };

  // Handle image change for a specific size
  const handleSizeImageChange = (index, file) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[index].image = file;
    updatedSizes[index].existingImage = null;
    setFormData({ ...formData, sizes: updatedSizes });
  };

  // Handle form submission for adding or editing a product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare form data to send to backend
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("ingredients", formData.ingredients);

      // size images mapping
      const sizesWithoutImages = formData.sizes.map((s) => {
        const { image, existingImage, ...rest } = s;
        return rest;
      });
      data.append("sizes", JSON.stringify(sizesWithoutImages));

      // Append all images separately
      formData.sizes.forEach((s) => {
        if (s.image) data.append("images", s.image);
      });

      const token = localStorage.getItem("token");

      // Send request based on edit or add
      const res = editProduct
        ? await axios.put(
            `https://desh-perfume.onrender.com/api/products/${editProduct._id}`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        : await axios.post(
            "https://desh-perfume.onrender.com/api/products",
            data,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

      // Update products state after edit/add
      if (editProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editProduct._id
              ? { ...res.data, currentImageIndex: 0 }
              : p
          )
        );
        setEditProduct(null);
      } else {
        setProducts([...products, { ...res.data, currentImageIndex: 0 }]);
      }

      // Reset form after submission
      setFormData({
        name: "",
        category: "",
        description: "",
        ingredients: "",
        sizes: [
          {
            size: "",
            price: 0,
            quantity: 0,
            image: null,
            existingImage: null,
          },
        ],
      });

      alert(editProduct ? "Product updated!" : "Product added!");
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  // Delete a product by ID
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://desh-perfume.onrender.com/api/products/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product");
    }
  };

  // Populate form with existing product data for editing
  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      ingredients: product.ingredients,
      sizes: product.sizes.map((s, i) => ({
        size: s.size,
        price: s.price,
        quantity: s.quantity,
        image: null,
        existingImage: product.images?.[i]?.imageUrl || null,
      })),
    });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="p-4 font-primary">
      {/* Form */}
      <form
        ref={formRef}
        className="mb-6 bg-cardbg p-4 rounded shadow-md flex flex-col gap-2"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-bold text-primarytext">
          {editProduct ? "Edit Product" : "Add New Product"}
        </h2>

        {/* Product Basic Info */}
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Product Name"
          onChange={handleInputChange}
          className="admin-input"
          required
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          placeholder="Category"
          onChange={handleInputChange}
          className="admin-input"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          placeholder="Description"
          onChange={handleInputChange}
          className="admin-input"
        />
        <textarea
          name="ingredients"
          value={formData.ingredients}
          placeholder="Ingredients"
          onChange={handleInputChange}
          className="admin-input"
        />

        {/* Sizes, Price, Stock & Image */}
        <div>
          <label className="font-semibold text-primarytext">
            Sizes, Prices & Stock
          </label>

          {formData.sizes.map((s, i) => (
            <div key={i} className="flex gap-2 mt-1 items-center flex-wrap">
              <input
                type="text"
                value={s.size}
                placeholder="Size"
                onChange={(e) => handleSizeChange(i, "size", e.target.value)}
                className="border px-2 py-1 rounded w-15 sm:w-20 border-primarytext text-primarytext focus:outline-0"
                required
              />
              <input
                type="number"
                value={s.price}
                placeholder="Price"
                onChange={(e) => handleSizeChange(i, "price", e.target.value)}
                className="border px-2 py-1 rounded w-20 border-primarytext text-primarytext focus:outline-0"
                required
              />
              <input
                type="number"
                value={s.quantity}
                placeholder="Qty"
                onChange={(e) =>
                  handleSizeChange(i, "quantity", e.target.value)
                }
                className="border px-2 py-1 rounded w-20 border-primarytext text-primarytext focus:outline-0"
                required
              />

              {/* Show existing image preview if available */}
              {s.existingImage && !s.image && (
                <img
                  src={s.existingImage}
                  alt="preview"
                  className="w-10 h-10 object-cover rounded"
                />
              )}

              {/* File input for this size */}
              <input
                type="file"
                onChange={(e) => handleSizeImageChange(i, e.target.files[0])}
                className="text-primarytext"
              />

              <Button
                type="button"
                onClick={() => removeSize(i)}
                className="bg-danger text-white px-3 sm:px-2 py-[9px] rounded"
              >
                <i className="fa-solid fa-xmark"></i>
              </Button>
            </div>
          ))}

          <Button
            type="button"
            onClick={addSize}
            className="mt-2 bg-success text-white px-3 py-1 rounded"
          >
            + Add Size
          </Button>
        </div>

        {/* Submit & Cancel Buttons */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-${
            editProduct ? 2 : 1
          } gap-2 mt-3`}
        >
          <Button
            type="submit"
            className={`text-primarytext bg-success hover:bg-success/50 transition-all duration-300 cursor-pointer px-3 py-2`}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editProduct
              ? "Update Product"
              : "Add Product"}
          </Button>

          {editProduct && (
            <Button
              type="button"
              onClick={() => {
                setEditProduct(null);
                setFormData({
                  name: "",
                  category: "",
                  description: "",
                  sizes: [
                    {
                      size: "",
                      price: 0,
                      quantity: 0,
                      image: null,
                      existingImage: null,
                    },
                  ],
                });
              }}
              className="flex-1 bg-danger text-primarytext hover:bg-danger/50 transition-all duration-300 cursor-pointer px-3 py-2"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* PRODUCTS GRID */}
      <div className="">
        {/* Grouped Products by category */}
        {Object.entries(groupedProducts).map(([catName, catProducts]) => (
          <div key={catName} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-primarytext">
              {catName} ({catProducts.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {catProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-cardbg shadow-md rounded-lg overflow-hidden flex flex-col"
                >
                  {/* Product Image Carousel */}
                  <div className="relative overflow-hidden h-48">
                    <div
                      className="flex transition-transform duration-500 ease-in-out h-full"
                      style={{
                        transform: `translateX(-${
                          (product.currentImageIndex || 0) * 100
                        }%)`,
                      }}
                    >
                      {product.images?.map((img, idx) => (
                        <img
                          key={img.publicId || idx}
                          src={img.imageUrl}
                          alt={product.name}
                          className="w-full flex-shrink-0 h-48 object-cover"
                        />
                      ))}
                    </div>
                    {product.images?.length > 1 && (
                      <>
                        <Button
                          onClick={() =>
                            setProducts((prev) =>
                              prev.map((p) =>
                                p._id === product._id
                                  ? {
                                      ...p,
                                      currentImageIndex:
                                        ((p.currentImageIndex || 0) -
                                          1 +
                                          p.images.length) %
                                        p.images.length,
                                    }
                                  : p
                              )
                            )
                          }
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-primarybg/40 text-primarytext px-2 py-2 rounded"
                        >
                          <i className="fa-solid fa-arrow-left"></i>
                        </Button>
                        <Button
                          onClick={() =>
                            setProducts((prev) =>
                              prev.map((p) =>
                                p._id === product._id
                                  ? {
                                      ...p,
                                      currentImageIndex:
                                        ((p.currentImageIndex || 0) + 1) %
                                        p.images.length,
                                    }
                                  : p
                              )
                            )
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primarybg/40 text-primarytext px-2 py-2 rounded"
                        >
                          <i className="fa-solid fa-arrow-right"></i>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="text-lg font-bold text-primarytext text-center">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-sm text-primarytext">
                      {product.category}
                    </p>

                    {/* Description toggle */}
                    <div className="mt-1 text-sm text-primarytext">
                      {product.ingredients.split(" ").length > 5 ? (
                        <>
                          {expandedIng[product._id]
                            ? product.ingredients
                            : product.ingredients
                                .split(" ")
                                .slice(0, 5)
                                .join(" ") + "..."}
                          <button
                            className="ml-1 text-primarytext underline text-xs"
                            onClick={() =>
                              setExpandedIng((prev) => ({
                                ...prev,
                                [product._id]: !prev[product._id],
                              }))
                            }
                          >
                            {expandedIng[product._id]
                              ? "Read Less"
                              : "Read More"}
                          </button>
                        </>
                      ) : (
                        product.ingredients
                      )}
                    </div>

                    {/* Stock Indicator */}
                    <div className="mt-2">
                      {product.sizes.map((s, idx) => (
                        <p
                          key={idx}
                          className={`text-xs ${
                            s.quantity > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {s.size}: {s.quantity} in stock (৳{s.price})
                        </p>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-2 items-center">
                      <Button
                        className={`${btnBase} border border-primarytext text-primarytext bg-transparent hover:bg-primarytext/10`}
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        className={`${btnBase} bg-danger text-white hover:bg-red-700`}
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProductCard;
