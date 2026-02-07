import express from "express";
import { addUser, fetchAllUsers, fetchUserById, removeUser } from "../Controllers/userControllers.js";

const router = express.Router();

router.post("/", addUser);
router.get("/", fetchAllUsers);
router.get("/:id", fetchUserById);
router.delete("/:id", removeUser);

export default router;

