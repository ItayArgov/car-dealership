import { z } from "zod";

/**
 * Schema for valid sort fields
 */
export const sortFieldSchema = z.enum(["sku", "model", "make", "price", "year", "color", "createdAt"], {
	message: "Invalid sort field",
});

/**
 * Schema for sort direction
 */
export const sortDirectionSchema = z.enum(["asc", "desc"], {
	message: "Sort direction must be either 'asc' or 'desc'",
});

/**
 * Schema for a single sort option
 */
export const sortOptionSchema = z.object({
	field: sortFieldSchema,
	direction: sortDirectionSchema,
});

/**
 * Schema for validating sort query parameter
 * Format: "field:direction,field:direction"
 * Example: "createdAt:desc,price:asc"
 */
export const sortQuerySchema = z
	.string()
	.optional()
	.transform((val) => {
		if (!val) return undefined;

		const sortOptions = val.split(",").map((item) => {
			const [field, direction = "asc"] = item.split(":");
			return { field, direction };
		});

		return sortOptions;
	})
	.pipe(z.array(sortOptionSchema).optional());

export type SortField = z.infer<typeof sortFieldSchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;
export type SortOption = z.infer<typeof sortOptionSchema>;
