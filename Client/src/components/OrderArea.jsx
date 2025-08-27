import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/UseCart";
import Button from "../reuse/Button";
import { useAuth } from "../auth/useAuth";
import { bangladeshStates } from "../data/BangladeshData";
import Select from "react-select";

function OrderArea({ selectedAddress, setSelectedAddress }) {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { token } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(selectedAddress || {});
  const [loading, setLoading] = useState(false);

  // Sync formData when selectedAddress changes
  useEffect(() => {
    setFormData(selectedAddress || {});
    setEditMode(false);
  }, [selectedAddress]);

  const shipping =
    selectedAddress?.state === "Dhaka" ? 0 : cartItems.length > 0 ? 100 : 0;
  const total = totalPrice + shipping;

  // Validate state & city
  const validateAddress = () => {
    const states = Object.keys(bangladeshStates);
    if (!states.includes(formData.state)) {
      alert("Invalid state. Please select from the suggestions.");
      return false;
    }
    if (!bangladeshStates[formData.state].includes(formData.city)) {
      alert("Invalid city. Please select from the suggestions.");
      return false;
    }
    return true;
  };

  // Update address
  const handleUpdate = async () => {
    if (!formData._id || !validateAddress()) return;

    try {
      setLoading(true);
      const updatedFields = {
        state: formData.state,
        city: formData.city,
        zipCode: formData.zipCode,
        phoneNumber: formData.phoneNumber,
      };
      const res = await axios.patch(
        `http://localhost:5000/api/address/update/${formData._id}`,
        updatedFields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedAddress(res.data);
      setEditMode(false);
    } catch (err) {
      console.error("Failed to update address:", err.response?.data || err);
      alert("Failed to update address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDelete = async () => {
    if (!selectedAddress?._id) return;

    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:5000/api/address/delete/${selectedAddress._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedAddress(null);
    } catch (err) {
      console.error("Failed to delete address:", err.response?.data || err);
      alert("Failed to delete address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time stock for a specific product-size
  const fetchCurrentStock = async (productId, size) => {
    try {
      const res = await axios.get(
        `https://desh-perfume.onrender.com/api/products/${productId}`
      );
      const product = res.data;
      const sizeObj = product.sizes.find((s) => s.size === size);
      return sizeObj?.quantity || 0; // quantity = real stock
    } catch (err) {
      console.error("Failed to fetch product stock:", err);
      return 0;
    }
  };
  // Payment Method Items/labels
  const paymentMethodLabel = (method) => {
    switch (method) {
      case "COD":
        return "Cash on Delivery";
      case "Bkash":
        return "Bkash";
      case "Card":
        return "Credit/Debit Card";
      default:
        return "";
    }
  };

  return (
    <div className="w-full md:w-2/3 bg-cardbg rounded-xl shadow-lg p-6 flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-primarytext">
        Your Order
      </h2>

      {cartItems.length === 0 ? (
        <p className="text-center py-6 text-primarytext">Your cart is empty</p>
      ) : (
        <>
          {/* Cart Items */}
          {cartItems.map((item) => {
            const selectedSize = item.product.sizes.find(
              (s) => s.size === item.size
            );
            const price = selectedSize?.price || 0;

            return (
              <div
                key={`${item.product._id}-${item.size}`}
                className="flex justify-between items-center border-b border-b-primarytext py-3"
              >
                <div>
                  <p className="font-medium text-primarytext">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-secondarytext">
                    Size: {item.size} | ৳{price} x {item.quantity} = ৳
                    {price * item.quantity}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {/* Decrease quantity */}
                    <Button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.size,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="px-2 py-[0.2px] border border-primarytext text-primarytext rounded bg-transparent cursor-pointer"
                    >
                      -
                    </Button>

                    <span className="text-primarytext text-xl">
                      {item.quantity}
                    </span>

                    {/* Increase quantity with real-time stock check */}
                    <Button
                      onClick={async () => {
                        const stock = await fetchCurrentStock(
                          item.product._id,
                          item.size
                        );
                        if (item.quantity + 1 > stock) {
                          alert("Insufficient stock!");
                          return;
                        }
                        updateQuantity(
                          item.product._id,
                          item.size,
                          item.quantity + 1
                        );
                      }}
                      className={`px-2 py-[0.2px] border border-primarytext text-primarytext rounded bg-transparent cursor-pointer ${
                        item.quantity >= selectedSize?.quantity
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      +
                    </Button>

                    {/* Remove from cart */}
                    <Button
                      onClick={() =>
                        removeFromCart(item.product._id, item.size)
                      }
                      className="ml-4 px-2 py-[2px] text-danger rounded bg-transparent hover:underline cursor-pointer"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <span className="font-medium text-primarytext">
                  ৳{price * item.quantity}
                </span>
              </div>
            );
          })}

          {/* Totals */}
          <div className="mt-4 border-t border-t-primarytext pt-4 flex flex-col gap-2">
            <div className="flex justify-between font-medium text-primarytext">
              <span>Subtotal</span>
              <span>৳{totalPrice}</span>
            </div>
            <div className="flex justify-between text-primarytext">
              <span>
                Shipping {selectedAddress?.state === "Dhaka" && "(Free)"}
              </span>
              <span>৳{shipping}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primarytext">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 text-primarytext">
            <h3 className="font-medium mb-2">Payment Method</h3>
            <Select
              value={{
                value: paymentMethod,
                label: paymentMethodLabel(paymentMethod),
              }}
              onChange={(selected) => setPaymentMethod(selected.value)}
              options={[
                { value: "COD", label: "Cash on Delivery" },
                { value: "Bkash", label: "Bkash" },
                { value: "Card", label: "Credit/Debit Card" },
              ]}
              className="w-full md:w-1/2"
              menuPortalTarget={document.body} // renders menu at body level
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderColor: "#ccc",
                  padding: "2px",
                  borderRadius: "0.5rem",
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999, // ensures dropdown appears above all
                }),
              }}
            />
          </div>

          {/* Place Order */}
          <Button className="mt-6 w-full bg-transparent text-primarytext py-3 rounded-lg border relative overflow-hidden cursor-pointer">
            <span className="absolute inset-0 bg-secondarytext w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
            <span className="relative z-10 group-hover:text-primarybg transition-colors duration-300">
              Place Order
            </span>
          </Button>

          {/* Shipping Summary */}
          {selectedAddress && (
            <div className="mt-6 p-4 border rounded-lg bg-transparent backdrop-blur-2xl text-primarytext">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold font-secondary">
                  Shipping Summary
                </h3>
                <div className="flex gap-3">
                  {!editMode && (
                    <Button
                      onClick={() => setEditMode(true)}
                      className="text-alert bg-transparent rounded-full px-[3px] py-[3px] cursor-pointer hover:scale-125 transition-all"
                    >
                      <i className="fa-solid fa-pencil"></i>
                    </Button>
                  )}
                  <Button
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-danger bg-transparent rounded-full px-[3px] py-[3px] cursor-pointer hover:scale-125 transition-all"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </Button>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  {/* State selection */}
                  <Select
                    options={Object.keys(bangladeshStates).map((state) => ({
                      value: state,
                      label: state,
                    }))}
                    value={
                      formData.state
                        ? { value: formData.state, label: formData.state }
                        : null
                    }
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        state: selected.value,
                        city: "",
                      })
                    }
                    placeholder="Select State"
                    className="text-danger"
                  />

                  {/* City selection */}
                  <Select
                    options={
                      formData.state
                        ? bangladeshStates[formData.state].map((city) => ({
                            value: city,
                            label: city,
                          }))
                        : []
                    }
                    value={
                      formData.city
                        ? { value: formData.city, label: formData.city }
                        : null
                    }
                    onChange={(selected) =>
                      setFormData({ ...formData, city: selected.value })
                    }
                    placeholder="Select City"
                    isDisabled={!formData.state}
                    className="text-danger"
                  />

                  {/* Zip & Phone */}
                  <input
                    type="text"
                    value={formData.zipCode || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="border border-primarytext p-2 rounded-lg w-full outline-0"
                    placeholder="Zip Code"
                  />
                  <input
                    type="text"
                    value={formData.phoneNumber || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="border border-primarytext p-2 rounded-lg w-full outline-0"
                    placeholder="Phone Number"
                  />

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="bg-success text-primarytext px-4 py-2 rounded-lg cursor-pointer hover:scale-105 transition-all"
                    >
                      {loading ? "Updating..." : "Update Address"}
                    </Button>
                    <Button
                      onClick={() => {
                        setFormData(selectedAddress); // reset to original
                        setEditMode(false); // exit edit mode
                      }}
                      disabled={loading}
                      className="bg-alert text-primarytext px-4 py-2 rounded-lg cursor-pointer hover:scale-105 transition-all"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p>
                    <strong>Name:</strong> {selectedAddress.name || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedAddress.phoneNumber}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedAddress.city},{" "}
                    {selectedAddress.state}, {selectedAddress.country} -{" "}
                    {selectedAddress.zipCode}
                  </p>
                  <p className="mt-2 font-medium">Subtotal: ৳{totalPrice}</p>
                  <p className="font-medium">
                    Shipping: ৳{shipping}{" "}
                    {selectedAddress.state === "Dhaka" && "(Free)"}
                  </p>
                  <p className="font-bold">Total: ৳{total}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrderArea;
