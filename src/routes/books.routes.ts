import { Router } from "express";
import { createBook, deleteBook, getBook, getBooks, updateBook } from "../controllers/books.controller.js";
import { verifyJWT, verifyJWTWhenMine } from "../middleware/verifyJWT.js";

const router = Router();

router.get("/", verifyJWTWhenMine, getBooks);
router.get("/:id", verifyJWT, getBook);
router.post("/", verifyJWT, createBook);
router.patch("/:id", verifyJWT, updateBook);
router.delete("/:id", verifyJWT, deleteBook);

export default router;
