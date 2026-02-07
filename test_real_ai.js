import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
axios.defaults.httpsAgent = httpsAgent;

const HF_KEY = process.env.HF_API_KEY;
const TEST_IMAGE_URL = "https://via.placeholder.com/150"; // Guaranteed to work

const MODELS = [
    "google/vit-base-patch16-224",
    "microsoft/resnet-50",
    "Salesforce/blip-image-captioning-large"
];

async function testRealAI() {
    console.log("---- Testing Real AI (Hugging Face) ----");
    if (!HF_KEY) {
        console.error("❌ HF_API_KEY is missing in .env");
        return;
    }
    console.log(`🔑 API Key found (${HF_KEY.substring(0, 5)}...)`);

    // Use hardcoded base64 image (Small Red Dot) to bypass download issues
    const base64Input = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

    try {
        console.log(`📦 Using Base64 Image (${base64Input.length} bytes)`);

        for (const model of MODELS) {
            console.log(`\n🤖 Testing Model: ${model}...`);
            try {
                // New Router URL
                const url = `https://router.huggingface.co/hf-inference/models/${model}`;
                const response = await axios.post(url, { inputs: base64Input }, {
                    headers: {
                        Authorization: `Bearer ${HF_KEY}`,
                        "Content-Type": "application/json"
                    }
                });

                console.log(`✅ Success! Response preview:`);
                if (Array.isArray(response.data)) {
                    console.log(JSON.stringify(response.data.slice(0, 2), null, 2));
                } else {
                    console.log(response.data);
                }

            } catch (err) {
                console.error(`❌ Failed: ${err.message}`);
                if (err.response) {
                    console.error(`Status: ${err.response.status}`);
                    console.error(`Data: ${JSON.stringify(err.response.data)}`);
                }
            }
        }

    } catch (err) {
        console.error("Image download failed:", err.message);
    }
}

testRealAI();
