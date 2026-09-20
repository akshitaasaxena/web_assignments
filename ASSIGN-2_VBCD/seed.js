// ============================================
// SEED SCRIPT — Run this ONCE to fill the database with sample data
// ============================================
// Usage: node seed.js
// This will clear existing data and insert fresh sample data.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const ParkingSlot = require("./models/ParkingSlot");
const Booking = require("./models/Booking");

async function seedData() {
    try {
        // Step 1: Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB Atlas.");

        // Step 2: Clear all existing data
        await User.deleteMany({});
        await ParkingSlot.deleteMany({});
        await Booking.deleteMany({});
        console.log("Cleared old data.");

        // Step 3: Create users (1 admin + 2 regular users)
        const adminPassword = await bcrypt.hash("admin123", 10);
        const userPassword = await bcrypt.hash("user123", 10);

        const users = await User.insertMany([
            {
                name: "Admin",
                email: "admin@parking.com",
                password: adminPassword,
                role: "admin"
            },
            {
                name: "Rahul Sharma",
                email: "rahul@gmail.com",
                password: userPassword,
                role: "user"
            },
            {
                name: "Priya Singh",
                email: "priya@gmail.com",
                password: userPassword,
                role: "user"
            }
        ]);
        console.log("Created " + users.length + " users.");

        // Step 4: Create parking slots across different zones
        const slots = await ParkingSlot.insertMany([
            // Zone A — Mall (cars and bikes)
            { slotNumber: "A-01", zone: "Zone A", location: "Mall", vehicleType: "car", status: "available" },
            { slotNumber: "A-02", zone: "Zone A", location: "Mall", vehicleType: "car", status: "available" },
            { slotNumber: "A-03", zone: "Zone A", location: "Mall", vehicleType: "car", status: "available" },
            { slotNumber: "A-04", zone: "Zone A", location: "Mall", vehicleType: "bike", status: "available" },
            { slotNumber: "A-05", zone: "Zone A", location: "Mall", vehicleType: "bike", status: "available" },

            // Zone B — Office Block (cars and trucks)
            { slotNumber: "B-01", zone: "Zone B", location: "Office Block", vehicleType: "car", status: "available" },
            { slotNumber: "B-02", zone: "Zone B", location: "Office Block", vehicleType: "car", status: "available" },
            { slotNumber: "B-03", zone: "Zone B", location: "Office Block", vehicleType: "truck", status: "available" },
            { slotNumber: "B-04", zone: "Zone B", location: "Office Block", vehicleType: "truck", status: "available" },

            // Zone C — Apartment (cars and bikes)
            { slotNumber: "C-01", zone: "Zone C", location: "Apartment", vehicleType: "car", status: "available" },
            { slotNumber: "C-02", zone: "Zone C", location: "Apartment", vehicleType: "car", status: "available" },
            { slotNumber: "C-03", zone: "Zone C", location: "Apartment", vehicleType: "bike", status: "available" },
            { slotNumber: "C-04", zone: "Zone C", location: "Apartment", vehicleType: "bike", status: "blocked" },

            // Zone D — Public Lot (all types)
            { slotNumber: "D-01", zone: "Zone D", location: "Public Lot", vehicleType: "car", status: "available" },
            { slotNumber: "D-02", zone: "Zone D", location: "Public Lot", vehicleType: "bike", status: "available" },
            { slotNumber: "D-03", zone: "Zone D", location: "Public Lot", vehicleType: "truck", status: "available" }
        ]);
        console.log("Created " + slots.length + " parking slots.");

        // Step 5: Create a sample booking (Rahul booked slot A-01)
        var rahul = users[1];   // Second user is Rahul
        var slotA01 = slots[0]; // First slot is A-01

        // Mark the slot as occupied
        await ParkingSlot.findByIdAndUpdate(slotA01._id, { status: "occupied" });

        await Booking.create({
            userId: rahul._id,
            slotId: slotA01._id,
            userName: rahul.name,
            slotNumber: slotA01.slotNumber,
            zone: slotA01.zone,
            status: "active"
        });
        console.log("Created 1 sample booking.");

        // Done!
        console.log("");
        console.log("===== SEED COMPLETE =====");
        console.log("");
        console.log("Login credentials:");
        console.log("  Admin  →  admin@parking.com  /  admin123");
        console.log("  User   →  rahul@gmail.com    /  user123");
        console.log("  User   →  priya@gmail.com    /  user123");
        console.log("");

        // Disconnect and exit
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.log("Seed error:", error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedData();
