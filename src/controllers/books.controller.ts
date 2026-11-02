import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { AppError } from "../utils/app-error.js";
import { createBookSchema, updateBookSchema } from "../validators/schemas.js";
import * as books from "../services/books.service.js";

function validId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !ObjectId.isValid(value) || value.length !== 24) throw new AppError("Invalid book ID.", 400);
  return value;
}

export const getBooks: RequestHandler = async (req, res) => {
  const mine = req.query.mine === "true";
  if (req.query.mine !== undefined && req.query.mine !== "true" && req.query.mine !== "false") {
    throw new AppError("The mine query parameter must be true or false.", 400);
  }
  const rawLimit = req.query.limit;
  const limit = rawLimit === undefined ? undefined : Number(rawLimit);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 1000)) throw new AppError("Limit must be a whole number from 1 to 1000.", 400);
  if (req.query.sort !== undefined && req.query.sort !== "newest") throw new AppError("Books can only be sorted newest first.", 400);
  const data = await books.listBooks({ userId: mine ? req.authUser!.userId : undefined, limit });
  res.json({ success: true, data });
};

export const getBook: RequestHandler = async (req, res) => {
  const data = await books.getBook(validId(req.params.id));
  res.json({ success: true, data });
};

export const createBook: RequestHandler = async (req, res) => {
  const input = createBookSchema.parse(req.body);
  const data = await books.createBook(input, req.authUser!);
  res.status(201).json({ success: true, message: "Book added to the library.", data });
};

export const updateBook: RequestHandler = async (req, res) => {
  const input = updateBookSchema.parse(req.body);
  const data = await books.updateBook(validId(req.params.id), req.authUser!.userId, input);
  res.json({ success: true, message: "Book details updated.", data });
};

export const deleteBook: RequestHandler = async (req, res) => {
  await books.deleteBook(validId(req.params.id), req.authUser!.userId);
  res.json({ success: true, message: "Book removed from the library." });
};
