import express from "express";
import { registerVendor, getVendor, getAllVendors, registrationLimiter, validateVendorRegistration } from "../controllers/vendorController.js";

const router = express.Router();

router.post("/register", registrationLimiter, validateVendorRegistration, registerVendor);
router.get("/", getAllVendors); // List all
router.get("/:id", getVendor);

export default router;
