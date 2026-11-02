import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, message: error.issues[0]?.message ?? "Invalid request." });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    res.status(409).json({ success: false, message: "You already have this book borrowed." });
    return;
  }
  if (env.NODE_ENV !== "production") console.error(error);
  res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
};
