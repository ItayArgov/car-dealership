import { z } from "zod";
import { CAR_COLORS } from "../constants/car.constants";

/**
 * Schema for car filtering options
 * All fields are optional - only specified filters will be applied
 */
export const carFiltersSchema = z.object({
	// Text filters - partial, case-insensitive matching
	sku: z.string().optional(),
	model: z.string().optional(),
	make: z.string().optional(),

	// Number range filters
	priceMin: z.coerce.number().positive().optional(),
	priceMax: z.coerce.number().positive().optional(),
	yearMin: z.coerce.number().int().optional(),
	yearMax: z.coerce.number().int().optional(),

	// Enum filter - exact match
	color: z.enum(CAR_COLORS).optional(),
});

/**
 * Schema for validating filter query parameter from URL query params
 * Note: Query params come as strings, so we use carFiltersSchema which already handles coercion
 */
export const filterQuerySchema = carFiltersSchema.optional();

export type CarFilters = z.infer<typeof carFiltersSchema>;
