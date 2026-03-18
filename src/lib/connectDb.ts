import { MongoClient, ServerApiVersion } from 'mongodb'

export const connectDb = async () => {
  let db
  if (db) {
    return db
  }

  const uri = process.env.NEXT_PUBLIC_MONGODB_URI

  if (!uri) {
    throw new Error('Missing MongoDB URI')
  }

  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })

    const db = client.db('TrackMyJob')
    console.log('Connected to MongoDB successfully')
    return db
  } catch (err) {
    throw new Error(`Failed to connect to MongoDB ${err}`)
  }
}
