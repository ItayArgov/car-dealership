import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");

const db = client.db("dealership");

export default db;
