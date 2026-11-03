import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { AppError } from "../utils/app-error.js";
import { createBookSchema, listBooksQuerySchema, updateBookSchema } from "../validators/schemas.js";
import * as books from "../services/books.service.js";

function validId(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !ObjectId.isValid(value) || value.length !== 24) throw new AppError("Invalid book ID.", 400);
  return value;
}

export const getBooks: RequestHandler = async (req, res) => {
  const query = listBooksQuerySchema.safeParse(req.query);
  if (!query.success) throw new AppError("Book filters are invalid.", 400);
  const { mine, limit, category, search } = query.data;
  const data = await books.listBooks({ userId: mine === "true" ? req.authUser!.userId : undefined, limit, category, search });
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
