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
