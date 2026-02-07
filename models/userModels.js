import pool from "../Config/db.js";

const db = pool;

export const createUser = async (userData) => {
  const { name, email, password_hash,role } = userData;
  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash,role) VALUES (?, ?, ?,?)",
    [name, email, password_hash,role]
  );
  return result.insertId;
};

export const getAllUsers = async () => {
  const [rows] = await db.query("SELECT id, name, email FROM users");
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await db.query("SELCET id, name, email FROM users WHERE id = ?", [id]);
  return rows[0];
};

export const deleteUser = async (id) => {
  const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

