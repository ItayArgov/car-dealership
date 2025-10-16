import { useNavigate } from "react-router-dom";
import {
	Table,
	Button,
	Text,
	Box,
	Loader,
	Center,
	ScrollArea,
	Group,
	UnstyledButton,
} from "@mantine/core";
import { IconEye, IconTrash, IconChevronUp, IconChevronDown, IconSelector } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useDeleteCar } from "../hooks/useCarMutations";
import type { Car } from "@dealership/common/models";
import type { SortOption, SortField } from "@dealership/common/types";

interface CarsTableProps {
	cars: Car[];
	isLoading?: boolean;
	sort?: SortOption[];
	onSortChange?: (sort: SortOption[]) => void;
}

export function CarsTable({ cars, isLoading, sort = [], onSortChange }: CarsTableProps) {
	const navigate = useNavigate();
	const deleteCar = useDeleteCar();

	const handleDelete = (car: Car) => {
		modals.openConfirmModal({
			title: "Delete Car",
			children: (
				<Text size="sm">
					Are you sure you want to delete{" "}
					<strong>
						{car.make} {car.model}
					</strong>{" "}
					(SKU: {car.sku})? This action cannot be undone.
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => deleteCar.mutate(car.sku),
		});
	};

	/**
	 * Handle column header click for sorting
	 * - Normal click: Single sort (replace all sorts)
	 * - Shift+click: Add to multi-sort
	 */
	const handleSort = (field: SortField, shiftKey: boolean) => {
		if (!onSortChange) return;

		// Find if this field is already being sorted
		const existingIndex = sort.findIndex((s) => s.field === field);

		if (!shiftKey) {
			// Single sort: toggle direction or set to ascending
			if (existingIndex !== -1) {
				const currentDirection = sort[existingIndex].direction;
				const newDirection = currentDirection === "asc" ? "desc" : "asc";
				onSortChange([{ field, direction: newDirection }]);
			} else {
				onSortChange([{ field, direction: "asc" }]);
			}
		} else {
			// Multi-sort with shift key
			const newSort = [...sort];

			if (existingIndex !== -1) {
				// Toggle direction of existing sort
				const currentDirection = newSort[existingIndex].direction;
				newSort[existingIndex].direction = currentDirection === "asc" ? "desc" : "asc";
			} else {
				// Add new sort to the end
				newSort.push({ field, direction: "asc" });
			}

			onSortChange(newSort);
		}
	};

	/**
	 * Get sort indicator icon for a column
	 */
	const getSortIcon = (field: SortField) => {
		const sortOption = sort.find((s) => s.field === field);

		if (!sortOption) {
			return <IconSelector size={14} style={{ opacity: 0.4 }} />;
		}

		const sortIndex = sort.findIndex((s) => s.field === field);
		const isSorted = sortOption !== undefined;
		const isMultiSort = sort.length > 1;

		return (
			<Group gap={4}>
				{sortOption.direction === "asc" ? (
					<IconChevronUp size={14} />
				) : (
					<IconChevronDown size={14} />
				)}
				{isSorted && isMultiSort && (
					<Text size="xs" fw={600}>
						{sortIndex + 1}
					</Text>
				)}
			</Group>
		);
	};

	/**
	 * Render sortable table header
	 */
	const renderSortableHeader = (field: SortField, label: string) => {
		const isSorted = sort.some((s) => s.field === field);

		return (
			<Table.Th>
				<UnstyledButton
					onClick={(e) => handleSort(field, e.shiftKey)}
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						fontWeight: isSorted ? 600 : 500,
						color: isSorted ? "var(--mantine-color-blue-6)" : "inherit",
					}}
				>
					<Text size="sm">{label}</Text>
					{getSortIcon(field)}
				</UnstyledButton>
			</Table.Th>
		);
	};

	if (isLoading) {
		return (
			<Center h={200}>
				<Loader size="lg" />
			</Center>
		);
	}

	if (cars.length === 0) {
		return (
			<Center h={200}>
				<Text c="dimmed" size="lg">
					No cars found. Create your first car to get started.
				</Text>
			</Center>
		);
	}

	return (
		<ScrollArea h={600}>
			<Table striped highlightOnHover withTableBorder withColumnBorders stickyHeader>
				<Table.Thead>
					<Table.Tr>
						{renderSortableHeader("sku", "SKU")}
						{renderSortableHeader("model", "Model")}
						{renderSortableHeader("make", "Make")}
						{renderSortableHeader("price", "Price")}
						{renderSortableHeader("year", "Year")}
						{renderSortableHeader("color", "Color")}
						<Table.Th w={150}>Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{cars.map((car) => (
						<Table.Tr key={car.sku}>
							<Table.Td>
								<Text fw={500}>{car.sku}</Text>
							</Table.Td>
							<Table.Td>{car.model}</Table.Td>
							<Table.Td>{car.make}</Table.Td>
							<Table.Td>${car.price.toLocaleString()}</Table.Td>
							<Table.Td>{car.year}</Table.Td>
							<Table.Td>
								<Box
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: "8px",
									}}
								>
									<Box
										style={{
											width: "12px",
											height: "12px",
											borderRadius: "50%",
											backgroundColor: car.color,
											border: "1px solid #ccc",
										}}
									/>
									<Text tt="capitalize">{car.color}</Text>
								</Box>
							</Table.Td>
							<Table.Td>
								<Group gap="xs">
									<Button
										variant="light"
										color="blue"
										size="xs"
										leftSection={<IconEye size={16} />}
										onClick={() => navigate(`/cars/${car.sku}`)}
									>
										View
									</Button>
									<Button
										variant="light"
										color="red"
										size="xs"
										leftSection={<IconTrash size={16} />}
										onClick={() => handleDelete(car)}
									>
										Delete
									</Button>
								</Group>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}
