import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/userRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import reviewsRoute from "./routes/reviewsRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";

dotenv.config();
import certificateRoutes from "./routes/certificateRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();

// Security Middleware
app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '50mb' })); // Increase limit for selfies
app.use(cors());

// Serve static files from 'public' directory
app.use(express.static('public'));

//API security
app.use("/api/users", userRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/reviews", reviewsRoute);
app.use("/api/verify", verificationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/payments", paymentRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));