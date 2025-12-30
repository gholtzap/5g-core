#!/bin/bash

set -e

echo "========================================="
echo "Provisioning Subscriber to Docker MongoDB"
echo "========================================="
echo ""

MONGODB_CONTAINER=$(docker ps --format '{{.Names}}' | grep mongodb | head -n 1)

if [ -z "$MONGODB_CONTAINER" ]; then
    echo "Error: MongoDB container not running"
    echo "Please start MongoDB first: docker compose up -d mongodb"
    exit 1
fi

echo "Found MongoDB container: $MONGODB_CONTAINER"
echo ""

SUBSCRIBER_DOC='
{
  "supi": "imsi-999700123456789",
  "permanentKey": "465B5CE8B199B49FAA5F0A2EE238A6BC",
  "operatorKey": "E8ED289DEBA952E4283B54E88E6183CA",
  "sequenceNumber": "000000000001",
  "authenticationMethod": "5G_AKA",
  "subscribedData": {
    "authenticationSubscription": {
      "authenticationMethod": "5G_AKA",
      "permanentKey": {
        "permanentKeyValue": "465B5CE8B199B49FAA5F0A2EE238A6BC"
      },
      "sequenceNumber": "000000000001",
      "authenticationManagementField": "8000",
      "milenage": {
        "op": {
          "opValue": "E8ED289DEBA952E4283B54E88E6183CA"
        }
      }
    },
    "amData": {
      "gpsis": ["msisdn-0123456789"],
      "subscribedUeAmbr": {
        "uplink": "1 Gbps",
        "downlink": "2 Gbps"
      },
      "nssai": {
        "defaultSingleNssais": [
          { "sst": 1 }
        ]
      }
    },
    "smData": [
      {
        "singleNssai": { "sst": 1 },
        "dnnConfigurations": {
          "internet": {
            "pduSessionTypes": {
              "defaultSessionType": "IPV4"
            },
            "sscModes": {
              "defaultSscMode": "SSC_MODE_1"
            },
            "5gQosProfile": {
              "5qi": 9,
              "arp": {
                "priorityLevel": 8
              }
            },
            "sessionAmbr": {
              "uplink": "1 Gbps",
              "downlink": "2 Gbps"
            }
          }
        }
      }
    ]
  }
}
'

echo "Provisioning subscriber to Docker MongoDB..."

docker exec "$MONGODB_CONTAINER" mongosh udm --eval "
  const subscriber = $SUBSCRIBER_DOC;
  const existing = db.subscribers.findOne({ supi: subscriber.supi });
  if (existing) {
    print('Subscriber already exists. Updating...');
    db.subscribers.replaceOne({ supi: subscriber.supi }, subscriber);
    print('Updated subscriber: ' + subscriber.supi);
  } else {
    print('Inserting new subscriber...');
    db.subscribers.insertOne(subscriber);
    print('Inserted subscriber: ' + subscriber.supi);
  }
  print('');
  print('Subscriber provisioned successfully!');
  print('  SUPI: imsi-999700123456789');
  print('  MCC/MNC: 999/70');
  print('  K: 465B5CE8B199B49FAA5F0A2EE238A6BC');
  print('  OPc: E8ED289DEBA952E4283B54E88E6183CA');
"

echo ""
echo "Done! Subscriber is now in Docker MongoDB."
