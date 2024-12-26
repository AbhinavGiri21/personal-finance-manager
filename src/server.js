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
app.use(cors());

// Ensure environment variables are set
if (!process.env.JWT_SECRET_KEY || !process.env.MONGO_URI) {
    console.error("Environment variables JWT_SECRET_KEY and MONGO_URI are required.");
    process.exit(1); // Exit if essential variables are not set
}

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

// Login route
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

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

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

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

app.get("/api/protected", authenticateToken, (req, res) => {
    res.status(200).json({ message: "Protected content", userId: req.user.userId });
});

app.get("/get-username", async (req, res) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "No token provided!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: "User not found!" });
        res.json({ username: user.username });
    } catch (err) {
        res.status(500).json({ error: "Invalid token!" });
    }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
