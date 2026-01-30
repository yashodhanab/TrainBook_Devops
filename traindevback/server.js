// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // Connect MongoDB
// const MONGO_URL = process.env.MONGO_URL || "mongodb://mongodb:27017/authdb";

// mongoose.connect(MONGO_URL)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB error:", err));

// // User schema
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });

// const User = mongoose.model("User", userSchema);

// // ------------------ Register ------------------
// app.post("/signup", async (req, res) => {
//   try {
//     const { email, password, username } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     // Hash password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({ email, password: hashedPassword, username });
//     await user.save();

//     res.json({ message: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ------------------ Login ------------------
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: "Invalid username or password" });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid username or password" });
//     }

//     res.json({ message: "Login successful" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ...existing code...

// // ------------------ List All Users ------------------
// app.get("/users", async (req, res) => {
//   try {
//     const users = await User.find({}, { email: 1, username: 1, _id: 0 }); // Only return email and username, hide _id
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });



// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

// Connect MongoDB
const MONGO_URL = process.env.MONGO_URL || "mongodb://admin:secret123@127.0.0.1:27017/authdb?authSource=admin";

mongoose.connect(MONGO_URL)
  .then(() => console.log(`✅ MongoDB connected to ${MONGO_URL}`))
  .catch((err) => console.error("❌ MongoDB error:", err));

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

    res.json({ message: "Login successful" });
  } catch (err) {
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
