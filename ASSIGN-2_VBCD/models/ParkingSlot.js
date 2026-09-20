const mongoose = require("mongoose");

// ParkingSlot schema — each document represents one physical parking spot
const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: true       // e.g., "A-01", "B-05"
    },
    zone: {
        type: String,
        required: true       // e.g., "Zone A", "Zone B" — used for filtering and dashboard
    },
    location: {
        type: String,
        required: true       // e.g., "Mall", "Office Block" — helps users find slots
    },
    vehicleType: {
        type: String,
        enum: ["car", "bike", "truck"],   // Only these vehicle types are supported
        required: true
    },
    status: {
        type: String,
        enum: ["available", "occupied", "blocked"],   // Only these three states
        default: "available"
    }
});

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);
