import validator from "validator";

export const validateSignup = (req, res, next) => {
  let { name, email, password, confirmPassword } = req.body;
  const errors = {};

  // Normalize input
  name = name?.trim();
  email = email?.trim().toLowerCase();

  // Name validation
  if (!name) {
    errors.name = "Name is required.";
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    errors.name = "Name should only contain letters and spaces.";
  } else if (name.length > 50) {
    errors.name = "Name cannot exceed 50 characters.";
  }

  // Email validation
  if (!email) {
    errors.email = "Email is required.";
  } else if (!validator.isEmail(email)) {
    errors.email = "Invalid email format.";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required.";
  } else if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    errors.password =
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
  }

  // Confirm password
  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
