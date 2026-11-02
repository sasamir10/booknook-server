import type { ObjectId } from "mongodb";

export const BOOK_CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"] as const;
export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
}

export interface BookDocument {
  _id: ObjectId;
  title: string;
  author: string;
  category: BookCategory;
  image: string;
  description: string;
  addedByUserId: string;
  addedByName: string;
  addedByEmail: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowDocument {
  _id: ObjectId;
  bookId: ObjectId;
  bookTitle: string;
  bookImage: string;
  userId: string;
  userEmail: string;
  borrowDate: Date;
  returnDate: Date;
}

export type BookResponse = Omit<BookDocument, "_id" | "addedByUserId" | "addedByEmail"> & { _id: string };
export type BorrowResponse = Omit<BorrowDocument, "_id" | "bookId"> & { _id: string; bookId: string };

export const toBookResponse = (book: BookDocument): BookResponse => {
  const { addedByUserId: _addedByUserId, addedByEmail: _addedByEmail, ...publicFields } = book;
  return { ...publicFields, _id: book._id.toString() };
};
export const toBorrowResponse = (borrow: BorrowDocument): BorrowResponse => ({
  ...borrow,
  _id: borrow._id.toString(),
  bookId: borrow.bookId.toString(),
});
