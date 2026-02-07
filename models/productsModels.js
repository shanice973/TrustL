import pool from '../Config/db.js';

const db = pool;

// Create a new product
export const createProduct = async (productData) => {
  const { seller_id, product_name, description, category, price } = productData;
  const [result] = await db.query(
    "INSERT INTO products (seller_id, product_name, description, category, price) VALUES (?, ?, ?, ?, ?)",
    [seller_id, product_name, description, category, price]
  );
  return result.insertId;
};

// Get all products
export const getAllProducts = async () => {
  const [rows] = await db.query("SELECT * FROM products");
  return rows;
};

// Get product by ID
export const getProductById = async (product_id) => {
  const [rows] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);
  return rows[0];
};

// Update product by ID
export const updateProduct = async (product_id, productData) => {
  const { product_name, description, category, price } = productData;
  const [result] = await db.query(
    "UPDATE products SET product_name = ?, description = ?, category = ?, price = ? WHERE product_id = ?",
    [product_name, description, category, price, product_id]
  );
  return result.affectedRows > 0;
};

// Delete product by ID
export const deleteProduct = async (product_id) => {
  const [result] = await db.query("DELETE FROM products WHERE product_id = ?", [product_id]);
  return result.affectedRows > 0;
};
