import { extractTextFromImage, verifyNameInText } from './services/ocrService.js';

// A simple image containing the text "John Doe" (Base64)
// Use a public URL for a reliable test image with text
const TEST_IMAGE_URL = "https://tesseract.projectnaptha.com/img/eng_bw.png";

async function runTest() {
    console.log("Testing OCR Service...");
    try {
        console.log("1. Extracting Text from sample image...");
        const text = await extractTextFromImage(TEST_IMAGE_URL);
        console.log("Extracted Text Preview:", text.substring(0, 100));

        console.log("\n2. Verifying Name...");
        const nameToFind = "Mildred"; // This name appears in the sample image
        const isMatch = verifyNameInText(text, nameToFind);

        console.log(`Searching for "${nameToFind}": ${isMatch ? "FOUND ✅" : "NOT FOUND ❌"}`);

        const fakeName = "Zanzibar";
        const isMatchFake = verifyNameInText(text, fakeName);
        console.log(`Searching for "${fakeName}": ${!isMatchFake ? "CORRECTLY NOT FOUND ✅" : "FALSE POSITIVE ❌"}`);

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

runTest();
