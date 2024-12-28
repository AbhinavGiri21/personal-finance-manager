const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Ensure "uploads/" directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Create an Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
if (!process.env.JWT_SECRET_KEY || !process.env.MONGO_URI) {
    console.error("Environment variables JWT_SECRET_KEY and MONGO_URI are required.");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected successfully");
}).catch(err => {
    console.error("MongoDB connection error: ", err);
});

// User model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String },
});
const User = mongoose.model("User", UserSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        req.user = decoded;
        next();
    });
};

// Routes
app.post("/api/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
});

app.get("/get-username", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found!" });
        res.json({ username: user.username, profilePic: user.profilePic });
    } catch (err) {
        res.status(500).json({ error: "Invalid token!" });
    }
});

app.post("/upload-profile-pic", authenticateToken, upload.single("profilePic"), async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profilePic = filePath; // Save file path
        await user.save();

        res.status(200).json({ message: "Profile picture uploaded successfully", filePath });
    } catch (err) {
        console.error("Error uploading profile picture:", err);
        res.status(500).json({ message: "Error uploading profile picture", error: err.message });
    }
});

// Routes for updating settings (username, email, password)
app.put("/api/update-settings", authenticateToken, async (req, res) => {
    const { username, email, password, newPassword, confirmPassword } = req.body;
    const userId = req.user.userId;

    try {
        // Fetch user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let isUpdated = false; // Flag to track if anything was updated

        // Update username
        if (username) {
            user.username = username;
            isUpdated = true;
        }

        // Update email
        if (email) {
            // Check if the email is already taken by another user
            const existingEmailUser = await User.findOne({ email });
            if (existingEmailUser && existingEmailUser._id.toString() !== userId.toString()) {
                return res.status(400).json({ message: "Email is already taken" });
            }
            user.email = email;
            isUpdated = true;
        }

        // Update password
        if (password && newPassword) {
            // Verify the current password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            // Check if new password matches the confirmation
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: "New password and confirm password do not match" });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
            isUpdated = true;
        }

        // If no updates were made, return early
        if (!isUpdated) {
            return res.status(400).json({ message: "No valid changes to update" });
        }

        // Save the updated user data
        const result = await user.save();
        if (!result) {
            return res.status(400).json({ message: "Failed to update user" });
        }

        res.status(200).json({ message: "User settings updated successfully" });
    } catch (err) {
        console.error("Error updating settings:", err);
        res.status(500).json({ message: "An error occurred while updating settings", error: err.message });
    }
});
// Serve static files
app.use("/uploads", express.static("uploads"));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
