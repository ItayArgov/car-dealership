import { MongoClient } from "mongodb";

// Use environment variable for connection string (for testing), fallback to localhost
const connectionString = process.env.MONGO_URL || "mongodb://localhost:27017";

export const client = new MongoClient(connectionString);

const db = client.db("dealership");

export default db;
