import { Router } from "express";
import { createBorrow, getMyBorrows, returnBorrow } from "../controllers/borrows.controller.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.post("/", verifyJWT, createBorrow);
router.get("/", verifyJWT, getMyBorrows);
router.delete("/:id", verifyJWT, returnBorrow);

export default router;
