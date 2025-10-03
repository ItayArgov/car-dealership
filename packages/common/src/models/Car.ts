export interface Car {
	/** The unique identifier for the car */
	sku: string;
	model: string;
	make: string;
	price: number;
	year: number;
	color: "red" | "blue" | "green" | "yellow" | "silver" | "black" | "white";
	createdAt: Date;
	updatedAt: Date;
}
