import { useNavigate } from "react-router-dom";
import { Table, Button, Text, Box, Loader, Center, ScrollArea } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import type { Car } from "@dealership/common/models";

interface CarsTableProps {
	cars: Car[];
	isLoading?: boolean;
}

export function CarsTable({ cars, isLoading }: CarsTableProps) {
	const navigate = useNavigate();
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
					<Table.Th>SKU</Table.Th>
					<Table.Th>Model</Table.Th>
					<Table.Th>Make</Table.Th>
					<Table.Th>Price</Table.Th>
					<Table.Th>Year</Table.Th>
					<Table.Th>Color</Table.Th>
					<Table.Th w={100}>Actions</Table.Th>
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
							<Button
								variant="light"
								color="blue"
								size="xs"
								leftSection={<IconEdit size={16} />}
								onClick={() => navigate(`/cars/${car.sku}/edit`)}
							>
								Edit
							</Button>
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
		</ScrollArea>
	);
}
