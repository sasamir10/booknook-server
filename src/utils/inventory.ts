import { AppError } from "./app-error.js";

export function availableAfterTotalChange(totalCopies: number, availableCopies: number, nextTotalCopies: number): number {
  const borrowedCopies = totalCopies - availableCopies;
  if (borrowedCopies < 0 || availableCopies < 0 || nextTotalCopies < borrowedCopies) {
    throw new AppError(`At least ${Math.max(0, borrowedCopies)} copies are currently borrowed, so the total cannot be lower.`, 409);
  }
  const nextAvailable = nextTotalCopies - borrowedCopies;
  if (nextAvailable < 0 || nextAvailable > nextTotalCopies) {
    throw new AppError("The requested total would make inventory inconsistent.", 409);
  }
  return nextAvailable;
}
