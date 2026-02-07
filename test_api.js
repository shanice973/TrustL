import axios from 'axios';

const TEST_IMAGE_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="; // Base64 Red Dot

async function testBackend() {
    console.log("Testing Backend Connection...");
    try {
        const API_URL = "http://localhost:5003/api/verify";
        const response = await axios.post(API_URL, {
            imageUrl: TEST_IMAGE_URL,
            productUrl: "https://www.amazon.com/test-product",
            price: "$99.99"
        });

        console.log("Response:", response.status);
        console.log("Data:", response.data);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error("❌ Connection Refused! The server is likely NOT running.");
        } else {
            console.error("❌ Error:", error.message);
            if (error.response) {
                const fs = await import('fs');
                fs.writeFileSync('error_log.txt', JSON.stringify(error.response.data, null, 2));
                console.log("Error log written to error_log.txt");
            }
        }
    }
}

testBackend();
