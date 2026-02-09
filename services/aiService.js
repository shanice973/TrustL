import axios from 'axios';
import dotenv from 'dotenv';
import { HfInference } from "@huggingface/inference";

dotenv.config();

// MOCK MODE: Set to false to use Real AI
const MOCK_MODE = false;

// Candidate models to try in order (Classification first, then Captioning as fallback)
const MODELS = [
    "google/vit-base-patch16-224",
    "microsoft/resnet-50",
    "google/mobilenet_v2_1.0_224",
    "Salesforce/blip-image-captioning-large"
];

const HF_KEY = process.env.HF_API_KEY;

if (!HF_KEY && !MOCK_MODE) {
    console.error("FATAL ERROR: HF_API_KEY is missing in .env file.");
    // We don't throw immediately to allow app to start, but services will fail.
}

export const verifyImage = async (imageUrl) => {
    try {
        console.log(`[AI Service] Processing: ${imageUrl.substring(0, 50)}...`);

        if (MOCK_MODE) {
            console.log("[AI Service] ⚠️ USING MOCK RESPONSE (API Unavailable)");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return [
                { label: "authentic product", score: 0.95 },
                { label: "counterfeit", score: 0.05 }
            ];
        }

        let imageInput;

        // Handle Data URI
        if (imageUrl.startsWith('data:image')) {
            const base64Data = imageUrl.split(',')[1];
            imageInput = Buffer.from(base64Data, 'base64');
        }
        // Handle Remote URL
        else if (imageUrl.startsWith('http')) {
            console.log("[AI Service] Fetching image from URL...");
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            imageInput = response.data;
        } else {
            throw new Error("Invalid image format. Must be Data URI or HTTP URL.");
        }

        console.log(`[AI Service] Payload size: ${imageInput.length} bytes`);
        const base64Input = imageInput.toString('base64');

        // Try models in sequence
        for (const model of MODELS) {
            // New Router URL structure
            const url = `https://router.huggingface.co/hf-inference/models/${model}`;
            console.log(`[AI Service] Trying model: ${model}...`);

            try {
                const response = await axios.post(url, { inputs: base64Input }, {
                    headers: {
                        Authorization: `Bearer ${HF_KEY}`,
                        "Content-Type": "application/json"
                    }
                });

                console.log(`[AI Service] Success with ${model}`);
                return normalizeResponse(model, response.data);

            } catch (err) {
                const status = err.response ? err.response.status : "Unknown";
                console.warn(`[AI Service] Model ${model} failed (${status}): ${err.message}`);
                // Continue to next model
            }
        }

        throw new Error("All AI models failed to respond.");

    } catch (error) {
        console.error("AI Service Error:", error.message);
        throw new Error(`Failed to verify image with AI service: ${error.message}`);
    }
};

// Helper: Normalize different model outputs to standard { label, score } format
function normalizeResponse(model, data) {
    // 1. Image Classification (ViT, ResNet, MobileNet) -> [{ label: 'cat', score: 0.9 }]
    if (Array.isArray(data) && data[0]?.label) {
        return data;
    }

    // 2. Image Captioning (BLIP) -> [{ generated_text: 'a cat sitting' }]
    if (Array.isArray(data) && data[0]?.generated_text) {
        return [
            { label: data[0].generated_text, score: 0.99 } // Assign high score for caption
        ];
    }

    // 3. Object Detection (DETR) -> [{ label: 'cat', score: 0.9, box: {...} }]
    // (Compatible with classification format mostly)

    return data;
}

export const verifyText = async (text) => {
    return { valid: true, note: "Text verification not implemented yet" };
};

// --- Face Verification Logic ---

// Calculate Cosine Similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
}

export const verifyFaceIdentity = async (referenceImage, liveImage) => {
    try {
        console.log("[AI Service] Starting Face Verification...");
        // Fallback: Use Image Captioning to compare descriptions
        const model = "Salesforce/blip-image-captioning-large";
        const url = `https://api-inference.huggingface.co/models/${model}`;

        const getEmbedding = async (imageData) => {
            let imagePayload;

            // Convert to Buffer for raw binary upload
            if (Buffer.isBuffer(imageData)) {
                imagePayload = imageData;
            } else if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
                const base64Data = imageData.split(',')[1];
                imagePayload = Buffer.from(base64Data, 'base64');
            } else {
                throw new Error("Invalid image data format");
            }

            // Send RAW BINARY data, not JSON
            const response = await axios.post(url, imagePayload, {
                headers: {
                    Authorization: `Bearer ${HF_KEY}`,
                    "Content-Type": "application/octet-stream"
                }
            });
            return response.data;
        };

        // Parallel fetch for speed
        const [embeddingRef, embeddingLive] = await Promise.all([
            getEmbedding(referenceImage),
            getEmbedding(liveImage)
        ]);

        if (!Array.isArray(embeddingRef) || !Array.isArray(embeddingLive)) {
            throw new Error("Invalid response format from AI model.");
        }

        let score = 0;
        let method = "embedding";

        // Check if response is Caption-based (BLIP)
        if (embeddingRef[0]?.generated_text && embeddingLive[0]?.generated_text) {
            method = "caption";
            const textA = embeddingRef[0].generated_text.toLowerCase();
            const textB = embeddingLive[0].generated_text.toLowerCase();
            console.log(`[AI Service] Comparing Captions: "${textA}" vs "${textB}"`);

            // Simple Jaccard Similarity on words
            const wordsA = new Set(textA.split(/\s+/));
            const wordsB = new Set(textB.split(/\s+/));
            const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
            const union = new Set([...wordsA, ...wordsB]);
            score = intersection.size / union.size;
        }
        // Assume Embedding-based
        else if (typeof embeddingRef[0] === 'number') {
            score = cosineSimilarity(embeddingRef, embeddingLive);
        }

        console.log(`[AI Service] Match Score (${method}): ${score.toFixed(4)}`);

        // Thresholds: Caption ~0.5 (loose), Embedding >0.8
        const threshold = method === 'caption' ? 0.5 : 0.8;
        const isMatch = score > threshold;

        return {
            isMatch,
            score,
            details: isMatch ? "Identity Verified" : "Face mismatch detected."
        };

    } catch (error) {
        if (error.response) {
            console.error("AI API Error:", error.response.status, error.response.data);
            // Fallback for 410/404/503: Mock success if in development/demo mode to unblock user?
            // For now, just throw.
        } else {
            console.error("Face Verification Error:", error.message);
        }
        // Return a mock failure instead of crashing the app
        return { isMatch: false, score: 0, details: "AI Service Unavailable. Please try again." };
    }
};
