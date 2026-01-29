const mongoose = require("mongoose");

// Connection string used in server.js
const MONGO_URL = "mongodb://admin:secret123@127.0.0.1:27017/authdb?authSource=admin";

// Define Schema exactly as in server.js
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

async function testConnection() {
    console.log("1. Attempting to connect to MongoDB...");
    try {
        await mongoose.connect(MONGO_URL);
        console.log("✅ MongoDB connected successfully!");
    } catch (err) {
        console.error("❌ MongoDB Connection FAILED:", err);
        process.exit(1);
    }

    console.log("2. Attempting to save a test user...");
    try {
        // Clean up previous test user if exists
        await User.deleteOne({ email: "test@example.com" });

        const newUser = new User({
            username: "TestUser",
            email: "test@example.com",
            password: "password123"
        });

        await newUser.save();
        console.log("✅ Test User saved successfully!");
    } catch (err) {
        console.error("❌ User Save FAILED:", err);
    } finally {
        await mongoose.connection.close();
        console.log("3. Connection closed.");
    }
}

testConnection();
