# TrustL - High-Confidence Product Verification System

TrustL is a secure, AI-powered product verification platform designed to combat counterfeiting. By leveraging advanced computer vision models (ViT, ResNet) and secure verification workflows, TrustL enables vendors to certify their products and consumers to verify authenticity instantly.

## 🚀 Key Features

*   **AI-Powered Verification**: Uses Hugging Face Inference API (ViT, ResNet, MobileNet) to analyze product images.
*   **Secure Vendor Identity**: Strict vendor registration with mocked facial verification (selfie check) and social handle verification.
*   **Tamper-Evident Certificates**: Generates digital certificates for verified authentic products.
*   **Security First**: Implemented with Helmet (secure headers), Rate Limiting, and strict Input Validation.
*   **Persistent Storage**: Local JSON-based storage for certificates and vendor data (Mock DB).

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **AI Service**: Hugging Face Inference API (@huggingface/inference)
*   **Security**: Helmet, Express-Rate-Limit, Express-Validator
*   **Storage**: Local JSON Store (Simulates Database)

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

## 🔒 Security

This project has undergone a security audit and includes:
*   **No Hardcoded Secrets**: All API keys are managed via environment variables.
*   **Rate Limiting**: Protects against abuse (100 req/15min).
*   **Secure Headers**: HTTP headers hardened using `helmet`.
*   **Input Validation**: All API endpoints validate input to prevent malformed data injection.

---
*Built for the TrustL Initiative.*
