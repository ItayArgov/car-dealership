import { useQuery } from "@tanstack/react-query";
import type { SortOption } from "@dealership/common/types";
import * as api from "../services/api";

/**
 * Hook to fetch cars with pagination and sorting
 */
export function useCars(offset = 0, limit = 50, sort?: SortOption[]) {
	return useQuery({
		queryKey: ["cars", offset, limit, sort],
		queryFn: () => api.getCars(offset, limit, sort),
	});
}

/**
 * Hook to fetch a single car by SKU
 */
export function useCar(sku: string) {
	return useQuery({
		queryKey: ["car", sku],
		queryFn: () => api.getCarBySku(sku),
		enabled: !!sku,
	});
}
