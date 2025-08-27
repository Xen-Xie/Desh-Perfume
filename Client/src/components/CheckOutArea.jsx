import React, { useState } from "react";
import CheckOutAddress from "./CheckOutAddress";
import { useCart } from "../context/UseCart";

function CheckOutArea() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const shipping = cartItems.length > 0 ? 100 : 0; // Example shipping cost
  const total = totalPrice + shipping;

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-2 p-6">
      {/* Left: Address */}
      <CheckOutAddress />

      {/* Right: Cart & Checkout */}
      <div className="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Your Order</h2>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Your cart is empty</p>
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
                  className="flex justify-between items-center border-b py-3"
                >
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {item.size} | ৳{price} x {item.quantity} ={" "}
                      ৳{price * item.quantity}
                    </p>

                    {/* Quantity Controls */}
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product._id, item.size)}
                        className="ml-4 text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <span className="font-medium">৳{price * item.quantity}</span>
                </div>
              );
            })}

            {/* Totals */}
            <div className="mt-4 border-t pt-4 flex flex-col gap-2">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>৳{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>৳{shipping}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>৳{total}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border p-2 rounded-lg w-full md:w-1/2"
              >
                <option value="COD">Cash on Delivery</option>
                <option value="Bkash">Bkash</option>
                <option value="Card">Credit/Debit Card</option>
              </select>
            </div>

            {/* Place Order */}
            <button className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition">
              Place Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckOutArea;
