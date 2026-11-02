import { z } from "zod";
import { BOOK_CATEGORIES } from "../types/domain.js";

const title = z.string().trim().min(1, "Book title is required.").max(160);
const author = z.string().trim().min(1, "Author name is required.").max(120);
const image = z.string().url("Provide a valid cover image URL.").max(2048)
  .refine((value) => {
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  }, "Cover images must use HTTPS.");
const description = z.string().trim().min(10, "Description must be at least 10 characters.").max(1200);

export const createBookSchema = z.object({
  title,
  author,
  category: z.enum(BOOK_CATEGORIES),
  image,
  description,
  totalCopies: z.number().int().min(1).max(10_000),
}).strict();

export const updateBookSchema = z.object({
  title: title.optional(),
  author: author.optional(),
  category: z.enum(BOOK_CATEGORIES).optional(),
  image: image.optional(),
  description: description.optional(),
  totalCopies: z.number().int().min(1).max(10_000).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, "Provide at least one field to update.");

export const borrowBookSchema = z.object({ bookId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid book ID.") }).strict();
