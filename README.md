To learn why & how I made this project, check out my blog post: https://gholtz.app/writing/how-i-built-a-5g-core 

# 5G Mobile Core Implementation

<img width="1506" height="814" alt="Screenshot 2026-01-15 at 11 47 34 PM" src="https://github.com/user-attachments/assets/1b0f6660-fa30-4edd-9605-5da2555ed248" />

This repo is a complete 5G Mobile Core implementation, designed for 5G SA, with the following Network Functions:
- **NRF** (Network Repository Function) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **AUSF** (Authentication Server Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **UDM** (Unified Data Management) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **NSSF** (Network Slice Selection Function) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **AMF** (Access and Mobility Management Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **SMF** (Session Management Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **UPF** (User Plane Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **SCP** (Service Communication Proxy) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **SEPP** (Security Edge Protection Proxy) <img src="img/rust.png" alt="Rust" width="20" height="20">


# Introduction / Why is this important?
You likely use 5G networks every day when using your phone. To make a 5g network from scratch, there are two parts: 
1. Mobile Core (Software)
2. Cell Towers (Hardware)

This repo implements the software portion of a 5G network.

In order for this code to be useful, the next step is to point it to a cell tower. The common practice in the industry for this is to buy a radio online for thousands of dollars. If you don't feel like spending five figures on a radio, I recommend using [UERANSIM](https://github.com/aligungr/UERANSIM), a radio simulator. It's what I used while developing this project.

Here's what the communication flow looks like:

Cell Phone <-> Cell Tower <-> Mobile Core

## Quick Start
1. clone the repo
```bash
git clone --recursive https://github.com/gholtzap/5g-core.git
cd 5g-core
```
2. run the following:
```bash
./scripts/setup.sh
```
*this script installs everything needed.*

3. run the following:
```bash
./scripts/start.sh
```
*this script starts everything*.


There's more detailed information on installaton located @  [docs/installation.md](docs/installation.md) 

Common Issues:
1. `failed to solve: ResourceExhausted:` you likely need to allocate your Docker Desktop to use more RAM.
