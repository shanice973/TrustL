import express from "express";
import { verifyProduct } from "../controllers/verificationController.js";

const router = express.Router();

router.post("/", verifyProduct);

export default router;
