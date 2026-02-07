import express from "express";
import { createCertificate, getCertificateData, validateCertificate } from "../controllers/certificateController.js";

const router = express.Router();

router.post("/", validateCertificate, createCertificate);
router.get("/:id", getCertificateData);

export default router;
