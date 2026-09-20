const mongoose = require("mongoose");

// Booking schema — created when a user books a parking slot
const bookingSchema = new mongoose.Schema({
    // Reference to the user who made this booking
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Reference to the parking slot that was booked
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingSlot",
        required: true
    },
    // We store these separately so we don't need to look up User/Slot every time
    // we display a booking. Makes queries simpler.
    userName: {
        type: String,
        required: true
    },
    slotNumber: {
        type: String,
        required: true
    },
    zone: {
        type: String,
        required: true
    },
    // Time-based booking fields (stretch goal)
    startTime: {
        type: Date,
        default: Date.now      // Defaults to "right now" for simple bookings
    },
    endTime: {
        type: Date,
        default: null          // null means "no end time set" (simple mode)
    },
    // Booking status
    status: {
        type: String,
        enum: ["active", "cancelled"],
        default: "active"
    },
    // When this booking was created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Booking", bookingSchema);
