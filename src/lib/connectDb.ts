import { Db, MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI ?? process.env.NEXT_PUBLIC_MONGODB_URI;

if (!uri) {
  throw new Error("Missing MongoDB URI");
}

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const clientPromise = global.mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  global.mongoClientPromise = clientPromise;
}

export async function connectDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db("TrackMyJob");
}
