const mongoose = require("mongoose");

const MONGO_URL = "mongodb://admin:secret123@127.0.0.1:27017/authdb?authSource=admin";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to MongoDB");

        const users = await User.find({});
        console.log("\n--- Current Users in DB ---");
        if (users.length === 0) {
            console.log("No users found.");
        } else {
            users.forEach(u => {
                console.log(`Username: ${u.username}, Email: ${u.email}`);
            });
        }
        console.log("---------------------------\n");

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.connection.close();
    }
}

listUsers();
