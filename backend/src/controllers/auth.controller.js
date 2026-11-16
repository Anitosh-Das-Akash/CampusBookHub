const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const uploadImage = require("../services/image.service");

const jwt = require("jsonwebtoken");
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
};

async function registerUser(req, res) {
  try {
    const { name, email, password, studentId, university, department, batch } =
      req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !studentId ||
      !university ||
      !department ||
      !batch
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      studentId,
      university,
      department,
      batch,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    });
  } catch (error) {
    console.log("Registration error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Student Login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 5. Set HTTP-only cookie
    res.cookie("token", token, cookieOptions);

    // 6. Send response
    return res.status(200).json({
      message: "Login successful",
      user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    university: user.university,
    department: user.department,
    batch: user.batch,
    phone: user.phone,
    profileImage: user.profileImage,
},
    });
  } catch (error) {
    console.log("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function logoutUser(req, res) {
  try {
    res.clearCookie("token", {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite
});

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Update Student Profile
async function updateProfile(req, res) {
  try {
    const { name, university, department, batch, phone } = req.body;

    // Only allow these fields to be updated
    const allowedFields = {
      name,
      university,
      department,
      batch,
      phone,
    };

    const updateData = {};

    Object.entries(allowedFields).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Check whether any field was provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    {
        returnDocument: "after",
        runValidators: true
    }
).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

async function updateProfilePicture(req, res) {
  try {
    // Check if image exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a profile picture",
      });
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(
      req.file.buffer,
      "campusbookhub/profiles",
    );

    // Update user's profile picture
    const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
        profileImage: imageUrl
    },
    {
        returnDocument: "after",
        runValidators: true
    }
).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile Picture Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  updateProfilePicture,
};
