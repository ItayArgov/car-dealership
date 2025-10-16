import { useState } from "react";
import { Grid, TextInput, NumberInput, Select, Button, Paper, Group, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconFilter, IconFilterOff } from "@tabler/icons-react";
import type { CarFilters } from "@dealership/common/types";
import { CAR_COLORS } from "@dealership/common";

interface CarFiltersProps {
	filters: CarFilters;
	onFiltersChange: (filters: CarFilters) => void;
}

export function CarFilters({ filters, onFiltersChange }: CarFiltersProps) {
	// Local state for immediate input updates (before debouncing)
	const [localFilters, setLocalFilters] = useState<CarFilters>(filters);

	// Debounced filters (300ms delay)
	const [debouncedFilters] = useDebouncedValue(localFilters, 300);

	// Apply debounced filters to parent
	if (JSON.stringify(debouncedFilters) !== JSON.stringify(filters)) {
		onFiltersChange(debouncedFilters);
	}

	const updateFilter = <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => {
		setLocalFilters((prev) => {
			// Remove undefined or empty values
			const updated = { ...prev };
			if (value === undefined || value === "" || value === null) {
				delete updated[key];
			} else {
				updated[key] = value;
			}
			return updated;
		});
	};

	const clearFilters = () => {
		setLocalFilters({});
		onFiltersChange({});
	};

	const hasActiveFilters = Object.keys(localFilters).length > 0;

	// Color options for select
	const colorOptions = [
		{ value: "", label: "All Colors" },
		...CAR_COLORS.map((color) => ({
			value: color,
			label: color.charAt(0).toUpperCase() + color.slice(1),
		})),
	];

	return (
		<Paper p="md" mb="md" withBorder>
			<Group justify="space-between" mb="md">
				<Group gap="xs">
					<IconFilter size={20} />
					<Text fw={600}>Filters</Text>
				</Group>
				{hasActiveFilters && (
					<Button
						variant="light"
						color="gray"
						size="xs"
						leftSection={<IconFilterOff size={16} />}
						onClick={clearFilters}
					>
						Clear Filters
					</Button>
				)}
			</Group>

			<Grid gutter="md">
				{/* Text filters */}
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<TextInput
						label="SKU"
						placeholder="Search by SKU..."
						value={localFilters.sku || ""}
						onChange={(e) => updateFilter("sku", e.target.value || undefined)}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<TextInput
						label="Model"
						placeholder="Search by model..."
						value={localFilters.model || ""}
						onChange={(e) => updateFilter("model", e.target.value || undefined)}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<TextInput
						label="Make"
						placeholder="Search by make..."
						value={localFilters.make || ""}
						onChange={(e) => updateFilter("make", e.target.value || undefined)}
					/>
				</Grid.Col>

				{/* Price range */}
				<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
					<NumberInput
						label="Min Price"
						placeholder="Min"
						min={0}
						value={localFilters.priceMin ?? ""}
						onChange={(value) => updateFilter("priceMin", value === "" ? undefined : Number(value))}
						prefix="$"
						thousandSeparator=","
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
					<NumberInput
						label="Max Price"
						placeholder="Max"
						min={0}
						value={localFilters.priceMax ?? ""}
						onChange={(value) => updateFilter("priceMax", value === "" ? undefined : Number(value))}
						prefix="$"
						thousandSeparator=","
					/>
				</Grid.Col>

				{/* Year range */}
				<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
					<NumberInput
						label="Min Year"
						placeholder="Min"
						min={1900}
						max={new Date().getFullYear() + 1}
						value={localFilters.yearMin ?? ""}
						onChange={(value) => updateFilter("yearMin", value === "" ? undefined : Number(value))}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
					<NumberInput
						label="Max Year"
						placeholder="Max"
						min={1900}
						max={new Date().getFullYear() + 1}
						value={localFilters.yearMax ?? ""}
						onChange={(value) => updateFilter("yearMax", value === "" ? undefined : Number(value))}
					/>
				</Grid.Col>

				{/* Color filter */}
				<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
					<Select
						label="Color"
						placeholder="Select color"
						data={colorOptions}
						value={localFilters.color || ""}
						onChange={(value) =>
							updateFilter("color", value as CarFilters["color"] | undefined)
						}
						clearable
					/>
				</Grid.Col>
			</Grid>
		</Paper>
	);
}
