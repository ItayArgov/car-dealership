import { useQuery } from "@tanstack/react-query";
import type { SortOption, CarFilters } from "@dealership/common/types";
import * as api from "../services/api";

/**
 * Hook to fetch cars with pagination, sorting, and filtering
 */
export function useCars(offset = 0, limit = 50, sort?: SortOption[], filters?: CarFilters) {
	return useQuery({
		queryKey: ["cars", offset, limit, sort, filters],
		queryFn: () => api.getCars(offset, limit, sort, filters),
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
