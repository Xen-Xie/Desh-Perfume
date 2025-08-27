import React, { useState, useEffect, useMemo } from "react";
import { CartContext } from "./CartContext";

// CartProvider wraps your app and provides cart state and functions
export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage if available, otherwise empty array
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to cart
  const addToCart = (product, size) => {
    setCartItems((prev) => {
      const maxQty = product.sizes.find((s) => s.size === size)?.quantity || 0;

      const existing = prev.find(
        (item) => item.product._id === product._id && item.size === size
      );

      if (existing) {
        if (existing.quantity >= maxQty) {
          alert("You cannot add more than available stock");
          return prev; // Do not change cart
        }
        // Increment quantity safely
        return prev.map((item) =>
          item.product._id === product._id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (maxQty <= 0) {
          alert("This size is sold out");
          return prev;
        }
        // Add new item with quantity 1
        return [...prev, { product, size, quantity: 1 }];
      }
    });
  };

  // Remove product of specific size from cart
  const removeFromCart = (productId, size) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => item.product._id !== productId || item.size !== size
      )
    );
  };

  // Update quantity of a specific product & size
  const updateQuantity = (productId, size, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product._id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear all items from cart
  const clearCart = () => setCartItems([]);

  // Calculate total quantity in cart (memoized for performance)
  const totalCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Calculate total price of cart (memoized)
  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          (item.product.sizes.find((s) => s.size === item.size)?.price || 0) *
            item.quantity,
        0
      ),
    [cartItems]
  );

  // Provide all cart state and functions to children components
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
