document.addEventListener('DOMContentLoaded', () => {
    const tabPage = document.getElementById('tab-page');
    const tabUpload = document.getElementById('tab-upload');
    const tabSearch = document.getElementById('tab-search');

    const viewPage = document.getElementById('view-page');
    const viewUpload = document.getElementById('view-upload');
    const viewSearch = document.getElementById('view-search');

    // API URL - Change this if you deploy remotely
    const API_URL = "http://localhost:5000/api";

    // Tab Switching
    function switchTab(tabId) {
        [tabPage, tabUpload, tabSearch].forEach(t => t.classList.remove('active'));
        [viewPage, viewUpload, viewSearch].forEach(v => {
            v.classList.remove('active');
            v.classList.add('hidden');
        });

        if (tabId === 'page') {
            tabPage.classList.add('active');
            viewPage.classList.add('active');
            viewPage.classList.remove('hidden');
        } else if (tabId === 'upload') {
            tabUpload.classList.add('active');
            viewUpload.classList.add('active');
            viewUpload.classList.remove('hidden');
        } else if (tabId === 'search') {
            tabSearch.classList.add('active');
            viewSearch.classList.add('active');
            viewSearch.classList.remove('hidden');
        }
    }

    tabPage.addEventListener('click', () => switchTab('page'));
    tabUpload.addEventListener('click', () => switchTab('upload'));
    tabSearch.addEventListener('click', () => switchTab('search'));

    // --- Search Logic ---
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', async (e) => {
        const term = e.target.value.toLowerCase();
        if (term.length < 2) {
            searchResults.innerHTML = '<p style="text-align: center; color: #94a3b8; font-size: 12px;">Type to search...</p>';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/vendors`);
            const data = await res.json();

            if (data.success) {
                const filtered = data.vendors.filter(v => v.name.toLowerCase().includes(term));
                renderSearchResults(filtered);
            }
        } catch (err) {
            searchResults.innerHTML = '<p style="color: red; text-align: center;">Error fetching shops.</p>';
        }
    });

    function renderSearchResults(vendors) {
        searchResults.innerHTML = '';
        if (vendors.length === 0) {
            searchResults.innerHTML = '<p style="text-align: center; color: #94a3b8;">No shops found.</p>';
            return;
        }

        vendors.forEach(v => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #f1f5f9; gap: 10px;";

            div.innerHTML = `
                <img src="${v.avatarUrl}" style="width: 30px; height: 30px; border-radius: 50%;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 13px;">
                        ${v.name} 
                        ${v.isPro ? '⭐' : ''}
                        ${v.socials?.instagram ? '📸' : ''}
                    </div>
                </div>
                <span style="font-size: 10px; color: #10b981; font-weight: bold;">Verified</span>
            `;
            searchResults.appendChild(div);
        });
    }

    // --- Page Verification ---
    const btnVerifyPage = document.getElementById('btn-verify-page');
    btnVerifyPage.addEventListener('click', async () => {
        setLoading(true);
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Send message to content script
            chrome.tabs.sendMessage(tab.id, { action: "getProductDetails" }, async (response) => {
                if (chrome.runtime.lastError) {
                    showResult("Error: Could not connect to page. Try refreshing.", false);
                    setLoading(false);
                    return;
                }

                if (!response || !response.imageUrl) {
                    showResult("Could not detect a product image on this page.", false);
                    setLoading(false);
                    return;
                }

                // Call Backend
                await verifyProduct(response.imageUrl, response.productUrl, response.price);
            });

        } catch (error) {
            console.error(error);
            showResult("An internal error occurred.", false);
            setLoading(false);
        }
    });

    // --- Upload Verification ---
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const btnVerifyUpload = document.getElementById('btn-verify-upload');

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    function handleFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewContainer.classList.remove('hidden');
            btnVerifyUpload.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    btnVerifyUpload.addEventListener('click', async () => {
        if (!fileInput.files[0]) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('image', fileInput.files[0]);

        // Note: For file uploads, we usually need a different endpoint that handles multipart/form-data
        // For this demo, we will assume we upload to a service first or convert to base64/URL 
        // to match the simplistic backend endpoint which expects `imageUrl`.

        // workaround: sending base64 data URI as "imageUrl" (Backend needs to support this or we upload properly)
        // Ideally backend uses multer. For this prototype, I'll send the Data URI if it's small enough, 
        // or just mock it since we set up `verifyImage` to take a URL.

        // Actually, let's just show a mock error/message for file upload 
        // OR implement a quick helper to just send the DataURL (which might be too large for JSON body).

        // Better approach for prototype:
        // Client reads file as DataURL -> sends to backend.

        verifyProduct(imagePreview.src, null, null);
    });


    async function verifyProduct(imageUrl, productUrl, price) {
        try {
            const response = await fetch(`${API_URL}/verify`, { // Append /verify
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl, productUrl, price })
            });

            const data = await response.json();

            if (data.success) {
                showResult(data.message, data.isAuthentic, data.confidence);
            } else {
                showResult("Verification failed: " + data.error, false);
            }

        } catch (error) {
            showResult("Network could not connect to server.", false);
        } finally {
            setLoading(false);
        }
    }


    // --- UI Helpers ---
    const resultContainer = document.getElementById('result-container');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const scoreVal = document.getElementById('score-value');
    const scoreRing = document.getElementById('score-ring');
    const loader = document.querySelector('.loader');

    function setLoading(isLoading) {
        if (isLoading) {
            resultContainer.classList.remove('hidden');
            loader.classList.remove('hidden');
            document.querySelector('.result-content').classList.add('hidden');
        } else {
            loader.classList.add('hidden');
            document.querySelector('.result-content').classList.remove('hidden');
        }
    }

    function showResult(message, isAuthentic, confidenceRaw) {
        resultContainer.classList.remove('hidden');
        resultTitle.textContent = isAuthentic ? "Authentic" : "Suspicious";
        resultMessage.textContent = message;

        if (confidenceRaw !== undefined) {
            const score = Math.round(confidenceRaw * 100);
            scoreVal.textContent = score + "%";
            scoreRing.style.borderColor = isAuthentic ? "#10b981" : "#ef4444";
            resultTitle.style.color = isAuthentic ? "#10b981" : "#ef4444";
        } else {
            scoreVal.textContent = "--";
            scoreRing.style.borderColor = "#94a3b8";
            resultTitle.style.color = "#94a3b8";
        }
    }
});
