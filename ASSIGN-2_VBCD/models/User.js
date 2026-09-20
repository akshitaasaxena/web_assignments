const mongoose = require("mongoose");

// User schema — stores registered users (both regular users and admins)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true        // No two users can have the same email
    },
    password: {
        type: String,
        required: true       // This stores the HASHED password, never plain text
    },
    role: {
        type: String,
        enum: ["user", "admin"],   // Only these two values are allowed
        default: "user"            // New accounts are regular users by default
    }
});

module.exports = mongoose.model("User", userSchema);
