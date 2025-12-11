#!/usr/bin/env node

/**
 * Subscriber Provisioning Script for 5G Core Test Environment
 *
 * This script provisions a test subscriber in MongoDB Atlas for the UDM.
 * It creates the subscriber with authentication credentials and subscription data.
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Subscriber configuration from .env
const SUBSCRIBER = {
  imsi: process.env.IMSI || '999700123456789',
  msisdn: process.env.MSISDN || '1234567890',
  k: process.env.KEY || '465B5CE8B199B49FAA5F0A2EE238A6BC',
  opc: process.env.OPC || 'E8ED289DEBA952E4283B54E88E6183CA',
  amf: process.env.AMF_VALUE || '8000',
  sqn: '000000000000',
  plmnId: {
    mcc: process.env.MCC || '999',
    mnc: process.env.MNC || '70'
  },
  subscribedSnssais: [
    {
      sst: 1
    }
  ],
  allowedDnns: ['internet'],
  ueAmbr: {
    uplink: '100 Mbps',
    downlink: '100 Mbps'
  }
};

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'udm';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'subscribers';

async function provisionSubscriber() {
  console.log('=== 5G Core Subscriber Provisioning ===\n');

  if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not found in environment variables');
    console.error('Please ensure .env file exists and contains MONGODB_URI');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB Atlas...`);
  console.log(`Database: ${DB_NAME}`);
  console.log(`Collection: ${COLLECTION_NAME}\n`);

  const client = new MongoClient(MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✓ Connected to MongoDB Atlas\n');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Check if subscriber already exists
    console.log(`Checking for existing subscriber with IMSI: ${SUBSCRIBER.imsi}...`);
    const existing = await collection.findOne({ imsi: SUBSCRIBER.imsi });

    if (existing) {
      console.log('⚠ Subscriber already exists!');
      console.log('\nExisting subscriber data:');
      console.log(JSON.stringify(existing, null, 2));

      // Ask if we should update
      console.log('\nDo you want to update this subscriber? (This will replace existing data)');
      console.log('To update, delete the existing subscriber first and re-run this script.\n');
      return;
    }

    // Insert new subscriber
    console.log('✓ No existing subscriber found. Creating new subscriber...\n');
    console.log('Subscriber details:');
    console.log(JSON.stringify(SUBSCRIBER, null, 2));
    console.log('');

    const result = await collection.insertOne(SUBSCRIBER);

    if (result.acknowledged) {
      console.log('✓ Subscriber provisioned successfully!');
      console.log(`  Document ID: ${result.insertedId}`);
      console.log(`  IMSI: ${SUBSCRIBER.imsi}`);
      console.log(`  MSISDN: ${SUBSCRIBER.msisdn}`);
      console.log(`  PLMN: ${SUBSCRIBER.plmnId.mcc}-${SUBSCRIBER.plmnId.mnc}`);
      console.log(`  Allowed DNNs: ${SUBSCRIBER.allowedDnns.join(', ')}`);
      console.log(`  Allowed Slices: SST=${SUBSCRIBER.subscribedSnssais[0].sst}`);
      console.log('\n✓ Provisioning complete! The subscriber is ready for testing.\n');
    } else {
      console.error('✗ Failed to provision subscriber');
      process.exit(1);
    }

  } catch (error) {
    console.error('✗ Error during provisioning:');
    console.error(error.message);
    console.error('\nFull error:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB\n');
  }
}

// Run the provisioning
provisionSubscriber().catch(console.error);
