# 5G Core Network Implementation

A complete 5G Core Network implementation with the following Network Functions:
- **NRF** (Network Repository Function) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **AUSF** (Authentication Server Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **UDM** (Unified Data Management) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **NSSF** (Network Slice Selection Function) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **AMF** (Access and Mobility Management Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **SMF** (Session Management Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **UPF** (User Plane Function) <img src="img/rust.png" alt="Rust" width="20" height="20">


## Quick Start

For automated setup, use the setup script:

```bash
git clone --recursive https://github.com/gholtzap/5g-core.git
cd 5g-core
./scripts/setup.sh
```

For manual installation, follow the steps below.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: Version 2.0 or higher

### For Subscriber Provisioning
- **Node.js**: Version 18 or higher (required for running the provisioning script)
- **npm**: Comes with Node.js

### Verify Prerequisites

```bash
# Check Docker
docker --version
docker compose version

# Check Git
git --version

# Check Node.js (for provisioning)
node --version
npm --version
```


## Installation Steps

### Step 1: Clone the Repository

Clone the repository with all submodules:

```bash
git clone --recursive https://github.com/gholtzap/5g-core.git
cd 5g-core
```

If you already cloned without `--recursive`, fetch the submodules:

```bash
git submodule update --init --recursive
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory. You can copy the example file:

```bash
cp .env.example .env
```

Edit the `.env` file with your MongoDB Atlas credentials:

```bash
# Update these values in .env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/
MONGODB_DB_NAME=udm
```

**Important:** The `.env` file contains:
- Network configuration (MCC, MNC, TAC)
- IP addresses for all network functions
- MongoDB Atlas connection (for subscriber provisioning)
- Test subscriber credentials (IMSI, KEY, OPC)

The repository also includes individual `.env` files in `config/` directories for each network function that use the local MongoDB container.

### Step 3: Build Docker Containers

Build all Docker containers (this will take 10-20 minutes depending on your system):

```bash
docker compose build
```

This builds containers for:
- MongoDB (database)
- All 5G Core network functions (NRF, AUSF, UDM, NSSF, AMF, SMF, UPF)
- UERANSIM (gNB and UE simulators)

### Step 4: Start the 5G Core

Start all services:

```bash
docker compose up
```

The services will start in the following order:
1. MongoDB
2. NRF (all other services depend on this)
3. AUSF, UDM, NSSF (register with NRF)
4. AMF (coordinates with AUSF, UDM, NSSF)
5. SMF (coordinates with UDM)
6. UPF (coordinates with SMF)
7. UERANSIM gNB (connects to AMF)
8. UERANSIM UE (connects to gNB)

### Step 5: Provision a Test Subscriber

The 5G Core needs at least one subscriber provisioned in MongoDB Atlas before the UE can attach.

Install provisioning script dependencies:

```bash
npm install mongodb dotenv
```

Run the provisioning script:

```bash
node scripts/provision-subscriber.js
```

This script will:
- Connect to your MongoDB Atlas instance
- Create a subscriber with the credentials from your `.env` file
- Configure the subscriber with default settings (100 Mbps AMBR, internet DNN, SST 1)

The default test subscriber credentials are:
- **IMSI**: 999700123456789
- **PLMN**: 999-70
- **KEY**: 465B5CE8B199B49FAA5F0A2EE238A6BC
- **OPC**: E8ED289DEBA952E4283B54E88E6183CA

### Step 6: Verify Services

Check that all services are running:

```bash
docker compose ps
```

View logs for all services:

```bash
docker compose logs -f
```

View logs for a specific service:

```bash
docker compose logs -f nrf
docker compose logs -f amf
docker compose logs -f ueransim-ue
```

## Network Architecture

The 5G Core uses a Docker bridge network (`10.53.1.0/24`) with the following IP assignments:

| Service | IP Address | External Port |
|---------|------------|---------------|
| MongoDB | 10.53.1.5 | 27017 |
| AMF | 10.53.1.10 | 8086 (HTTP), 38412 (SCTP) |
| SMF | 10.53.1.20 | 8085 (HTTP), 8805 (UDP) |
| AUSF | 10.53.1.30 | 8081 |
| NRF | 10.53.1.40 | 8082 |
| NSSF | 10.53.1.50 | 8083 |
| UDM | 10.53.1.60 | 8084 |
| UPF | 10.53.1.70 | 8087 (HTTP), 2152 (GTP), 8806 (UDP) |
| gNB | 10.53.1.100 | - |
| UE | 10.53.1.101 | - |