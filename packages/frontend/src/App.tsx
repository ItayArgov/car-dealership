import { useState } from "react";
import { Container, Title, Group, Button, Box, Pagination, Text, Center } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconFileUpload } from "@tabler/icons-react";
import { CarsTable } from "./components/CarsTable";
import { CarModal } from "./components/CarModal";
import { ExcelUploadModal } from "./components/ExcelUploadModal";
import { useCars } from "./hooks/useCars";
import type { Car } from "@dealership/common/models";

function App() {
	const [carModalOpened, { open: openCarModal, close: closeCarModal }] = useDisclosure(false);
	const [excelModalOpened, { open: openExcelModal, close: closeExcelModal }] = useDisclosure(false);
	const [selectedCar, setSelectedCar] = useState<Car | undefined>(undefined);
	const [page, setPage] = useState(1);

	const limit = 20;
	const offset = (page - 1) * limit;
	const { data, isLoading } = useCars(offset, limit);

	const handleCreateCar = () => {
		setSelectedCar(undefined);
		openCarModal();
	};

	const handleEditCar = (car: Car) => {
		setSelectedCar(car);
		openCarModal();
	};

	const handleCloseCarModal = () => {
		setSelectedCar(undefined);
		closeCarModal();
	};

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
						<Button leftSection={<IconPlus size={18} />} onClick={handleCreateCar}>
							Create Car
						</Button>
						<Button
							leftSection={<IconFileUpload size={18} />}
							onClick={openExcelModal}
							variant="light"
						>
							Upload Excel
						</Button>
					</Group>
				</Group>
			</Box>

			<CarsTable
				cars={data?.cars || []}
				isLoading={isLoading}
				onEdit={handleEditCar}
			/>

			{!isLoading && total > 0 && (
				<Box mt="md">
					<Center>
						<Group gap="xl">
							<Text size="sm" c="dimmed">
								Showing {startItem}-{endItem} of {total} cars
							</Text>
							<Pagination
								value={page}
								onChange={setPage}
								total={totalPages}
								disabled={isLoading}
							/>
						</Group>
					</Center>
				</Box>
			)}

			<CarModal
				opened={carModalOpened}
				onClose={handleCloseCarModal}
				car={selectedCar}
			/>

			<ExcelUploadModal
				opened={excelModalOpened}
				onClose={closeExcelModal}
			/>
		</Container>
	);
}

export default App;
