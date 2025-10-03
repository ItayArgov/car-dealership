import type { Car } from "@dealership/common/models";
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
	const [message, setMessage] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);
	const [cars] = useState<Car[]>([]); // Not yet implemented

	useEffect(() => {
		setIsLoading(true);
		axios
			.get<{ message: string }>("/message")
			.then((res) => {
				setMessage(res.data.message);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>{message}</h1>
			<ul>
				{cars.map((car) => (
					<li key={car.sku}>{car.model}</li>
				))}
			</ul>
		</div>
	);
}

export default App;
