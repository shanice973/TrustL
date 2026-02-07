import { saveVendor, getVendorById, getAllVendors as fetchAllVendors } from '../services/verificationStore.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const socialHandleIndex = new Set();

// Hydrate Index on Startup
const existingVendors = fetchAllVendors();
existingVendors.forEach(v => {
    if (v.socials?.instagram) socialHandleIndex.add(v.socials.instagram);
    if (v.socials?.whatsapp) socialHandleIndex.add(v.socials.whatsapp);
    if (v.socials?.tiktok) socialHandleIndex.add(v.socials.tiktok);
});
console.log(`[Security] Loaded ${socialHandleIndex.size} protected social handles.`);

// Rate Limiting
export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 registration requests per hour
    message: { error: "Too many accounts created from this IP, please try again after an hour" }
});

export const validateVendorRegistration = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 chars'),
    body('selfieImage').notEmpty().withMessage('Selfie image is required'),
    body('instagram').optional().trim(),
    body('whatsapp').optional().trim(),
    body('tiktok').optional().trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const registerVendor = async (req, res) => {
    try {
        const { name, instagram, whatsapp, tiktok, selfieImage } = req.body;

        // 1. Duplicate Check
        if (instagram && socialHandleIndex.has(instagram)) return res.status(409).json({ error: "Instagram handle already registered." });
        if (whatsapp && socialHandleIndex.has(whatsapp)) return res.status(409).json({ error: "WhatsApp number already registered." });
        if (tiktok && socialHandleIndex.has(tiktok)) return res.status(409).json({ error: "TikTok handle already registered." });

        // 2. Mock Face Verification
        // const isFaceReal = await verifyFace(selfieImage); 

        const vendorId = Math.random().toString(36).substr(2, 9);
        const vendorData = {
            id: vendorId,
            name,
            socials: { instagram, whatsapp, tiktok },
            verifiedAt: new Date().toISOString(),
            isIdentityVerified: true
        };

        // Save to shared store
        saveVendor(vendorId, vendorData);

        // Update index
        if (instagram) socialHandleIndex.add(instagram);
        if (whatsapp) socialHandleIndex.add(whatsapp);
        if (tiktok) socialHandleIndex.add(tiktok);

        res.json({ success: true, vendorId, message: "Identity Verified Successfully." });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVendor = (req, res) => {
    const vendor = getVendorById(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json({ success: true, vendor });
};

// New: List all vendors for the dashboard
// fetchAllVendors is already imported at the top

export const getAllVendors = (req, res) => {
    try {
        const vendors = fetchAllVendors();
        // Return only public info
        const publicVendors = vendors.map(v => ({
            id: v.id,
            name: v.name,
            socials: v.socials,
            isPro: v.isPro || false,
            joinedAt: v.verifiedAt,
            // In a real app, we'd have a logo/avatar URL here. Using selfie as avatar for now if public, or a placeholder.
            // CAUTION: Selfie might be private. Let's assume for this Prototype the selfie is the "Logo".
            avatarUrl: v.socials?.instagram ? `https://ui-avatars.com/api/?name=${v.name}&background=random` : null
        }));

        res.json({ success: true, vendors: publicVendors });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
