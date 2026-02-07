import { saveVendor, getVendorById, saveTransaction } from '../services/verificationStore.js';

// Mock Payment Gateway Logic
export const processPayment = async (req, res) => {
    try {
        const { type, amount, vendorId, details } = req.body;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (type === 'SUBSCRIPTION_UPGRADE') {
            const vendor = getVendorById(vendorId);
            if (!vendor) return res.status(404).json({ error: "Vendor not found" });

            // Upgrade Vendor
            vendor.isPro = true;
            vendor.subscriptionStatus = 'active';
            vendor.subscriptionPlan = 'pro_monthly';
            saveVendor(vendorId, vendor);

            return res.json({ success: true, message: "Upgraded to Pro successfully!" });
        }

        if (type === 'ESCROW_PAYMENT') {
            const transactionId = Math.random().toString(36).substr(2, 9);
            const transaction = {
                id: transactionId,
                amount,
                status: 'HELD_IN_ESCROW',
                timestamp: new Date().toISOString(),
                ...details
            };
            // In a real app, save this transaction
            // saveTransaction(transaction); 

            return res.json({ success: true, transactionId, message: "Payment held in Escrow." });
        }

        res.status(400).json({ error: "Invalid payment type" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
