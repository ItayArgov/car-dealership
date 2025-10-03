import { Routes, Route } from "react-router-dom";
import { CarListPage } from "./pages/CarListPage";
import { CreateCarPage } from "./pages/CreateCarPage";
import { CarDetailPage } from "./pages/CarDetailPage";
import { ExcelUploadPage } from "./pages/ExcelUploadPage";

function App() {
	return (
		<Routes>
			<Route path="/" element={<CarListPage />} />
			<Route path="/cars/new" element={<CreateCarPage />} />
			<Route path="/cars/:sku" element={<CarDetailPage />} />
			<Route path="/excel/upload" element={<ExcelUploadPage />} />
		</Routes>
	);
}

export default App;
