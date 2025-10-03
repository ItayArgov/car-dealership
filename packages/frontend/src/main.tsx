import axios from "axios";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

axios.defaults.baseURL = "http://localhost:3000/api";

createRoot(document.body).render(
	<StrictMode>
		<App />
	</StrictMode>
);
