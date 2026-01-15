import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { SubscriberProfile, UpdateSubscriberRequest } from '@/types/subscriber';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollection<SubscriberProfile>('subscribers');
    const subscriber = await collection.findOne({ _id: new ObjectId(id) });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('Error fetching subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriber' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateSubscriberRequest = await request.json();
    const collection = await getCollection<SubscriberProfile>('subscribers');

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.permanentKey !== undefined) updateData.permanentKey = body.permanentKey;
    if (body.operatorKey !== undefined) updateData.operatorKey = body.operatorKey;
    if (body.sequenceNumber !== undefined) updateData.sequenceNumber = body.sequenceNumber;
    if (body.plmn !== undefined) updateData.plmn = body.plmn;
    if (body.authenticationMethod !== undefined) updateData.authenticationMethod = body.authenticationMethod;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollection<SubscriberProfile>('subscribers');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
