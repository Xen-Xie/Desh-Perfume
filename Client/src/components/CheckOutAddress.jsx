import React, { useState } from "react";
import { bangladeshStates } from "../data/BangladeshData";
import Button from "../reuse/Button";
import Select from "react-select";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

function CheckOutAddress() {
  const { token } = useAuth(); // get token from context
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const stateOptions = Object.keys(bangladeshStates).map((s) => ({
    value: s,
    label: s,
  }));

  const cityOptions = state
    ? bangladeshStates[state.value].map((c) => ({ value: c, label: c }))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state || !city) {
      alert("Please select state and city!");
      return;
    }

    const address = {
      country: "Bangladesh",
      state: state.value,
      city: city.value,
      zipCode,
      phoneNumber: "+880" + phoneNumber,
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/address/add",
        address,
        {
          headers: {
            Authorization: `Bearer ${token}`, // send token in headers
          },
        }
      );
      console.log("Address saved:", res.data);
      alert("Address added successfully!");
      // Optionally clear form
      setState(null);
      setCity(null);
      setZipCode("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Failed to add address:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to add address.");
    }
  };

  return (
    <div className="w-full md:w-1/2 bg-cardbg rounded-xl shadow-lg p-6 font-primary">
      <h2 className="text-lg font-semibold mb-3 text-primarytext">
        Delivery Address
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-primarytext">
            Country
          </label>
          <input
            type="text"
            value="Bangladesh"
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-transparent border-primarytext text-primarytext outline-0"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-primarytext">
            State / Division
          </label>
          <Select
            value={state}
            onChange={(selected) => {
              setState(selected);
              setCity(null);
            }}
            options={stateOptions}
            placeholder="Select State"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-primarytext">
            City / District
          </label>
          <Select
            value={city}
            onChange={setCity}
            options={cityOptions}
            isDisabled={!state}
            placeholder={state ? "Select City" : "Select State first"}
          />
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-primarytext">
            Zip Code
          </label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full border border-primarytext text-secondarytext rounded-lg px-3 py-2 bg-transparent outline-0"
            placeholder="e.g. 1207"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-primarytext">
            Phone Number
          </label>
          <div className="flex items-center border border-primarytext rounded-lg overflow-hidden">
            <span className="px-3 bg-transparent text-primarytext">+880</span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 px-3 py-2 text-secondarytext outline-0"
              placeholder="1XXXXXXXXX"
              pattern="[0-9]{9,10}"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg py-2 transition cursor-pointer"
        >
          <span className="absolute inset-0 bg-primarytext w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
          <span className="relative z-10 group-hover:text-primarybg transition-colors duration-300">
            Add This Address To Ship
          </span>
        </Button>
      </form>
    </div>
  );
}

export default CheckOutAddress;
