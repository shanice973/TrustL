import db from "../config/db.js";

// Add new review
export const createReview = async (reviewData) => {
  const {
    product_id,
    user_id,
    rating,
    review_text,
    review_source
  } = reviewData;

  const [result] = await db.query(
    `INSERT INTO reviews
     (product_id, user_id, rating, review_text, review_source)
     VALUES (?, ?, ?, ?, ?)`,
    [product_id, user_id, rating, review_text, review_source]
  );

  return result.insertId;
};

// Get reviews for a product
export const getReviewsByProduct = async (product_id) => {
  const [rows] = await db.query(
    "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
    [product_id]
  );
  return rows;
};


