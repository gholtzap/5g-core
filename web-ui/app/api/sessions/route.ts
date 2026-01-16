import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function GET() {
  if (!MONGODB_URI) {
    return NextResponse.json(
      { error: 'MongoDB URI not configured' },
      { status: 500 }
    );
  }

  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('smf');
    const collection = db.collection('sm_contexts');

    const sessions = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
