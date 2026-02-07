import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224";

// 1x1 Red Pixel GIF
const base64Image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const imageBuffer = Buffer.from(base64Image.split(',')[1], 'base64');

const test = async () => {
    try {
        console.log(`Testing HF API Direct... Key starts with: ${HF_API_KEY ? HF_API_KEY.substring(0, 5) : 'MISSING'}`);

        const response = await axios.post(
            HF_API_URL,
            imageBuffer,
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/octet-stream",
                },
            }
        );
        console.log("Success:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error(`Error [${error.response.status}] (${error.response.headers['content-type']}):`);
            const data = error.response.data;
            if (Buffer.isBuffer(data)) {
                console.error(data.toString().substring(0, 200)); // First 200 chars
            } else {
                console.error(data);
            }
        } else {
            console.error("Error:", error.message);
        }
    }
};

test();
