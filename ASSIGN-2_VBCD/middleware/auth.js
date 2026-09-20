const jwt = require("jsonwebtoken");

// ============================================
// JWT MIDDLEWARE — runs on EVERY request
// ============================================
// This reads the JWT token from the cookie, verifies it,
// and puts the user's info into req.user so routes can use it.
function verifyToken(req, res, next) {
    var token = req.cookies.token;   // Read the JWT from the cookie

    if (token) {
        try {
            // Verify the token and extract the data inside it
            var decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Now req.user contains: { userId, userName, role }
            req.user = decoded;
        } catch (err) {
            // Token is invalid or expired — treat as not logged in
            req.user = null;
        }
    } else {
        // No token cookie — user is not logged in
        req.user = null;
    }

    // Make user data available in ALL EJS templates
    // So every page can check if a user is logged in
    res.locals.currentUser = req.user ? req.user.userId : null;
    res.locals.currentUserName = req.user ? req.user.userName : null;
    res.locals.currentUserRole = req.user ? req.user.role : null;

    next();
}

// ============================================
// MIDDLEWARE: Check if user is logged in
// ============================================
// req.user is set by the JWT middleware (verifyToken)
// If the token was valid, req.user has { userId, userName, role }
// If not logged in, req.user is null
function isLoggedIn(req, res, next) {
    if (req.user) {
        next();   // User is logged in, continue to the route
    } else {
        res.redirect("/login");
    }
}

// ============================================
// MIDDLEWARE: Check if user is admin
// ============================================
// req.user is set by the JWT middleware (verifyToken)
// It checks TWO things: is the user logged in AND is their role "admin"?
function isAdmin(req, res, next) {
    if (req.user && req.user.role === "admin") {
        next();   // User is admin, continue to the route
    } else {
        res.redirect("/login");
    }
}

module.exports = { verifyToken, isLoggedIn, isAdmin };
