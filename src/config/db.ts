import { Db, MongoClient } from "mongodb";
import { env } from "./env.js";

const client = new MongoClient(env.MONGODB_URI, {
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 10_000,
});

let database: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (database) return database;
  await client.connect();
  const db = client.db(env.DB_NAME);
  const hello = await db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== "isdbgrid") {
    await client.close();
    throw new Error("BookNook requires a MongoDB replica set or sharded cluster for transactional borrowing.");
  }

  await Promise.all([
    db.collection("books").createIndex({ addedByUserId: 1, createdAt: -1 }),
    db.collection("books").createIndex({ createdAt: -1 }),
    db.collection("borrows").createIndex({ bookId: 1, userId: 1 }, { unique: true, name: "one_active_borrow_per_user_book" }),
    db.collection("borrows").createIndex({ userId: 1, borrowDate: -1 }),
    db.collection("borrows").createIndex({ bookId: 1 }),
  ]);

  database = db;
  return db;
}

export function getDatabase(): Db {
  if (!database) throw new Error("Database has not been connected");
  return database;
}

export async function closeDatabase(): Promise<void> {
  database = null;
  await client.close();
}
