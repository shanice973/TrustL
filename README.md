# TrustL - High-Confidence Product Verification System

TrustL is a secure, AI-powered product verification platform designed to combat counterfeiting. By leveraging advanced computer vision models (ViT, ResNet) and secure verification workflows, TrustL enables vendors to certify their products and consumers to verify authenticity instantly.

## 🚀 Key Features

*   **AI-Powered Product Verification**: Uses Hugging Face Inference API (ViT, ResNet) to analyze product images for authenticity.
*   **Vendor Identity Verification (OCR)**: Integrates **Tesseract.js** to scan ID cards/Passports and verify the vendor's name matches the document text.
*   **Business Validation**: Allows vendors to upload Business Licenses for "Business Verified" status.
*   **Chrome Extension**: A companion browser extension that allows users to verify products directly on e-commerce sites.
*   **Security First**: Implemented with Helmet (secure headers), Rate Limiting, and strict Input Validation.
*   **Persistent Storage**: Local JSON-based storage for certificates and vendor data.

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **AI Service**: Hugging Face Inference API (@huggingface/inference)
*   **OCR Engine**: Tesseract.js (Local Optical Character Recognition)
*   **Frontend**: HTML5, CSS3 (Modern UI with Gradients), JavaScript (Vanilla)
*   **Browser Extension**: Chrome Manifest V3
*   **Security**: Helmet, Express-Rate-Limit, Express-Validator

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/shanice973/TrustL.git
    cd TrustL
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    HF_API_KEY=your_hugging_face_api_key
    ```

4.  **Start the Server**:
    ```bash
    npm start
    ```
    *Server runs on http://localhost:5000*

5.  **Test Verification**:
    *   **Vendor Portal**: Go to [http://localhost:5000/vendor.html](http://localhost:5000/vendor.html) to register (Upload ID & License).
    *   **Shops**: View verified vendors at [http://localhost:5000/shops.html](http://localhost:5000/shops.html).

## 🔒 Security

This project has undergone a security audit and includes:
*   **No Hardcoded Secrets**: All API keys are managed via environment variables.
*   **Rate Limiting**: Protects against abuse (100 req/15min).
*   **Secure Headers**: HTTP headers hardened using `helmet`.
*   **Input Validation**: All API endpoints validate input to prevent malformed data injection.

---
*Built for the TrustL Initiative.*
