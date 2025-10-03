/**
 * Custom domain errors for service layer
 * These errors are mapped to HTTP status codes by the centralized error handler
 */

export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}

export class DuplicateError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "DuplicateError";
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}
