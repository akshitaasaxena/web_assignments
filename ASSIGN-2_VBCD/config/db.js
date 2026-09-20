const mongoose = require("mongoose");

// Connect to MongoDB Atlas using the connection string from .env
function connectDB() {
    return mongoose.connect(process.env.MONGODB_URI);
}

module.exports = connectDB;
