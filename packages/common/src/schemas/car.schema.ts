import { z } from "zod";
import { CAR_COLORS, MIN_YEAR, MAX_YEAR } from "../constants/car.constants";

// Base Car schema with all validations (excluding timestamps - managed by backend)
export const CarSchema = z.object({
	sku: z.string().min(1, "SKU is required").trim(),
	model: z.string().min(1, "Model is required").trim(),
	make: z.string().min(1, "Make is required").trim(),
	price: z.number().positive("Price must be a positive number"),
	year: z.number().int().min(MIN_YEAR, `Year must be at least ${MIN_YEAR}`).max(MAX_YEAR, `Year cannot exceed ${MAX_YEAR}`),
	color: z.enum(CAR_COLORS, {
		message: `Color must be one of: ${CAR_COLORS.join(", ")}`,
	}),
});

// For creating a new car - excludes timestamps (managed by backend)
export const CreateCarSchema = CarSchema;

// For updating a car - SKU comes from URL path, not payload (PUT semantics - full replacement)
export const UpdateCarDataSchema = CarSchema.omit({ sku: true });

// Infer types for use in TypeScript
export type CarSchemaType = z.infer<typeof CarSchema>;
export type CreateCarInput = z.infer<typeof CreateCarSchema>;
export type UpdateCarData = z.infer<typeof UpdateCarDataSchema>;
