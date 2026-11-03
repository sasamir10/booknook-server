import assert from "node:assert/strict";
import test from "node:test";
import { borrowBookSchema, createBookSchema, listBooksQuerySchema, updateBookSchema } from "./schemas.js";
import { availableAfterTotalChange } from "../utils/inventory.js";

const validBook = { title: "A Small Library", author: "Rae Reader", category: "Fiction", image: "https://i.ibb.co/cover.jpg", description: "A thoughtful story for a quiet afternoon.", totalCopies: 3 };

test("book create accepts valid data and rejects browser-supplied ownership", () => {
  assert.equal(createBookSchema.safeParse(validBook).success, true);
  assert.equal(createBookSchema.safeParse({ ...validBook, addedByUserId: "untrusted" }).success, false);
});

test("book inventory counts are positive integers", () => {
  assert.equal(createBookSchema.safeParse({ ...validBook, totalCopies: 0 }).success, false);
  assert.equal(createBookSchema.safeParse({ ...validBook, totalCopies: 1.5 }).success, false);
});

test("updates require at least one supported field", () => {
  assert.equal(updateBookSchema.safeParse({}).success, false);
  assert.equal(updateBookSchema.safeParse({ totalCopies: 4 }).success, true);
  assert.equal(updateBookSchema.safeParse({ availableCopies: 999 }).success, false);
});

test("borrowing requires a MongoDB ObjectId", () => {
  assert.equal(borrowBookSchema.safeParse({ bookId: "507f1f77bcf86cd799439011" }).success, true);
  assert.equal(borrowBookSchema.safeParse({ bookId: "not-an-id" }).success, false);
});

test("book listing validates and combines category and search filters", () => {
  const parsed = listBooksQuerySchema.parse({ category: "Science", search: "space", sort: "newest" });
  assert.equal(parsed.category, "Science");
  assert.equal(parsed.search, "space");
  assert.equal(listBooksQuerySchema.safeParse({ category: "Unknown" }).success, false);
  assert.equal(listBooksQuerySchema.safeParse({ search: "x".repeat(101) }).success, false);
});

test("changing total inventory preserves active loans and rejects totals below borrowed copies", () => {
  assert.equal(availableAfterTotalChange(5, 2, 6), 3);
  assert.throws(() => availableAfterTotalChange(5, 2, 2), /currently borrowed/);
});
