import { ObjectId } from "mongodb";
import { getDatabase } from "../config/db.js";
import type { BookDocument, BookResponse } from "../types/domain.js";
import { toBookResponse } from "../types/domain.js";
import { AppError } from "../utils/app-error.js";
import { availableAfterTotalChange } from "../utils/inventory.js";
import type { z } from "zod";
import type { createBookSchema, updateBookSchema } from "../validators/schemas.js";

type CreateBookInput = z.infer<typeof createBookSchema>;
type UpdateBookInput = z.infer<typeof updateBookSchema>;

export async function listBooks(options: { userId?: string; limit?: number }): Promise<BookResponse[]> {
  const filter = options.userId ? { addedByUserId: options.userId } : {};
  let cursor = getDatabase().collection<BookDocument>("books")
    .find(filter)
    .sort({ createdAt: -1 });
  if (options.limit) cursor = cursor.limit(options.limit);
  const books = await cursor.toArray();
  return books.map(toBookResponse);
}

export async function getBook(id: string): Promise<BookResponse> {
  const book = await getDatabase().collection<BookDocument>("books").findOne({ _id: new ObjectId(id) });
  if (!book) throw new AppError("Book not found.", 404);
  return toBookResponse(book);
}

export async function createBook(input: CreateBookInput, user: { userId: string; name: string; email: string }): Promise<BookResponse> {
  const now = new Date();
  const book: Omit<BookDocument, "_id"> = {
    ...input,
    addedByUserId: user.userId,
    addedByName: user.name,
    addedByEmail: user.email,
    availableCopies: input.totalCopies,
    createdAt: now,
    updatedAt: now,
  };
  const result = await getDatabase().collection<BookDocument>("books").insertOne(book as BookDocument);
  return toBookResponse({ ...book, _id: result.insertedId } as BookDocument);
}

export async function updateBook(id: string, userId: string, input: UpdateBookInput): Promise<BookResponse> {
  const db = getDatabase();
  const session = db.client.startSession();
  let updated: BookDocument | null = null;
  try {
    await session.withTransaction(async () => {
      const books = db.collection<BookDocument>("books");
      const bookId = new ObjectId(id);
      const existing = await books.findOne({ _id: bookId }, { session });
      if (!existing) throw new AppError("Book not found.", 404);
      if (existing.addedByUserId !== userId) throw new AppError("You can only edit books you added.", 403);

      const changes: Partial<BookDocument> = { ...input, updatedAt: new Date() };
      if (input.totalCopies !== undefined) {
        changes.availableCopies = availableAfterTotalChange(existing.totalCopies, existing.availableCopies, input.totalCopies);
      }
      await books.updateOne(
        { _id: bookId, addedByUserId: userId },
        { $set: changes },
        { session },
      );
      updated = await books.findOne({ _id: bookId }, { session });
    });
  } finally {
    await session.endSession();
  }
  if (!updated) throw new AppError("Book update did not complete.", 500);
  return toBookResponse(updated);
}

export async function deleteBook(id: string, userId: string): Promise<void> {
  const db = getDatabase();
  const session = db.client.startSession();
  try {
    await session.withTransaction(async () => {
      const books = db.collection<BookDocument>("books");
      const bookId = new ObjectId(id);
      const book = await books.findOne({ _id: bookId }, { session });
      if (!book) throw new AppError("Book not found.", 404);
      if (book.addedByUserId !== userId) throw new AppError("You can only delete books you added.", 403);
      const activeLoans = await db.collection("borrows").countDocuments({ bookId }, { session });
      if (activeLoans > 0) throw new AppError("This book cannot be deleted while readers have active loans.", 409);
      await books.deleteOne({ _id: bookId, addedByUserId: userId }, { session });
    });
  } finally {
    await session.endSession();
  }
}
