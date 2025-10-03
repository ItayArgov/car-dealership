export interface Car {
	sku: string;
	model: string;
	make: string;
	price: number;
	year: number;
	color: "red" | "blue" | "green" | "yellow" | "silver" | "black" | "white";
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date | null;
}
