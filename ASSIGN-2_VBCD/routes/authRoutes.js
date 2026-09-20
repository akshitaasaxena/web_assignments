const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ============================================
// SHOW REGISTRATION PAGE
// ============================================
router.get("/register", function(req, res) {
    res.render("register", { error: null });
});

// ============================================
// HANDLE REGISTRATION FORM SUBMISSION
// ============================================
router.post("/register", async function(req, res) {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        // Check if all fields are filled
        if (!name || !email || !password) {
            return res.render("register", { error: "All fields are required." });
        }

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.render("register", { error: "Email is already registered." });
        }

        // Hash the password — 10 is the "salt rounds" (how many times it's scrambled)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user in the database
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: "user"    // All registrations create regular users, not admins
        });
        await newUser.save();

        // After registering, redirect to login page
        res.redirect("/login");

    } catch (error) {
        console.log("Registration error:", error.message);
        res.render("register", { error: "Something went wrong. Please try again." });
    }
});

// ============================================
// SHOW LOGIN PAGE
// ============================================
router.get("/login", function(req, res) {
    res.render("login", { error: null });
});

// ============================================
// HANDLE LOGIN FORM SUBMISSION
// ============================================
router.post("/login", async function(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Check if both fields are filled
        if (!email || !password) {
            return res.render("login", { error: "Please enter email and password." });
        }

        // Find the user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.render("login", { error: "Invalid email or password." });
        }

        // Compare the entered password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.render("login", { error: "Invalid email or password." });
        }

        // ===== CREATE A JWT TOKEN =====
        // jwt.sign() takes TWO things:
        //   1. The data to put INSIDE the token (userId, userName, role)
        //   2. A secret key to sign/lock the token (from .env)
        var token = jwt.sign(
            {
                userId: user._id,
                userName: user.name,
                role: user.role
            },
            process.env.JWT_SECRET
        );

        // Store the token in a cookie so the browser sends it with every request
        res.cookie("token", token);

        // Redirect based on role
        if (user.role === "admin") {
            res.redirect("/admin/dashboard");
        } else {
            res.redirect("/dashboard");
        }

    } catch (error) {
        console.log("Login error:", error.message);
        res.render("login", { error: "Something went wrong. Please try again." });
    }
});

// ============================================
// LOGOUT
// ============================================
router.get("/logout", function(req, res) {
    // Clear the token cookie — the browser forgets who was logged in
    res.clearCookie("token");
    res.redirect("/");
});

module.exports = router;
