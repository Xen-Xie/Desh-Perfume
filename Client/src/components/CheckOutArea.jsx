import React, { useState, useEffect } from "react";
import CheckOutAddress from "./CheckOutAddress";
import OrderArea from "./OrderArea";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

function CheckOutArea() {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { token } = useAuth();

  // Fetch user's saved address from backend on mount
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/address/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setSelectedAddress(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch address:", err.response?.data || err);
      }
    };

    fetchAddress();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-[2px] p-6 font-secondary">
      {/* Left: Address (can update selectedAddress) */}
      <CheckOutAddress setSelectedAddress={setSelectedAddress} />

      {/* Right: Order Summary */}
      <OrderArea selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress}/>
    </div>
  );
}

export default CheckOutArea;
