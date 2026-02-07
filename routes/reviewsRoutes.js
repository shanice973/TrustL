import express from "express";
import {
  addReview,
  fetchReviewsByProduct
} from "../controllers/reviewscontroller.js";

const router = express.Router();

// POST review
router.post("/", addReview);

// GET reviews by product
router.get("/product/:product_id", fetchReviewsByProduct);

export default router;
