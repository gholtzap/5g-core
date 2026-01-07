#!/bin/bash

set -e

gum style --foreground 212 --bold "Subscriber Provisioning"
echo ""

MONGODB_CONTAINER=$(docker ps --format '{{.Names}}' | grep mongodb | head -n 1)

if [ -z "$MONGODB_CONTAINER" ]; then
    gum style --foreground 196 "✗ MongoDB container not running"
    gum style --foreground 208 "Please start MongoDB first: docker compose up -d mongodb"
    exit 1
fi

gum style --foreground 42 "✓ Found MongoDB container: $MONGODB_CONTAINER"
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

gum spin --spinner dot --title "Provisioning subscriber to Docker MongoDB..." -- \
    docker exec "$MONGODB_CONTAINER" mongosh udm --quiet --eval "
  const subscriber = $SUBSCRIBER_DOC;
  const existing = db.subscribers.findOne({ supi: subscriber.supi });
  if (existing) {
    db.subscribers.replaceOne({ supi: subscriber.supi }, subscriber);
  } else {
    db.subscribers.insertOne(subscriber);
  }
"

echo ""
gum style --foreground 42 --bold "✓ Subscriber provisioned successfully!"
echo ""
gum style --foreground 244 "Subscriber details:"
gum style --foreground 255 "  SUPI: imsi-999700123456789"
gum style --foreground 255 "  MCC/MNC: 999/70"
gum style --foreground 255 "  K: 465B5CE8B199B49FAA5F0A2EE238A6BC"
gum style --foreground 255 "  OPc: E8ED289DEBA952E4283B54E88E6183CA"
echo ""
