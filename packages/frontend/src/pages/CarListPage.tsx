import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Title, Group, Button, Box, Pagination, Text, Center } from "@mantine/core";
import { IconPlus, IconFileUpload } from "@tabler/icons-react";
import { CarsTable } from "../components/CarsTable";
import { CarFilters } from "../components/CarFilters";
import { useCars } from "../hooks/useCars";
import type { SortOption, CarFilters as CarFiltersType } from "@dealership/common/types";

export function CarListPage() {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	// Default sort by createdAt descending (newest first)
	const [sort, setSort] = useState<SortOption[]>([{ field: "createdAt", direction: "desc" }]);
	// Filter state
	const [filters, setFilters] = useState<CarFiltersType>({});

	const limit = 20;
	const offset = (page - 1) * limit;
	const { data, isLoading } = useCars(offset, limit, sort, filters);

	const total = data?.total || 0;
	const totalPages = Math.ceil(total / limit);
	const startItem = total === 0 ? 0 : offset + 1;
	const endItem = Math.min(offset + limit, total);

	/**
	 * Handle sort change
	 * Reset to page 1 when sort changes
	 */
	const handleSortChange = (newSort: SortOption[]) => {
		setSort(newSort);
		setPage(1);
	};

	/**
	 * Handle filter change
	 * Reset to page 1 when filters change
	 */
	const handleFiltersChange = (newFilters: CarFiltersType) => {
		setFilters(newFilters);
		setPage(1);
	};

	return (
		<Container size="xl" py="xl">
			<Box mb="xl">
				<Group justify="space-between" align="center">
					<Title order={1}>Car Dealership Management</Title>
					<Group>
						<Button leftSection={<IconPlus size={18} />} onClick={() => navigate("/cars/new")}>
							Create Car
						</Button>
						<Button
							leftSection={<IconFileUpload size={18} />}
							onClick={() => navigate("/excel/upload")}
							variant="light"
						>
							Upload Excel
						</Button>
					</Group>
				</Group>
			</Box>

			<CarFilters filters={filters} onFiltersChange={handleFiltersChange} />

			<CarsTable
				cars={data?.cars || []}
				isLoading={isLoading}
				sort={sort}
				onSortChange={handleSortChange}
			/>

			{!isLoading && total > 0 && (
				<Box mt="md">
					<Center>
						<Group gap="xl">
							<Text size="sm" c="dimmed">
								Showing {startItem}-{endItem} of {total} cars
							</Text>
							<Pagination value={page} onChange={setPage} total={totalPages} disabled={isLoading} />
						</Group>
					</Center>
				</Box>
			)}
		</Container>
	);
}
