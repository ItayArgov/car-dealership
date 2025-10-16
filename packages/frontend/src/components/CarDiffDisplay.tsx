import { Table, Badge, Text, Box } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import type { CarDiff } from "@dealership/common";

interface CarDiffDisplayProps {
	changes: CarDiff;
}

export function CarDiffDisplay({ changes }: CarDiffDisplayProps) {
	if (changes.length === 0) {
		return (
			<Text size="sm" c="dimmed">
				No changes detected
			</Text>
		);
	}

	return (
		<Table striped withTableBorder withColumnBorders>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Field</Table.Th>
					<Table.Th>Old Value</Table.Th>
					<Table.Th style={{ width: 40 }}></Table.Th>
					<Table.Th>New Value</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{changes.map((change) => (
					<Table.Tr key={change.field}>
						<Table.Td>
							<Text fw={500}>{change.fieldLabel}</Text>
						</Table.Td>
						<Table.Td>
							<Badge color="red" variant="light">
								{String(change.oldValue)}
							</Badge>
						</Table.Td>
						<Table.Td>
							<Box style={{ display: "flex", justifyContent: "center" }}>
								<IconArrowRight size={16} />
							</Box>
						</Table.Td>
						<Table.Td>
							<Badge color="green" variant="light">
								{String(change.newValue)}
							</Badge>
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
}
