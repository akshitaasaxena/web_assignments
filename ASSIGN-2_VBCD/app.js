// Load environment variables from .env file FIRST (before anything else uses them)
require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const { verifyToken } = require("./middleware/auth");

const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// This lets Express understand form data sent from HTML forms
app.use(express.urlencoded({ extended: false }));

// This lets Express understand JSON data (useful for any AJAX calls)
app.use(express.json());

// This lets Express read cookies from the browser
// We store the JWT token inside a cookie
app.use(cookieParser());

// Serve static files (CSS, images) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the template engine so we can render .ejs files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ============================================
// JWT MIDDLEWARE — runs on EVERY request
// ============================================
// This reads the JWT token from the cookie, verifies it,
// and puts the user's info into req.user so routes can use it.
app.use(verifyToken);

// ============================================
// ROUTES
// ============================================

// Import route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Use route files
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/admin", adminRoutes);

// Home page route
app.get("/", function(req, res) {
    res.render("home");
});

// ============================================
// CONNECT TO MONGODB ATLAS AND START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

connectDB()
    .then(function() {
        console.log("Connected to MongoDB Atlas successfully!");

        app.listen(PORT, function() {
            console.log("Server is running on http://localhost:" + PORT);
        });
    })
    .catch(function(error) {
        console.log("Failed to connect to MongoDB:", error.message);
    });
