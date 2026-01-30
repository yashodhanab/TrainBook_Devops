const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(bodyParser.json());

// Connect MongoDB
// Use MONGODB_URI if available (Docker), otherwise default to local with auth
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://admin:secret123@127.0.0.1:27017/authdb?authSource=admin";

mongoose.connect(MONGO_URL)
  .then(() => console.log(`✅ MongoDB connected to ${MONGO_URL}`))
  .catch((err) => console.error("❌ MongoDB error!:", err));

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// ------------------ Signup ------------------
app.post("/signup", async (req, res) => {
  try {
    console.log("Signup Request Body:", req.body); // Debug log
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({
      email,
      password,   // 👈 plain text
      username
    });

    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: err.message, error: "Server error" }); // 'message' for frontend alert
  }
});

// ------------------ Login ------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------ List Users ------------------
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, username: 1, _id: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
