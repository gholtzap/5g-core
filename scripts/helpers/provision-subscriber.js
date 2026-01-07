#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017';
const DB_NAME = 'udm';
const COLLECTION_NAME = 'subscribers';

const subscriber = {
  supi: 'imsi-999700123456789',
  permanentKey: '465B5CE8B199B49FAA5F0A2EE238A6BC',
  operatorKey: 'E8ED289DEBA952E4283B54E88E6183CA',
  sequenceNumber: '000000000001',
  authenticationMethod: '5G_AKA',
  subscribedData: {
    authenticationSubscription: {
      authenticationMethod: '5G_AKA',
      permanentKey: {
        permanentKeyValue: '465B5CE8B199B49FAA5F0A2EE238A6BC'
      },
      sequenceNumber: '000000000001',
      authenticationManagementField: '8000',
      milenage: {
        op: {
          opValue: 'E8ED289DEBA952E4283B54E88E6183CA'
        }
      }
    },
    amData: {
      gpsis: ['msisdn-0123456789'],
      subscribedUeAmbr: {
        uplink: '1 Gbps',
        downlink: '2 Gbps'
      },
      nssai: {
        defaultSingleNssais: [
          { sst: 1 }
        ]
      }
    },
    smData: [
      {
        singleNssai: { sst: 1 },
        dnnConfigurations: {
          internet: {
            pduSessionTypes: {
              defaultSessionType: 'IPV4'
            },
            sscModes: {
              defaultSscMode: 'SSC_MODE_1'
            },
            '5gQosProfile': {
              '5qi': 9,
              arp: {
                priorityLevel: 8
              }
            },
            sessionAmbr: {
              uplink: '1 Gbps',
              downlink: '2 Gbps'
            }
          }
        }
      }
    ]
  }
};

async function provisionSubscriber() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const existingSubscriber = await collection.findOne({ supi: subscriber.supi });

    if (existingSubscriber) {
      console.log(`Subscriber ${subscriber.supi} already exists. Updating...`);
      const result = await collection.replaceOne(
        { supi: subscriber.supi },
        subscriber
      );
      console.log(`Updated subscriber ${subscriber.supi}`);
      console.log(`  - Modified count: ${result.modifiedCount}`);
    } else {
      console.log(`Subscriber ${subscriber.supi} does not exist. Inserting...`);
      const result = await collection.insertOne(subscriber);
      console.log(`Inserted subscriber ${subscriber.supi}`);
      console.log(`  - Inserted ID: ${result.insertedId}`);
    }

    console.log('\nSubscriber provisioned successfully!');
    console.log('\nSubscriber details:');
    console.log(`  SUPI: ${subscriber.supi}`);
    console.log(`  IMSI: 999700123456789`);
    console.log(`  MCC: 999`);
    console.log(`  MNC: 70`);
    console.log(`  K (permanentKey): ${subscriber.permanentKey}`);
    console.log(`  OPc (operatorKey): ${subscriber.operatorKey}`);
    console.log(`  SQN: ${subscriber.sequenceNumber}`);
    console.log(`  AMF: 8000`);
    console.log(`  Authentication Method: ${subscriber.authenticationMethod}`);
    console.log('\nYou can now test UE attachment with UERANSIM.');

  } catch (error) {
    console.error('Error provisioning subscriber:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed.');
  }
}

provisionSubscriber();
