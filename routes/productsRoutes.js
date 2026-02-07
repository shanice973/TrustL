import express from "express";
import { addProduct, fetchAllProducts, fetchProductById, modifyProduct, removeProduct } from "../Controllers/productsControllers.js";

const router = express.Router();

router.post("/", addProduct);
router.get("/", fetchAllProducts);
router.get("/:product_id", fetchProductById);
router.put("/:product_id", modifyProduct);
router.delete("/:product_id", removeProduct);

export default router;
