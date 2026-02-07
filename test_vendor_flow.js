import axios from 'axios';

const API_URL = "http://localhost:5000/api";

async function testFlow() {
    try {
        console.log("1. Testing Image Verification...");
        // Mock a tiny base64 image (doesn't need to be real for mock AI)
        const mockImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        const verifyRes = await axios.post(`${API_URL}/verify`, {
            imageUrl: mockImage
        });

        if (!verifyRes.data.success) throw new Error("Verification failed");
        console.log("✅ Verification Success:", verifyRes.data);

        console.log("\n2. Testing Certificate Creation...");
        const certRes = await axios.post(`${API_URL}/certificates`, {
            product: "Test Shoe",
            vendor: "Test Vendor",
            verificationResult: verifyRes.data
        });

        if (!certRes.data.success) throw new Error("Certificate creation failed");
        console.log("✅ Certificate Created:", certRes.data.certificate.id);
        const certId = certRes.data.certificate.id;

        console.log("\n3. Testing Certificate Retrieval...");
        const getCertRes = await axios.get(`${API_URL}/certificates/${certId}`);

        if (!getCertRes.data.success) throw new Error("Certificate retrieval failed");
        console.log("✅ Certificate Retrieved:", getCertRes.data.certificate.product);

        console.log("\n🎉 Full Flow Verified!");

    } catch (error) {
        console.error("❌ Test Failed:", error.response ? error.response.data : error.message);
    }
}

testFlow();
