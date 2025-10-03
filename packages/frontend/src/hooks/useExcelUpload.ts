import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/api";

/**
 * Hook for uploading Excel files for bulk insert
 */
export function useExcelInsert() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => api.uploadExcelInsert(file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cars"] });
		},
	});
}

/**
 * Hook for uploading Excel files for bulk update
 */
export function useExcelUpdate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => api.uploadExcelUpdate(file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cars"] });
		},
	});
}
