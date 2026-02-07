const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const preview = document.getElementById('preview');
const detailsForm = document.getElementById('details-form');
const btnVerify = document.getElementById('btn-verify');
const statusMsg = document.getElementById('status-msg');

const step0 = document.getElementById('step-0');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');

const canvas = document.getElementById('output-canvas');
const ctx = canvas.getContext('2d');
const btnDownload = document.getElementById('btn-download');

// Identity Elements
const selfieInput = document.getElementById('selfie-input');
const selfieDropZone = document.getElementById('selfie-drop-zone');
const selfiePreview = document.getElementById('selfie-preview');
const btnRegister = document.getElementById('btn-register');

// Upgrade Elements
const btnUpgradeModal = document.getElementById('btn-upgrade-modal');
const upgradeModal = document.getElementById('upgrade-modal');
const btnConfirmUpgrade = document.getElementById('btn-confirm-upgrade');
const btnCloseUpgrade = document.getElementById('btn-close-upgrade');

// State
let currentProductImage = null;
let currentSelfie = null;
let registeredVendorId = null;
let registeredVendorName = null;

// --- UPGRADE LOGIC ---
if (btnUpgradeModal) {
    btnUpgradeModal.addEventListener('click', () => upgradeModal.classList.remove('hidden'));
    btnCloseUpgrade.addEventListener('click', () => upgradeModal.classList.add('hidden'));

    btnConfirmUpgrade.addEventListener('click', async () => {
        btnConfirmUpgrade.innerText = "Processing...";
        try {
            const res = await fetch('/api/payments/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'SUBSCRIPTION_UPGRADE',
                    vendorId: registeredVendorId,
                    amount: 10
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Upgrade Successful! You are now a Pro Vendor.");
                upgradeModal.classList.add('hidden');
                btnUpgradeModal.style.display = 'none'; // Hide button after upgrade
            }
        } catch (err) {
            alert("Upgrade failed.");
        } finally {
            btnConfirmUpgrade.innerText = "Pay $10/mo";
        }
    });

    // Check LocalStorage on Load
    const savedId = localStorage.getItem('trustl_vendor_id');
    const savedName = localStorage.getItem('trustl_vendor_name');

    if (savedId && savedName) {
        // Auto-login
        registeredVendorId = savedId;
        registeredVendorName = savedName;

        step0.classList.add('hidden');
        step1.classList.remove('hidden');
        document.getElementById('vendor-welcome').textContent = `Welcome, ${savedName} 👋`;
    }
}


// --- STEP 0: IDENTITY ---
selfieDropZone.addEventListener('click', () => selfieInput.click());
selfieInput.addEventListener('change', (e) => handleSelfie(e.target.files[0]));

function handleSelfie(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        currentSelfie = e.target.result;
        selfiePreview.src = currentSelfie;
        selfiePreview.classList.remove('hidden');
        selfieDropZone.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

btnRegister.addEventListener('click', async () => {
    const name = document.getElementById('reg-name').value.trim();
    const instagram = document.getElementById('reg-insta').value.trim();
    const whatsapp = document.getElementById('reg-whatsapp').value.trim();

    if (!name || !currentSelfie) {
        showStatus("Name and Selfie are required.", "error");
        return;
    }

    showStatus("Verifying Identity...", "normal");
    btnRegister.disabled = true;

    try {
        const response = await fetch('/api/vendors/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, instagram, whatsapp, selfieImage: currentSelfie })
        });
        const result = await response.json();

        if (!result.success) throw new Error(result.error || "Registration failed.");

        // Success
        registeredVendorId = result.vendorId;
        registeredVendorName = name;

        // Save Session
        localStorage.setItem('trustl_vendor_id', registeredVendorId);
        localStorage.setItem('trustl_vendor_name', registeredVendorName);

        showStatus("Identity Verified! You are now listed on the Dashboard.", "success");
        setTimeout(() => {
            step0.classList.add('hidden');
            step1.classList.remove('hidden');
            document.getElementById('vendor-welcome').textContent = `Welcome, ${name} 👋`;
            showStatus("", "normal");
        }, 1500);

    } catch (error) {
        showStatus(error.message, "error");
        btnRegister.disabled = false;
    }
});


// --- STEP 1: PRODUCT ---
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        currentProductImage = e.target.result;
        preview.src = currentProductImage;
        preview.classList.remove('hidden');
        dropZone.style.display = 'none';
        detailsForm.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

btnVerify.addEventListener('click', async () => {
    const productName = document.getElementById('product-name').value.trim();

    if (!productName) {
        showStatus("Please enter product name.", "error");
        return;
    }

    showStatus("Verifying with AI...", "normal");
    btnVerify.disabled = true;

    try {
        // 1. Verify Image
        const verifyResponse = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: currentProductImage })
        });
        const verifyResult = await verifyResponse.json();

        if (!verifyResult.success || !verifyResult.isAuthentic) {
            throw new Error(verifyResult.message || "Verification failed.");
        }

        // 2. Create Certificate (Linked to Vendor)
        showStatus("Generating Certificate...", "normal");
        const certResponse = await fetch('/api/certificates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product: productName,
                vendor: registeredVendorName, // Use registered name
                vendorId: registeredVendorId, // Link to ID
                verificationResult: verifyResult
            })
        });
        const certResult = await certResponse.json();

        if (!certResult.success) {
            throw new Error("Failed to create certificate.");
        }

        // 3. Generate Image
        await generateVerifiedImage(certResult.certificate.id, registeredVendorName, productName);

        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        showStatus("", "normal");

    } catch (error) {
        showStatus(error.message, "error");
        btnVerify.disabled = false;
    }
});

function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = "status " + type;
}

// --- CANVAS GEN ---
async function generateVerifiedImage(certId, vendor, product) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = currentProductImage;
        img.onload = () => {
            canvas.width = 1080;
            canvas.height = 1080;

            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // Overlay
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 800, 1080, 280);

            // Text
            ctx.fillStyle = "white";
            ctx.font = "bold 60px Arial";
            ctx.fillText("TrustL Verified", 50, 880);

            ctx.font = "40px Arial";
            ctx.fillText(product, 50, 950);
            ctx.fillStyle = "#10b981"; // Green for vendor
            ctx.fillText(`Verified Vendor: ${vendor}`, 50, 1010);

            // QR Code
            const qrUrl = window.location.origin + `/certificate.html?id=${certId}`;
            const qrDiv = document.getElementById('qr-code-hidden');
            qrDiv.innerHTML = "";
            new QRCode(qrDiv, {
                text: qrUrl,
                width: 200,
                height: 200
            });

            setTimeout(() => {
                const qrImg = qrDiv.querySelector('img');
                if (qrImg) {
                    ctx.drawImage(qrImg, 830, 830, 200, 200);
                    ctx.fillStyle = "white";
                    ctx.font = "bold 24px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText("SCAN TO VERIFY", 930, 1050);
                }
                resolve();
            }, 500);
        };
    });
}

btnDownload.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `trustl-verified-${registeredVendorName}.png`;
    link.href = canvas.toDataURL();
    link.click();
});
