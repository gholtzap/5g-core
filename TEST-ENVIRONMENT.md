# 5G Core Test Environment

Complete containerized 5G SA Core test environment with UERANSIM for simulating UE attach procedures.

## Architecture

```
Docker Network: 5g-core-net (10.53.1.0/24)

┌─────────────────────────────────────────────────────────────┐
│                    5G Core Network                          │
│                                                             │
│  AMF (Go)          SMF (Rust)       AUSF (Rust)            │
│  10.53.1.10:8000   10.53.1.20:8080  10.53.1.30:8080        │
│  10.53.1.10:38412                                           │
│                                                             │
│  NRF (TS)          NSSF (TS)        UDM (TS)               │
│  10.53.1.40:8080   10.53.1.50:8080  10.53.1.60:8080        │
│                                                             │
│  MongoDB Atlas (External)                                   │
│  cluster0.rcdmv8e.mongodb.net                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Test Components                          │
│                                                             │
│  UERANSIM gNB                    UERANSIM UE               │
│  10.53.1.100                     10.53.1.101                │
│  (connects to AMF:38412)         (connects to gNB)         │
└─────────────────────────────────────────────────────────────┘
```

## Network Configuration

- **MCC**: 999
- **MNC**: 70
- **TAC**: 1
- **PLMN ID**: 99970
- **Network Slice**: SST=1 (eMBB)
- **DNN**: internet

## Test Subscriber

- **IMSI**: 999700123456789
- **MSISDN**: 1234567890
- **K**: 465B5CE8B199B49FAA5F0A2EE238A6BC
- **OPC**: E8ED289DEBA952E4283B54E88E6183CA
- **AMF**: 8000

## Prerequisites

- Docker Engine 22.0.5 or above
- Docker Compose v2.14 or above
- Node.js 18+ (for subscriber provisioning script)
- Git Bash (Windows) or Bash (Linux/Mac)
- At least 8GB RAM available for Docker
- 20GB free disk space

## Quick Start

### 1. Build All Docker Images

```bash
./scripts/build-all.sh
```

This will build all 7 Docker images:
- NRF (Network Repository Function)
- AUSF (Authentication Server)
- UDM (Unified Data Management)
- NSSF (Network Slice Selection)
- AMF (Access & Mobility Management)
- SMF (Session Management)
- UERANSIM (gNB + UE Simulator)

**Note**: Building may take 10-20 minutes depending on your system.

### 2. Provision Test Subscriber

```bash
npm install mongodb dotenv
node scripts/provision-subscriber.js
```

This creates the test subscriber in MongoDB Atlas with the credentials from [.env](.env).

### 3. Start 5G Core Network

```bash
./scripts/start-core.sh
```

This starts the core network in the correct order:
1. NRF (must start first)
2. Support NFs (AUSF, UDM, NSSF)
3. Core NFs (AMF, SMF)

### 4. Verify NF Registration

```bash
docker-compose ps
docker-compose logs nrf | grep -i "registered"
```

You should see all NFs successfully registered with the NRF.

### 5. Start UERANSIM Test

```bash
./scripts/start-test.sh
```

This starts:
1. UERANSIM gNB (establishes NGAP connection to AMF)
2. UERANSIM UE (attempts registration and PDU session)

### 6. Monitor Attach Procedure

```bash
./scripts/view-logs.sh
```

Or view specific components:

```bash
docker-compose logs -f ueransim-ue
docker-compose logs -f amf
docker-compose logs -f ausf
docker-compose logs -f smf
```

## Expected Test Flow

### Successful Steps (Should Complete)

1. **gNB Registration** (N2 Interface)
   - gNB establishes SCTP/NGAP connection with AMF
   - Check: `docker-compose logs amf | grep -i "ngap"`

2. **UE Registration Request**
   - UE sends Registration Request via gNB
   - Check: `docker-compose logs amf | grep -i "registration"`

3. **Authentication** (via AUSF)
   - AMF requests authentication from AUSF
   - AUSF validates credentials with UDM
   - Check: `docker-compose logs ausf | grep -i "auth"`

4. **Registration Accept**
   - AMF sends Registration Accept to UE
   - UE is now registered on the network
   - Check: `docker-compose logs ueransim-ue | grep -i "registered"`

### Expected Failure Point

5. **PDU Session Establishment** (N4 Interface)
   - UE requests PDU session for "internet" DNN
   - SMF attempts to establish session
   - **SMF fails** to communicate with UPF (no UPF deployed)
   - Error reveals required UPF endpoints

Check SMF logs for the failure:

```bash
docker-compose logs smf | grep -i "upf\|pfcp\|error"
```

**This is the desired outcome!** The failure will tell you exactly which UPF endpoints and PFCP messages you need to implement.

## Debugging

### Check Container Status

```bash
docker-compose ps
```

All containers should show "Up" status.

### Check NF Registration Status

```bash
docker-compose logs nrf | grep -i "register"
```

You should see registration messages from AMF, SMF, AUSF, UDM, NSSF.

### Check NGAP Connection

```bash
docker-compose logs amf | grep -i "sctp\|ngap"
```

Should show SCTP association and NGAP setup with gNB.

### Check Authentication

```bash
docker-compose logs ausf | grep -i "5g-aka\|auth"
```

Should show authentication vectors and successful auth.

### Check MongoDB Connection

```bash
docker-compose logs nrf | grep -i "mongo\|database"
docker-compose logs udm | grep -i "mongo\|database"
```

Should show successful MongoDB Atlas connections.

### Restart Everything

```bash
docker-compose down
docker-compose up -d
```

