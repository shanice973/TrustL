import { verifyImage } from './services/aiService.js';

const test = async () => {
    try {
        console.log("Testing verifyImage directly...");
        // Use a simple data URI to avoid network fetch issues for this specific test, 
        // initially focusing on HfInference initialization.
        // Actually, if initialization fails, it might fail at import time or first usage.

        // 1x1 Red Pixel
        const base64Image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        const result = await verifyImage(base64Image);
        console.log("Result:", JSON.stringify(result));
    } catch (error) {
        console.error("Test Error:", error);
    }
};

test();
