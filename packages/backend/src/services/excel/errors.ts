/**
 * Excel service domain errors
 * These errors are mapped to HTTP status codes by the centralized error handler
 */

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}
