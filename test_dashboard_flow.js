import axios from 'axios';

const API_URL = "http://localhost:5000/api";
const axiosConfig = { timeout: 10000 };

async function testDashboardFlow() {
    try {
        console.log("---- Testing Dashboard & Monetization ----");

        // 1. Register a Vendor
        console.log("\n1. Registering Vendor...");
        const mockSelfie = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        const regRes = await axios.post(`${API_URL}/vendors/register`, {
            name: "Pro Shop",
            instagram: "@proshop",
            whatsapp: "999",
            selfieImage: mockSelfie
        }, axiosConfig);
        const vendorId = regRes.data.vendorId;
        console.log("✅ Registered Vendor:", vendorId);

        // 2. Upgrade to Pro
        console.log("\n2. Upgrade Vendor to Pro...");
        const payRes = await axios.post(`${API_URL}/payments/process`, {
            type: 'SUBSCRIPTION_UPGRADE',
            vendorId: vendorId,
            amount: 10
        }, axiosConfig);

        if (payRes.data.success) {
            console.log("✅ Upgrade Successful!");
        } else {
            throw new Error("Upgrade Failed");
        }

        // 3. Fetch Dashboard
        console.log("\n3. Fetching Shops Dashboard...");
        const dashRes = await axios.get(`${API_URL}/vendors`, axiosConfig);
        const vendors = dashRes.data.vendors;

        const proVendor = vendors.find(v => v.id === vendorId);
        if (proVendor && proVendor.isPro) {
            console.log("✅ Vendor appears in Dashboard as PRO:", proVendor);
        } else {
            throw new Error("Vendor not found or not marked as Pro in dashboard");
        }

        console.log("\n🎉 Dashboard Flow Verified Successfully!");

    } catch (error) {
        console.error("❌ Test Failed:", error.response ? error.response.data : error.message);
    }
}

testDashboardFlow();
