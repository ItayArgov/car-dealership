import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Title, Group, Button, Box, Pagination, Text, Center } from "@mantine/core";
import { IconPlus, IconFileUpload } from "@tabler/icons-react";
import { CarsTable } from "../components/CarsTable";
import { useCars } from "../hooks/useCars";

export function CarListPage() {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);

	const limit = 20;
	const offset = (page - 1) * limit;
	const { data, isLoading } = useCars(offset, limit);

	const total = data?.total || 0;
	const totalPages = Math.ceil(total / limit);
	const startItem = total === 0 ? 0 : offset + 1;
	const endItem = Math.min(offset + limit, total);

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

			<CarsTable cars={data?.cars || []} isLoading={isLoading} />

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
