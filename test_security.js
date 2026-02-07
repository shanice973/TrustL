import axios from 'axios';
import { spawn } from 'child_process';

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;

// Start Server
console.log("Starting server for testing...");
const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT },
    stdio: 'pipe',
    shell: true
});

server.stdout.on('data', (data) => {
    console.log(`[Server]: ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
    console.error(`[Server Error]: ${data.toString().trim()}`);
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    await wait(3000); // Wait for server start

    try {
        console.log("\n--- Testing Security Headers ---");
        try {
            const res = await axios.get(`${BASE_URL}/api/vendors`);
            const headers = res.headers;

            if (headers['x-dns-prefetch-control'] && headers['x-frame-options']) {
                console.log("✅ Helmet headers detected.");
            } else {
                console.error("❌ Helmet headers MISSING.");
                console.log("Headers:", headers);
            }

            if (headers['ratelimit-limit']) {
                console.log(`✅ Rate Limit header detected: Limit=${headers['ratelimit-limit']}, Remaining=${headers['ratelimit-remaining']}`);
            } else {
                // Express-rate-limit might use different headers or standardHeaders: true
                if (headers['ratelimit-limit'] || headers['x-ratelimit-limit']) {
                    console.log("✅ Rate Limit header detected.");
                } else {
                    console.warn("⚠️ Rate Limit headers might be using Draft-7 standard or hidden.");
                    console.log("Headers:", JSON.stringify(headers, null, 2));
                }
            }
        } catch (e) {
            console.error("Failed to connect to server:", e.message);
        }

        console.log("\n--- Testing Input Validation (Vendor) ---");
        try {
            await axios.post(`${BASE_URL}/api/vendors/register`, {
                name: "A", // Too short
                // Missing selfie
            });
            console.error("❌ Failed: Server accepted invalid vendor data.");
        } catch (e) {
            if (e.response && e.response.status === 400 && e.response.data.errors) {
                console.log("✅ Success: Server rejected invalid vendor data (400 Bad Request).");
                console.log("Errors:", e.response.data.errors);
            } else {
                console.error(`❌ Unexpected response: ${e.response ? e.response.status : e.message}`);
            }
        }

        console.log("\n--- Testing Input Validation (Certificate) ---");
        try {
            await axios.post(`${BASE_URL}/api/certificates`, {
                product: "", // Empty
                verificationResult: "NotAnObject" // Invalid type
            });
            console.error("❌ Failed: Server accepted invalid certificate data.");
        } catch (e) {
            if (e.response && e.response.status === 400 && e.response.data.errors) {
                console.log("✅ Success: Server rejected invalid certificate data (400 Bad Request).");
                console.log("Errors:", e.response.data.errors);
            } else {
                console.error(`❌ Unexpected response: ${e.response ? e.response.status : e.message}`);
            }
        }

    } catch (err) {
        console.error("Test Suit Error:", err);
    } finally {
        console.log("\nStopping server...");
        server.kill();
        process.exit();
    }
}

runTests();
