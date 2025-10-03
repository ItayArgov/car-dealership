import { z } from "zod";
import { CAR_COLORS, MIN_YEAR, MAX_YEAR } from "../constants/car.constants";

export const carSchema = z.object({
	sku: z.string().min(1, "SKU is required").trim(),
	model: z.string().min(1, "Model is required").trim(),
	make: z.string().min(1, "Make is required").trim(),
	price: z.number().positive("Price must be a positive number"),
	year: z
		.number()
		.int()
		.min(MIN_YEAR, `Year must be at least ${MIN_YEAR}`)
		.max(MAX_YEAR, `Year cannot exceed ${MAX_YEAR}`),
	color: z.enum(CAR_COLORS, {
		message: `Color must be one of: ${CAR_COLORS.join(", ")}`,
	}),
});

export const createCarSchema = carSchema;

export const updateCarDataSchema = carSchema.omit({ sku: true });

export type CarSchemaType = z.infer<typeof carSchema>;
export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarData = z.infer<typeof updateCarDataSchema>;
