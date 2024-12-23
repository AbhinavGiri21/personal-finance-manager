const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

// Create an Express app
const app = express();

// Middleware
app.use(express.json());

// CORS Configuration - Allow requests from specific origin
const allowedOrigins = [
    "http://localhost:3000", // Add frontend URLs that you want to allow
    "http://your-mobile-app-origin.com" // If you're accessing from a mobile app, add that origin here
];
app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // Allow requests from allowed origins or no origin (for mobile apps)
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// MongoDB connection
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
});

const User = mongoose.model("User", UserSchema);

// Register route
app.post("/api/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "An error occurred while creating the user", error: err.message });
    }
});

// Login route
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`Login failed: User not found for email ${email}`);
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error(`Login failed: Invalid password for email ${email}`);
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
        res.status(500).json({ message: "An error occurred while logging in", error: err.message });
    }
});

// Protected route (example)
app.get("/api/protected", (req, res) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Bearer Token
    const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;

    try {
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET_KEY);
        res.status(200).json({ message: "Protected content", userId: decoded.userId });
    } catch (err) {
        console.error("Token verification error:", err);
        res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }
});

// Preflight request handler for OPTIONS requests (important for mobile apps)
app.options("*", cors());

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
