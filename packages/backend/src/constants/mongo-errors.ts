/**
 * MongoDB error codes
 * @see https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.yml
 */
export const MongoErrorCode = {
	/** Duplicate key error - unique index violation */
	DUPLICATE_KEY: 11000,
	/** Write conflict */
	WRITE_CONFLICT: 112,
	/** Interrupted operation */
	INTERRUPTED: 11601,
} as const;

export type MongoErrorCode = (typeof MongoErrorCode)[keyof typeof MongoErrorCode];
