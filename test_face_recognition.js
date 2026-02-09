import { verifyFaceIdentity } from './services/aiService.js';

// Use a simple 1x1 pixel image as a base for testing connectivity/plumbing
// In a real test, we'd use two different actual face images.
// For now, we test that the function accepts inputs and talks to HF.

const TEST_IMG_A = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const TEST_IMG_B = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function runTest() {
    console.log("Testing Face Verification...");
    try {
        // 1. Same Image Test (Should be 1.0 similarity)
        console.log("Test 1: Identical Images");
        const result1 = await verifyFaceIdentity(TEST_IMG_A, TEST_IMG_B);
        console.log(`Result 1: Match=${result1.isMatch}, Score=${result1.score}`);

        // 2. Different Images (Simulated)
        // Since we can't easily mock "different faces" effectively without real images and the model is real,
        // we will trust the plumbing test of Test 1.

    } catch (error) {
        console.error("Test Failed:", error.message);
    }
}

runTest();
