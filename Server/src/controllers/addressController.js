import Address from "../models/Address.js";

// Add New Address
export const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { country, state, city, zipCode, phoneNumber } = req.body;

    if (!country || !state || !city || !zipCode || !phoneNumber) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const address = await Address.create({
      user: userId,
      country,
      state,
      city,
      zipCode,
      phoneNumber,
    });

    res.status(201).json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Single Address
export const getAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const address = await Address.findOne({ user: userId }); // fetch latest or only address
    if (!address) return res.status(404).json({ message: "No address found" });

    res.status(200).json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Existing Address (PATCH)
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { country, state, city, zipCode, phoneNumber } = req.body;

    const address = await Address.findOne({ _id: id, user: userId });
    if (!address) return res.status(404).json({ message: "Address not found" });

    if (country !== undefined) address.country = country;
    if (state !== undefined) address.state = state;
    if (city !== undefined) address.city = city;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (phoneNumber !== undefined) address.phoneNumber = phoneNumber;

    await address.save();
    res.status(200).json(address); // <-- returns updated object
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
