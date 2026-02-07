import { HfInference } from "@huggingface/inference";
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.HF_API_KEY;
const hf = new HfInference({ accessToken: key });
console.log("Initialized HfInference with object: { accessToken: key }");

// The following lines are comments or alternative initializations that are now superseded by the above.
// Try object signature which is likely for v3
// const hf = new HfInference(key);
// Wait, I am not changing it. I need to CHANGE it to object.
// const hf = new HfInference({ accessToken: key });
// Or: const hf = new HfInference({ accessToken: key });
// Let's try the object one, as string clearly fails later.
// const hf = new HfInference(key); <-- This was failing.

const hfObj = new HfInference(key); // Keeping old one to verify if it was the cause? No, replace.

const hf2 = new HfInference({ accessToken: key });
// To avoid conflict, I'll just use the one that works.
// Let's try the object format:
const hf_test = new HfInference(key);
// Wait, I will replace `const hf = ...` with object version.


// If string fails, it might behave weirdly.
// But wait, the error is "Cannot read properties of null (reading 'accessToken')".
// If I pass a STRING, `this.accessToken` should be string.
// If I pass NULL (from dotenv fail), `this.accessToken` is null.
// But I hardcoded it!

// Let's try to verify if `hf` has `accessToken` property.
console.log("HF Instance:", hf);
// This IS what failed.
// So let's try:
// const hf = new HfInference({ token: key });


const TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const IMAGE_BUFFER = Buffer.from(TEST_IMAGE_BASE64, 'base64');

async function testModel(model, type) {
    console.log(`Testing ${model} (${type})...`);
    try {
        let result;
        if (type === 'classification') {
            result = await hf.imageClassification({ model, data: IMAGE_BUFFER });
        } else if (type === 'detection') {
            result = await hf.objectDetection({ model, data: IMAGE_BUFFER });
        } else if (type === 'captioning') {
            result = await hf.imageToText({ model, data: IMAGE_BUFFER });
        }
        console.log(`✅ ${model} Success!`);
        // console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.log(`❌ ${model} Failed: ${error.message}`);
        if (error.response) console.log(`   Status: ${error.response.status}`);
    }
}

async function run() {
    await testModel("google/mobilenet_v2_1.0_224", "classification");
    await testModel("microsoft/resnet-18", "classification");
}

run();
