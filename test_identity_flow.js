import axios from 'axios';

const API_URL = "http://localhost:5000/api";

// Increase timeout for image uploads
const axiosConfig = { timeout: 10000 };

async function testIdentityFlow() {
    try {
        console.log("---- Testing Vendor Identity Flow ----");

        // 1. Register Vendor
        console.log("\n1. Registering Vendor...");
        // Mock a tiny selfie
        const mockSelfie = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        const regRes = await axios.post(`${API_URL}/vendors/register`, {
            name: "Automated Test Vendor",
            instagram: "@autotest",
            whatsapp: "+1234567890",
            selfieImage: mockSelfie
        }, axiosConfig);

        if (!regRes.data.success) throw new Error("Registration failed");
        console.log("✅ Vendor Registered:", regRes.data.vendorId);
        const vendorId = regRes.data.vendorId;

        // 2. Scan Duplicate (Should Fail)
        console.log("\n2. Testing Duplicate Prevention...");
        try {
            await axios.post(`${API_URL}/vendors/register`, {
                name: "Copycat",
                instagram: "@autotest", // Duplicate
                selfieImage: mockSelfie
            }, axiosConfig);
            console.error("❌ Duplicate check FAILED (Should have rejected)");
        } catch (err) {
            if (err.response && err.response.status === 409) {
                console.log("✅ Duplicate Rejected Correctly (409)");
            } else {
                console.error("❌ Unexpected error:", err.message);
            }
        }

        // 3. Verify Product
        console.log("\n3. Verifying Product...");
        const verifyRes = await axios.post(`${API_URL}/verify`, {
            imageUrl: mockSelfie // Reusing image, doesn't matter for mock AI
        }, axiosConfig);
        console.log("✅ Product Verified");

        // 4. Create Certificate with Vendor Link
        console.log("\n4. Creating Certificate linked to Vendor...");
        const certRes = await axios.post(`${API_URL}/certificates`, {
            product: "Identity Verified Shoe",
            vendor: "Automated Test Vendor",
            vendorId: vendorId, // LINKING HERE
            verificationResult: verifyRes.data
        }, axiosConfig);
        console.log("✅ Certificate Created:", certRes.data.certificate.id);
        const certId = certRes.data.certificate.id;

        // 5. Fetch Certificate and Check Data
        console.log("\n5. Fetching Certificate Data...");
        const getCertRes = await axios.get(`${API_URL}/certificates/${certId}`, axiosConfig);
        const certData = getCertRes.data.certificate;

        if (certData.vendorDetails && certData.vendorDetails.socials.instagram === "@autotest") {
            console.log("✅ Certificate contains Verified Socials:", certData.vendorDetails.socials);
        } else {
            throw new Error("❌ Certificate missing vendor details!");
        }

        console.log("\n🎉 Identity Flow Verified Successfully!");

    } catch (error) {
        console.error("❌ Test Failed:", error.response ? error.response.data : error.message);
    }
}

testIdentityFlow();
