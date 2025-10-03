import { useQuery } from "@tanstack/react-query";
import * as api from "../services/api";

/**
 * Hook to fetch cars with pagination
 */
export function useCars(offset = 0, limit = 50) {
	return useQuery({
		queryKey: ["cars", offset, limit],
		queryFn: () => api.getCars(offset, limit),
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
