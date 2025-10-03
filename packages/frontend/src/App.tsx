import { Routes, Route } from "react-router-dom";
import { CarListPage } from "./pages/CarListPage";
import { CreateCarPage } from "./pages/CreateCarPage";
import { EditCarPage } from "./pages/EditCarPage";
import { ExcelUploadPage } from "./pages/ExcelUploadPage";

function App() {
	return (
		<Routes>
			<Route path="/" element={<CarListPage />} />
			<Route path="/cars/new" element={<CreateCarPage />} />
			<Route path="/cars/:sku/edit" element={<EditCarPage />} />
			<Route path="/excel/upload" element={<ExcelUploadPage />} />
		</Routes>
	);
}

export default App;
