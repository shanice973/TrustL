import { saveCertificate, getCertificate } from '../services/verificationStore.js';
import { body, validationResult } from 'express-validator';

export const validateCertificate = [
    body('product').isString().trim().notEmpty().withMessage('Product name is required'),
    body('verificationResult').isObject().withMessage('Verification result must be an object'),
    body('vendorId').optional().isString(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const createCertificate = (req, res) => {
    try {
        const { product, vendor, vendorId, verificationResult } = req.body;

        // Validation handled by middleware, but kept for double safety logic if needed
        // ...

        const certificate = saveCertificate({
            product,
            vendor: vendor || "Unknown Vendor",
            vendorId: vendorId || null,
            verificationResult
        });

        res.json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// We need a way to get vendor details when fetching certificate.
// Since vendorStore is in vendorController.js and not exported directly as a store...
// We should probably move the store to a service or just fetch it here.
// To avoid circular dependency or complex refactor, let's use a quick hack:
// We will import the `getVendor` logic or just make the store shared.
// Actually, `services/verificationStore.js` is the place for stores.

import { getVendorById } from '../services/verificationStore.js';

export const getCertificateData = (req, res) => {
    try {
        const { id } = req.params;
        const certificate = getCertificate(id);

        if (!certificate) {
            return res.status(404).json({ error: "Certificate not found" });
        }

        // Enrich with Vendor Data if available
        let vendorDetails = null;
        if (certificate.vendorId) {
            vendorDetails = getVendorById(certificate.vendorId);
        }

        res.json({
            success: true,
            certificate: {
                ...certificate,
                vendorDetails // Attach social links etc.
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
