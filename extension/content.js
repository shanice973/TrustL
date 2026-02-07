// Basic Content Script to extract product details
console.log("TrustL Content Script Loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProductDetails") {
        const details = extractProductDetails();
        sendResponse(details);
    }
});

function extractProductDetails() {
    let imageUrl = "";
    let price = "";

    // Heuristics for finding the main product image
    // 1. Open Graph Image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
        imageUrl = ogImage.content;
    }

    // 2. Specific selectors for major sites (Amazon, etc)
    if (window.location.hostname.includes('amazon')) {
        const landingImage = document.getElementById('landingImage');
        if (landingImage) imageUrl = landingImage.src;

        const priceElem = document.querySelector('.a-price .a-offscreen');
        if (priceElem) price = priceElem.innerText;
    } else if (window.location.hostname.includes('shein')) {
        // Simple heuristic for other sites, find the largest image in the main area
        // This is a placeholder for site-specific logic
    }

    // Fallback: Find largest image on screen
    if (!imageUrl) {
        const images = Array.from(document.images);
        if (images.length > 0) {
            // Filter out small icons/logos
            const likelyImages = images.filter(img => img.width > 200 && img.height > 200);
            if (likelyImages.length > 0) {
                // Sort by size
                likelyImages.sort((a, b) => (b.width * b.height) - (a.width * a.height));
                imageUrl = likelyImages[0].src;
            }
        }
    }

    return {
        imageUrl: imageUrl,
        productUrl: window.location.href,
        price: price
    };
}