## Troubleshooting

### Problem: NRF Won't Start

**Symptoms**: NRF container exits immediately

**Solution**:
1. Check MongoDB Atlas credentials in [.env](.env)
2. Verify MongoDB Atlas allows connections from your IP
3. Check NRF logs: `docker-compose logs nrf`

### Problem: AMF Can't Connect to NRF

**Symptoms**: AMF logs show connection errors to NRF

**Solution**:
1. Ensure NRF is healthy: `docker-compose ps nrf`
2. Check network: `docker network inspect 5g-core_5g-core-net`
3. Verify NRF_URI in AMF config

### Problem: gNB Can't Connect to AMF

**Symptoms**: gNB logs show SCTP/NGAP errors

**Solution**:
1. Check AMF NGAP interface: `docker-compose logs amf | grep 38412`
2. Verify AMF IP in [config/ueransim/gnb.yaml](config/ueransim/gnb.yaml)
3. Ensure SCTP kernel module loaded (Linux)

### Problem: UE Authentication Fails

**Symptoms**: AUSF logs show authentication errors

**Solution**:
1. Verify subscriber exists: Run provision script again
2. Check IMSI matches: [config/ueransim/ue.yaml](config/ueransim/ue.yaml) vs MongoDB
3. Verify K and OPC values match

### Problem: No Logs from UERANSIM

**Symptoms**: UERANSIM containers show "Up" but no logs

**Solution**:
1. Check if scripts are executable: `chmod +x docker/ueransim/*.sh`
2. Attach to container: `docker attach ueransim-gnb`
3. Restart container: `docker-compose restart ueransim-gnb`

## Port Mappings (Host Access)

For debugging, these ports are exposed to the host:

- **AMF**:
  - 8000 → SBI (HTTP)
  - 38412 → NGAP (SCTP)
- **SMF**: 8080 → SBI (HTTP)
- **AUSF**: 8081 → SBI (HTTP)
- **NRF**: 8082 → SBI (HTTP)
- **NSSF**: 8083 → SBI (HTTP)
- **UDM**: 8084 → SBI (HTTP)

You can test NF APIs from your host:

```bash
curl http://localhost:8082/nnrf-nfm/v1/nf-instances
```

## File Structure

```
5g-core/
├── .env                        # Environment variables
├── .dockerignore               # Docker ignore file
├── docker-compose.yml          # Main orchestration
├── TEST-ENVIRONMENT.md         # This file
│
├── config/                     # Configuration files
│   ├── amf/amfcfg.json        # AMF configuration
│   ├── smf/.env               # SMF environment
│   ├── ausf/.env              # AUSF environment
│   ├── nrf/config.yaml        # NRF configuration
│   ├── nssf/.env              # NSSF environment
│   ├── udm/.env               # UDM environment
│   └── ueransim/
│       ├── gnb.yaml           # gNB configuration
│       └── ue.yaml            # UE configuration
│
├── scripts/                    # Helper scripts
│   ├── build-all.sh           # Build all images
│   ├── start-core.sh          # Start core network
│   ├── start-test.sh          # Start UERANSIM
│   ├── view-logs.sh           # View all logs
│   └── provision-subscriber.js # Provision test subscriber
│
├── docker/                     # Docker build files
│   └── ueransim/
│       ├── Dockerfile         # UERANSIM image
│       ├── start-gnb.sh       # gNB startup script
│       └── start-ue.sh        # UE startup script
│
└── [NF directories]/           # Each NF has its own Dockerfile
    ├── amf/Dockerfile
    ├── smf/Dockerfile
    ├── ausf/Dockerfile
    ├── nrf/Dockerfile
    ├── nssf/Dockerfile
    └── udm/Dockerfile
```

## Next Steps After Testing

Once you've identified the UPF failure:

1. **Analyze SMF Logs**
   - Note which PFCP messages SMF attempts to send
   - Identify UPF endpoints that need implementation

2. **Implement UPF**
   - Create UPF with required PFCP endpoints
   - Implement N3 interface (GTP-U)
   - Implement N4 interface (PFCP)
   - Implement N6 interface (data forwarding)

3. **Update Configuration**
   - Add UPF to docker-compose.yml
   - Configure SMF to point to UPF
   - Configure UPF PFCP address

4. **Retest**
   - Run attach procedure again
   - Verify PDU session establishment succeeds
   - Test data plane (ping, HTTP traffic)

## Security Notes

This is a **test environment only**:

- ⚠️ MongoDB credentials in .env (don't commit to git!)
- ⚠️ No TLS/HTTPS (HTTP only for easier debugging)
- ⚠️ No NF-to-NF authentication
- ⚠️ Privileged containers (UERANSIM needs NET_ADMIN)
- ⚠️ All traffic in plaintext

**Never use this configuration in production!**

## Resources

- [UERANSIM GitHub](https://github.com/aligungr/UERANSIM)
- [3GPP TS 23.501](https://www.3gpp.org/DynaReport/23501.htm) - 5G System Architecture
- [3GPP TS 23.502](https://www.3gpp.org/DynaReport/23502.htm) - 5G Procedures
- [3GPP TS 29.571](https://www.3gpp.org/DynaReport/29571.htm) - 5G SBI Common Data
- [Open5GS](https://open5gs.org/) - Open Source 5G Core Reference

## Support

If you encounter issues:

1. Check logs: `./scripts/view-logs.sh`
2. Verify all containers are running: `docker-compose ps`
3. Check this troubleshooting section
4. Review component-specific READMEs in each NF directory

Happy testing!
