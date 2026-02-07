import { verifyImage } from '../services/aiService.js';

export const verifyProduct = async (req, res) => {
    const { imageUrl, productUrl, price } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
    }

    try {
        // 1. AI Image Verification
        const aiResult = await verifyImage(imageUrl);

        // 2. Logic to interpret AI result (Mock logic for now)
        // In a real scenario, we'd check if the detected object matches the product title/metadata.
        // For now, we return the raw classification from the model.

        const confidence = aiResult[0]?.score || 0;
        const label = aiResult[0]?.label || "Unknown";

        const isAuthentic = confidence > 0.8; // Simple threshold

        res.json({
            success: true,
            isAuthentic,
            confidence,
            detectedLabel: label,
            message: isAuthentic ? "Product appears authentic based on visual analysis." : "Low confidence in product authenticity."
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
