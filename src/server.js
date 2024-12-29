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

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Create an Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String },
    amountRemaining: { type: Number, default: 0 },
    amountShopping: { type: Number, default: 0 },
    amountFD: { type: Number, default: 0 },
    amountBills: { type: Number, default: 0 },
    amountOther: { type: Number, default: 0 },
    transactions: [
        {
            purpose: { type: String, required: true },
            sum: { type: Number, required: true },
            date: { type: Date, required: true },
            category: { type: String, required: true },
            transactionType: { type: String, required: true },
        },
    ],
});
const User = mongoose.model("User", userSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token", error: err.message });
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

// User data and transactions
app.get("/get-username", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found!" });
        res.json({ username: user.username, profilePic: user.profilePic });
    } catch (err) {
        res.status(500).json({ error: "Invalid token!" });
    }
});

app.get("/api/user-data", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId, {
            amountRemaining: 1,
            amountShopping: 1,
            amountFD: 1,
            amountBills: 1,
            amountOther: 1,
            transactions: 1,
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ message: "An error occurred" });
    }
});

// Add money endpoint
app.post("/api/add-money", authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user.userId);

        // Update user data
        user.amountRemaining += amount;

        // Save the transaction
        user.transactions.push({
            purpose: "Add Money",
            category: "Amount Added",
            sum: amount,
            date: new Date(),
            transactionType: "addMoney",
        });

        await user.save();

        res.json({ amountRemaining: user.amountRemaining });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while adding money." });
    }
});

// Add expenditure endpoint
app.post("/api/add-expenditure", authenticateToken, async (req, res) => {
    try {
        const { purpose, sum, date, category } = req.body;
        const user = await User.findById(req.user.userId);

        // Deduct amount from the appropriate category
        if (category === "shopping") user.amountShopping += sum;
        if (category === "foodAndDrinks") user.amountFD += sum;
        if (category === "billsAndUtilities") user.amountBills += sum;
        if (category === "others") user.amountOther += sum;

        // Update remaining balance
        user.amountRemaining -= sum;

        // Save the transaction
        user.transactions.push({
            purpose,
            category,
            sum,
            date,
            transactionType: "expenditure",
        });

        await user.save();

        res.json({ amountRemaining: user.amountRemaining });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while adding expenditure." });
    }
});

// Upload profile picture
app.post("/api/upload-profile-pic", authenticateToken, upload.single("profilePic"), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Save the file path in the database
        user.profilePic = req.file.path; // Save file path to database
        await user.save();

        // Send the URL or path of the uploaded file
        res.status(200).json({ message: "Profile picture updated", profilePic: req.file.path });
    } catch (err) {
        console.error("Error uploading profile picture:", err);
        res.status(500).json({ message: "An error occurred" });
    }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
