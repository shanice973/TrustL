import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (imageBufferOrUrl) => {
    try {
        console.log("[OCR Service] Starting text extraction...");

        // Tesseract.recognize accepts Buffer, URL, or base64
        const { data: { text } } = await Tesseract.recognize(
            imageBufferOrUrl,
            'eng',
            { logger: m => console.log(`[OCR] ${m.status}: ${parseInt(m.progress * 100)}%`) }
        );

        console.log("[OCR Service] Extraction Complete.");
        return text;
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Failed to extract text from image.");
    }
};

export const verifyNameInText = (ocrText, nameToFind) => {
    if (!ocrText || !nameToFind) return false;

    const cleanText = ocrText.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanName = nameToFind.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Exact Match (Cleaned)
    if (cleanText.includes(cleanName)) return true;

    // 2. Partial Match (e.g., First Name + Last Name parts)
    const nameParts = cleanName.split(' ').filter(p => p.length > 2);
    const matchCount = nameParts.reduce((count, part) => {
        return cleanText.includes(part) ? count + 1 : count;
    }, 0);

    // If at least 50% of name parts are found (e.g. John Doe -> John found)
    return matchCount >= Math.ceil(nameParts.length / 2);
};
