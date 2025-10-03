import type { ObjectId } from "mongodb";
import type { Car } from "@dealership/common/models";

/**
 * MongoDB document type for Car with _id field
 */
export interface CarDocument extends Car {
	_id: ObjectId;
}

/**
 * Converts a CarDocument to a Car by removing MongoDB's _id field
 */
export function toCarModel(doc: CarDocument): Car {
	const { _id, ...car } = doc;
	return car;
}

/**
 * Converts an array of CarDocuments to Cars
 */
export function toCarModels(docs: CarDocument[]): Car[] {
	return docs.map(toCarModel);
}
