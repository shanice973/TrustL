import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.HF_API_KEY;
// const MODEL = "google/vit-base-patch16-224"; // Known failure
const MODEL = "google/mobilenet_v2_1.0_224"; // Hopeful

const TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const IMAGE_BUFFER = Buffer.from(TEST_IMAGE_BASE64, 'base64');

async function test(url) {
    console.log(`Testing: ${url}`);
    try {
        const response = await axios.post(
            url,
            IMAGE_BUFFER,
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/octet-stream",
                },
            }
        );
        console.log(`✅ Success! Status: ${response.status}`);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log(`❌ Failed! Status: ${error.response?.status}`);
        if (error.response?.data) console.log(error.response.data.toString().substring(0, 100));
    }
}

async function run() {
    // Try router first
    await test(`https://router.huggingface.co/models/${MODEL}`);
    // Try old api
    await test(`https://api-inference.huggingface.co/models/${MODEL}`);
}

run();
