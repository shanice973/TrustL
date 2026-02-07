import { HfInference } from "@huggingface/inference";
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.HF_API_KEY;
console.log("Key:", key);

try {
    const hf = new HfInference(key);
    console.log("HF Instance created. Methods:", Object.keys(hf));
    console.log("Has imageClassification?", typeof hf.imageClassification);
} catch (e) {
    console.error("Creation Error:", e);
}

try {
    const hf2 = new HfInference({ accessToken: key });
    console.log("HF2 Instance created. Methods:", Object.keys(hf2));
} catch (e) {
    console.error("Creation Error 2:", e);
}
