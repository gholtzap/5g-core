import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { SubscriberProfile, CreateSubscriberRequest } from '@/types/subscriber';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const authMethod = searchParams.get('authMethod');

    const collection = await getCollection<SubscriberProfile>('subscribers');

    const query: any = {};

    if (search) {
      query.$or = [
        { supi: { $regex: search, $options: 'i' } },
        { permanentKey: { $regex: search, $options: 'i' } },
        { operatorKey: { $regex: search, $options: 'i' } }
      ];
    }

    if (authMethod && authMethod !== 'all') {
      query.authenticationMethod = authMethod;
    }

    const subscribers = await collection.find(query).toArray();

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubscriberRequest = await request.json();

    if (!body.supi || !body.permanentKey || !body.operatorKey || !body.sequenceNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: supi, permanentKey, operatorKey, sequenceNumber' },
        { status: 400 }
      );
    }

    const collection = await getCollection<SubscriberProfile>('subscribers');

    const existingSubscriber = await collection.findOne({ supi: body.supi });
    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Subscriber with this IMSI already exists' },
        { status: 409 }
      );
    }

    const subscriber: SubscriberProfile = {
      supi: body.supi,
      permanentKey: body.permanentKey,
      operatorKey: body.operatorKey,
      sequenceNumber: body.sequenceNumber,
      plmn: body.plmn,
      authenticationMethod: body.authenticationMethod || '5G_AKA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(subscriber as any);

    return NextResponse.json(
      { ...subscriber, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to create subscriber' },
      { status: 500 }
    );
  }
}
