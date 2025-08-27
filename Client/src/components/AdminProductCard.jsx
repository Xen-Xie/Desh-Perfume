import React, { useState, useEffect } from "react";
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
    sizes: [{ size: "Small", price: 0, quantity: 0 }],
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  // Fetch all products from backend API
  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://desh-perfume.onrender.com/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
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
      sizes: [...formData.sizes, { size: "", price: 0, quantity: 0 }],
    });
  };
  // Remove a size from the sizes array
  const removeSize = (index) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes.splice(index, 1);
    setFormData({ ...formData, sizes: updatedSizes });
  };
  // Handle image selection from file input
  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
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
      data.append("sizes", JSON.stringify(formData.sizes));
      if (formData.image) data.append("image", formData.image);

      const token = localStorage.getItem("token");
      const res = editProduct
        ? await axios.put(
            `https://desh-perfume.onrender.com/api/products/${editProduct._id}`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        : await axios.post("https://desh-perfume.onrender.com/api/products", data, {
            headers: { Authorization: `Bearer ${token}` },
          });
      // Update products state after edit
      if (editProduct) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editProduct._id ? res.data : p))
        );
        setEditProduct(null);
      } else {
        setProducts([...products, res.data]);
      }
      // Reset form after submission
      setFormData({
        name: "",
        category: "",
        description: "",
        sizes: [{ size: "Small", price: 0, quantity: 0 }],
        image: null,
      });
      alert(editProduct ? "Product updated!" : "Product added!");
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };
  // Delete a product by ID
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://desh-perfume.onrender.com/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
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
      sizes: product.sizes,
      image: null,
    });
  };

  return (
    <div className="p-4 font-primary">
      {/* Add / Edit Product Form */}
      <form
        className="mb-6 bg-cardbg p-4 rounded shadow-md flex flex-col gap-2"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-bold text-primarytext">
          {editProduct ? "Edit Product" : "Add New Product"}
        </h2>

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

        {/* Sizes, Price, Stock */}
        <div>
          <label className="font-semibold text-primarytext">
            Sizes, Prices & Stock
          </label>
          {formData.sizes.map((s, i) => (
            <div key={i} className="flex gap-2 mt-1 items-center">
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
              <Button
                type="button"
                onClick={() => removeSize(i)}
                className="bg-danger text-white px-3 sm:px-2 py-[9px] rounded"
              >
                <i class="fa-solid fa-xmark"></i>
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

        <input
          type="file"
          onChange={handleImageChange}
          className="mt-2 text-primarytext"
        />

        <Button
          type="submit"
          className="mt-3 text-primarybg"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : editProduct
            ? "Update Product"
            : "Add Product"}
        </Button>
      </form>

      {/* Existing Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-cardbg shadow-md rounded-lg overflow-hidden flex flex-col"
          >
            <div className="relative overflow-hidden">
              <img
                src={product.images?.[0]?.imageUrl || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-48 object-cover transform transition-transform duration-300 ease-in-out hover:scale-110"
              />
              {product.soldOut && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Sold Out
                </span>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-bold text-primarytext text-center">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-primarytext">
                {product.category}
              </p>
              <p className="mt-1 text-sm text-primarytext">
                {product.description}
              </p>

              {/* Stock Indicator */}
              <div className="mt-2">
                {product.sizes.map((s, idx) => (
                  <p
                    key={idx}
                    className={`text-xs ${
                      s.quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {s.size}: {s.quantity} in stock (${s.price})
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
  );
}

export default AdminProductCard;
