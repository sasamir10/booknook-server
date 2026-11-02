import { ObjectId } from "mongodb";
import { env } from "../config/env.js";
import { getDatabase } from "../config/db.js";
import type { BookDocument, BorrowDocument, BorrowResponse } from "../types/domain.js";
import { toBorrowResponse } from "../types/domain.js";
import { AppError } from "../utils/app-error.js";

export async function listMyBorrows(userId: string): Promise<BorrowResponse[]> {
  const rows = await getDatabase().collection<BorrowDocument>("borrows")
    .find({ userId }).sort({ borrowDate: -1 }).toArray();
  return rows.map(toBorrowResponse);
}

export async function borrowBook(bookId: string, user: { userId: string; email: string }): Promise<BorrowResponse> {
  const db = getDatabase();
  const session = db.client.startSession();
  let created: BorrowDocument | null = null;
  try {
    await session.withTransaction(async () => {
      const id = new ObjectId(bookId);
      const books = db.collection<BookDocument>("books");
      const book = await books.findOne({ _id: id }, { session });
      if (!book) throw new AppError("Book not found.", 404);

      const borrows = db.collection<BorrowDocument>("borrows");
      if (await borrows.findOne({ bookId: id, userId: user.userId }, { session })) {
        throw new AppError("You already have this book borrowed.", 409);
      }

      const inventory = await books.updateOne(
        { _id: id, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1 }, $set: { updatedAt: new Date() } },
        { session },
      );
      if (inventory.modifiedCount !== 1) throw new AppError("This book is currently not available.", 409);

      const borrowDate = new Date();
      const returnDate = new Date(borrowDate.getTime() + env.BORROW_DURATION_DAYS * 24 * 60 * 60 * 1000);
      const record: Omit<BorrowDocument, "_id"> = {
        bookId: id,
        bookTitle: book.title,
        bookImage: book.image,
        userId: user.userId,
        userEmail: user.email,
        borrowDate,
        returnDate,
      };
      const inserted = await borrows.insertOne(record as BorrowDocument, { session });
      created = { ...record, _id: inserted.insertedId } as BorrowDocument;
    });
  } finally {
    await session.endSession();
  }
  if (!created) throw new AppError("The borrow could not be completed.", 500);
  return toBorrowResponse(created);
}

export async function returnBook(borrowId: string, userId: string): Promise<void> {
  const db = getDatabase();
  const session = db.client.startSession();
  try {
    await session.withTransaction(async () => {
      const id = new ObjectId(borrowId);
      const borrows = db.collection<BorrowDocument>("borrows");
      const loan = await borrows.findOne({ _id: id, userId }, { session });
      if (!loan) throw new AppError("Active borrow record not found.", 404);

      const inventory = await db.collection<BookDocument>("books").updateOne(
        { _id: loan.bookId, $expr: { $lt: ["$availableCopies", "$totalCopies"] } },
        { $inc: { availableCopies: 1 }, $set: { updatedAt: new Date() } },
        { session },
      );
      if (inventory.modifiedCount !== 1) throw new AppError("The inventory count is inconsistent; this return was not applied.", 409);

      const deleted = await borrows.deleteOne({ _id: id, userId }, { session });
      if (deleted.deletedCount !== 1) throw new AppError("This borrow was already returned.", 409);
    });
  } finally {
    await session.endSession();
  }
}
