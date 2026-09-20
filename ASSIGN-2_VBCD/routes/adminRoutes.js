const express = require("express");
const ParkingSlot = require("../models/ParkingSlot");
const Booking = require("../models/Booking");
const { isAdmin } = require("../middleware/auth");

const router = express.Router();

// ============================================
// ADMIN DASHBOARD
// ============================================
router.get("/dashboard", isAdmin, async function(req, res) {
    try {
        // Count slots by status
        const totalSlots = await ParkingSlot.countDocuments();
        const availableSlots = await ParkingSlot.countDocuments({ status: "available" });
        const occupiedSlots = await ParkingSlot.countDocuments({ status: "occupied" });
        const blockedSlots = await ParkingSlot.countDocuments({ status: "blocked" });

        // Count today's bookings
        // Create start and end of today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);    // Set to midnight (start of day)
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);  // Set to end of day

        const todaysBookings = await Booking.countDocuments({
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        // Zone-wise occupancy: count occupied slots per zone
        // Get all unique zones first
        const allZones = await ParkingSlot.distinct("zone");

        var zoneStats = [];
        for (var i = 0; i < allZones.length; i++) {
            var zoneName = allZones[i];
            var totalInZone = await ParkingSlot.countDocuments({ zone: zoneName });
            var occupiedInZone = await ParkingSlot.countDocuments({ zone: zoneName, status: "occupied" });
            var availableInZone = await ParkingSlot.countDocuments({ zone: zoneName, status: "available" });
            var blockedInZone = await ParkingSlot.countDocuments({ zone: zoneName, status: "blocked" });

            zoneStats.push({
                zone: zoneName,
                total: totalInZone,
                occupied: occupiedInZone,
                available: availableInZone,
                blocked: blockedInZone
            });
        }

        res.render("admin-dashboard", {
            totalSlots: totalSlots,
            availableSlots: availableSlots,
            occupiedSlots: occupiedSlots,
            blockedSlots: blockedSlots,
            todaysBookings: todaysBookings,
            zoneStats: zoneStats
        });

    } catch (error) {
        console.log("Admin dashboard error:", error.message);
        res.render("admin-dashboard", {
            totalSlots: 0,
            availableSlots: 0,
            occupiedSlots: 0,
            blockedSlots: 0,
            todaysBookings: 0,
            zoneStats: []
        });
    }
});

// ============================================
// MANAGE SLOTS PAGE (view all + add form)
// ============================================
router.get("/slots", isAdmin, async function(req, res) {
    try {
        const slots = await ParkingSlot.find().sort({ zone: 1, slotNumber: 1 });

        res.render("manage-slots", {
            slots: slots,
            success: req.query.success || null,
            error: req.query.error || null,
            editSlot: null   // No slot being edited initially
        });

    } catch (error) {
        console.log("Manage slots error:", error.message);
        res.render("manage-slots", {
            slots: [],
            success: null,
            error: "Could not load slots.",
            editSlot: null
        });
    }
});

// ============================================
// ADD A NEW SLOT
// ============================================
router.post("/slots/add", isAdmin, async function(req, res) {
    try {
        var slotNumber = req.body.slotNumber;
        var zone = req.body.zone;
        var location = req.body.location;
        var vehicleType = req.body.vehicleType;

        // Validate required fields
        if (!slotNumber || !zone || !location || !vehicleType) {
            return res.redirect("/admin/slots?error=All fields are required.");
        }

        // Create the new slot
        var newSlot = new ParkingSlot({
            slotNumber: slotNumber,
            zone: zone,
            location: location,
            vehicleType: vehicleType,
            status: "available"
        });
        await newSlot.save();

        res.redirect("/admin/slots?success=Slot " + slotNumber + " added successfully!");

    } catch (error) {
        console.log("Add slot error:", error.message);
        res.redirect("/admin/slots?error=Could not add slot.");
    }
});

// ============================================
// SHOW EDIT FORM FOR A SLOT
// ============================================
router.get("/slots/edit/:id", isAdmin, async function(req, res) {
    try {
        var slotToEdit = await ParkingSlot.findById(req.params.id);
        var slots = await ParkingSlot.find().sort({ zone: 1, slotNumber: 1 });

        if (!slotToEdit) {
            return res.redirect("/admin/slots?error=Slot not found.");
        }

        res.render("manage-slots", {
            slots: slots,
            success: null,
            error: null,
            editSlot: slotToEdit   // Pass the slot to edit to the template
        });

    } catch (error) {
        console.log("Edit slot page error:", error.message);
        res.redirect("/admin/slots?error=Could not load slot for editing.");
    }
});

// ============================================
// UPDATE A SLOT
// ============================================
router.post("/slots/edit/:id", isAdmin, async function(req, res) {
    try {
        var slotId = req.params.id;
        var slotNumber = req.body.slotNumber;
        var zone = req.body.zone;
        var location = req.body.location;
        var vehicleType = req.body.vehicleType;

        if (!slotNumber || !zone || !location || !vehicleType) {
            return res.redirect("/admin/slots?error=All fields are required.");
        }

        await ParkingSlot.findByIdAndUpdate(slotId, {
            slotNumber: slotNumber,
            zone: zone,
            location: location,
            vehicleType: vehicleType
        });

        res.redirect("/admin/slots?success=Slot updated successfully!");

    } catch (error) {
        console.log("Update slot error:", error.message);
        res.redirect("/admin/slots?error=Could not update slot.");
    }
});

// ============================================
// DELETE A SLOT
// ============================================
router.post("/slots/delete/:id", isAdmin, async function(req, res) {
    try {
        var slotId = req.params.id;

        // Also cancel any active bookings for this slot
        await Booking.updateMany(
            { slotId: slotId, status: "active" },
            { status: "cancelled" }
        );

        await ParkingSlot.findByIdAndDelete(slotId);

        res.redirect("/admin/slots?success=Slot deleted successfully!");

    } catch (error) {
        console.log("Delete slot error:", error.message);
        res.redirect("/admin/slots?error=Could not delete slot.");
    }
});

// ============================================
// BLOCK / UNBLOCK A SLOT
// ============================================
router.post("/slots/toggle-block/:id", isAdmin, async function(req, res) {
    try {
        var slot = await ParkingSlot.findById(req.params.id);

        if (!slot) {
            return res.redirect("/admin/slots?error=Slot not found.");
        }

        // Toggle: if blocked → make available, if available → block
        if (slot.status === "blocked") {
            slot.status = "available";
        } else if (slot.status === "available") {
            slot.status = "blocked";
        } else {
            // Slot is occupied — can't block an occupied slot
            return res.redirect("/admin/slots?error=Cannot block an occupied slot. Cancel the booking first.");
        }

        await slot.save();

        var message = slot.status === "blocked"
            ? "Slot " + slot.slotNumber + " has been blocked."
            : "Slot " + slot.slotNumber + " has been unblocked.";

        res.redirect("/admin/slots?success=" + message);

    } catch (error) {
        console.log("Toggle block error:", error.message);
        res.redirect("/admin/slots?error=Could not update slot.");
    }
});

// ============================================
// VIEW ALL BOOKINGS
// ============================================
router.get("/bookings", isAdmin, async function(req, res) {
    try {
        // Get all bookings, newest first
        var bookings = await Booking.find().sort({ createdAt: -1 });

        res.render("all-bookings", {
            bookings: bookings
        });

    } catch (error) {
        console.log("View all bookings error:", error.message);
        res.render("all-bookings", {
            bookings: []
        });
    }
});

module.exports = router;
