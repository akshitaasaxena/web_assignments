const express = require("express");
const ParkingSlot = require("../models/ParkingSlot");
const Booking = require("../models/Booking");
const { isLoggedIn } = require("../middleware/auth");

const router = express.Router();

// ============================================
// USER DASHBOARD
// ============================================
router.get("/dashboard", isLoggedIn, async function(req, res) {
    try {
        // Count user's active bookings
        const activeBookings = await Booking.countDocuments({
            userId: req.user.userId,
            status: "active"
        });

        // Count total available slots
        const availableSlots = await ParkingSlot.countDocuments({ status: "available" });

        // Count total slots
        const totalSlots = await ParkingSlot.countDocuments();

        res.render("user-dashboard", {
            userName: req.user.userName,
            activeBookings: activeBookings,
            availableSlots: availableSlots,
            totalSlots: totalSlots
        });

    } catch (error) {
        console.log("Dashboard error:", error.message);
        res.render("user-dashboard", {
            userName: req.user.userName,
            activeBookings: 0,
            availableSlots: 0,
            totalSlots: 0
        });
    }
});

// ============================================
// VIEW AVAILABLE SLOTS (with filtering)
// ============================================
router.get("/slots", isLoggedIn, async function(req, res) {
    try {
        // Build a filter object based on what the user selected
        // Start with an empty filter (which means "find all")
        var filter = {};

        // If user selected a zone, add it to the filter
        if (req.query.zone && req.query.zone !== "") {
            filter.zone = req.query.zone;
        }

        // If user selected a vehicle type, add it to the filter
        if (req.query.vehicleType && req.query.vehicleType !== "") {
            filter.vehicleType = req.query.vehicleType;
        }

        // If user selected a location, add it to the filter
        if (req.query.location && req.query.location !== "") {
            filter.location = req.query.location;
        }

        // If user selected a status, add it to the filter
        if (req.query.status && req.query.status !== "") {
            filter.status = req.query.status;
        }

        // Find slots matching the filter
        const slots = await ParkingSlot.find(filter).sort({ zone: 1, slotNumber: 1 });

        // Get all unique zones, locations for the filter dropdowns
        const allZones = await ParkingSlot.distinct("zone");
        const allLocations = await ParkingSlot.distinct("location");

        res.render("slots", {
            slots: slots,
            allZones: allZones,
            allLocations: allLocations,
            selectedZone: req.query.zone || "",
            selectedVehicleType: req.query.vehicleType || "",
            selectedLocation: req.query.location || "",
            selectedStatus: req.query.status || "",
            success: req.query.success || null,
            error: req.query.error || null
        });

    } catch (error) {
        console.log("View slots error:", error.message);
        res.render("slots", {
            slots: [],
            allZones: [],
            allLocations: [],
            selectedZone: "",
            selectedVehicleType: "",
            selectedLocation: "",
            selectedStatus: "",
            success: null,
            error: "Could not load slots. Please try again."
        });
    }
});

// ============================================
// BOOK A SLOT
// ============================================
router.post("/book/:id", isLoggedIn, async function(req, res) {
    try {
        const slotId = req.params.id;

        // Step 1: Find the slot
        const slot = await ParkingSlot.findById(slotId);

        if (!slot) {
            return res.redirect("/slots?error=Slot not found.");
        }

        // Step 2: Check if slot is blocked
        if (slot.status === "blocked") {
            return res.redirect("/slots?error=This slot is blocked by admin.");
        }

        // Step 3: Check if slot is already occupied
        if (slot.status === "occupied") {
            return res.redirect("/slots?error=This slot is already booked.");
        }

        // Step 4: Create the booking
        const newBooking = new Booking({
            userId: req.user.userId,
            slotId: slot._id,
            userName: req.user.userName,
            slotNumber: slot.slotNumber,
            zone: slot.zone,
            status: "active"
        });
        await newBooking.save();

        // Step 5: Update the slot status to "occupied"
        slot.status = "occupied";
        await slot.save();

        // Step 6: Redirect with success message
        res.redirect("/slots?success=Slot " + slot.slotNumber + " booked successfully!");

    } catch (error) {
        console.log("Booking error:", error.message);
        res.redirect("/slots?error=Could not complete booking. Please try again.");
    }
});

// ============================================
// VIEW BOOKING HISTORY
// ============================================
router.get("/my-bookings", isLoggedIn, async function(req, res) {
    try {
        // Find all bookings for this user, newest first
        const bookings = await Booking.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        res.render("booking-history", {
            bookings: bookings,
            success: req.query.success || null,
            error: req.query.error || null
        });

    } catch (error) {
        console.log("Booking history error:", error.message);
        res.render("booking-history", {
            bookings: [],
            success: null,
            error: "Could not load booking history."
        });
    }
});

// ============================================
// CANCEL A BOOKING
// ============================================
router.post("/cancel/:id", isLoggedIn, async function(req, res) {
    try {
        const bookingId = req.params.id;

        // Find the booking and make sure it belongs to the logged-in user
        const booking = await Booking.findOne({
            _id: bookingId,
            userId: req.user.userId
        });

        if (!booking) {
            return res.redirect("/my-bookings?error=Booking not found.");
        }

        if (booking.status === "cancelled") {
            return res.redirect("/my-bookings?error=This booking is already cancelled.");
        }

        // Mark the booking as cancelled
        booking.status = "cancelled";
        await booking.save();

        // Make the parking slot available again
        await ParkingSlot.findByIdAndUpdate(booking.slotId, { status: "available" });

        res.redirect("/my-bookings?success=Booking cancelled successfully.");

    } catch (error) {
        console.log("Cancel booking error:", error.message);
        res.redirect("/my-bookings?error=Could not cancel booking. Please try again.");
    }
});

module.exports = router;
