import axios from 'axios';

const checkKey = async () => {
    const key = process.env.HF_API_KEY;
    try {
        console.log("Checking API Key...");
        const response = await axios.get("https://huggingface.co/api/whoami-v2", {
            headers: { Authorization: `Bearer ${key}` }
        });
        console.log("Key is Valid! User:", response.data.name);
        console.log("Org:", response.data.orgs ? response.data.orgs.map(o => o.name) : "None");
    } catch (error) {
        console.error("Key Check Failed:", error.response ? error.response.status : error.message);
    }
};

checkKey();
