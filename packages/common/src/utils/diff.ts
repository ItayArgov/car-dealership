import type { Car } from "../models/Car";

export interface CarFieldChange {
	field: string;
	fieldLabel: string;
	oldValue: string | number;
	newValue: string | number;
}

export type CarDiff = CarFieldChange[];

/**
 * Calculates the differences between two car objects
 * Only compares editable fields (excludes timestamps and deletedAt)
 */
export function calculateCarDiff(oldCar: Partial<Car>, newCar: Partial<Car>): CarDiff {
	const changes: CarDiff = [];

	// Define editable fields with their display labels
	const editableFields: Array<{ key: keyof Car; label: string }> = [
		{ key: "model", label: "Model" },
		{ key: "make", label: "Make" },
		{ key: "price", label: "Price" },
		{ key: "year", label: "Year" },
		{ key: "color", label: "Color" },
	];

	for (const { key, label } of editableFields) {
		const oldValue = oldCar[key];
		const newValue = newCar[key];

		// Check if the field has changed
		if (oldValue !== undefined && newValue !== undefined && oldValue !== newValue) {
			changes.push({
				field: key,
				fieldLabel: label,
				oldValue: oldValue as string | number,
				newValue: newValue as string | number,
			});
		}
	}

	return changes;
}
