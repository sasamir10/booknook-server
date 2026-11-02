import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { AppError } from "../utils/app-error.js";
import { borrowBookSchema } from "../validators/schemas.js";
import * as borrows from "../services/borrows.service.js";

function validId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !ObjectId.isValid(value) || value.length !== 24) throw new AppError("Invalid borrow ID.", 400);
  return value;
}

export const getMyBorrows: RequestHandler = async (req, res) => {
  const data = await borrows.listMyBorrows(req.authUser!.userId);
  res.json({ success: true, data });
};

export const createBorrow: RequestHandler = async (req, res) => {
  const { bookId } = borrowBookSchema.parse(req.body);
  if (!req.authUser!.email) throw new AppError("Your account must have an email address to borrow books.", 400);
  const data = await borrows.borrowBook(bookId, req.authUser!);
  res.status(201).json({ success: true, message: "Book borrowed successfully.", data });
};

export const returnBorrow: RequestHandler = async (req, res) => {
  await borrows.returnBook(validId(req.params.id), req.authUser!.userId);
  res.json({ success: true, message: "Book returned successfully." });
};
