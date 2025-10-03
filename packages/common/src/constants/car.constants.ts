import type { Car } from "../models/Car";

// Extract color type from Car interface - single source of truth
export type CarColor = Car["color"];

// Array of valid colors derived from the type
export const CAR_COLORS: readonly CarColor[] = ["red", "blue", "green", "yellow", "silver", "black", "white"] as const;

export const MIN_YEAR = 1900;
export const MAX_YEAR = new Date().getFullYear() + 1; // Allow next year's models
