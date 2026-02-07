import {
  createReview,
  getReviewsByProduct
} from "../models/reviewsModels.js";

// Add review
export const addReview = async (req, res) => {
  try {
    const reviewId = await createReview(req.body);
    res.status(201).json({
      message: "Review added successfully",
      reviewId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add review" });
  }
};

// Get reviews by product
export const fetchReviewsByProduct = async (req, res) => {
  try {
    const reviews = await getReviewsByProduct(req.params.product_id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};
