To learn why & how I made this project, check out my blog post: https://gholtz.app/writing/how-i-built-a-5g-core 

# 5G Mobile Core Implementation

You likely use 5G networks every day with your phone. To make one, there are two parts: the Mobile Core (Software) and the Cell Towers (Hardware). This repo implements the software portion of a 5G network.

Thus, in order to use this code, you must hook it up to a cell tower. If you don't feel like spending five figures on a radio, I recommend using [UERANSIM](https://github.com/aligungr/UERANSIM). It's what I used while developing this project.

Your cell phone talks to a cell tower, which talks to the mobile core.

Cell Phone <-> Cell Tower <-> Mobile Core

<img width="1506" height="814" alt="Screenshot 2026-01-15 at 11 47 34 PM" src="https://github.com/user-attachments/assets/1b0f6660-fa30-4edd-9605-5da2555ed248" />

A complete 5G Mobile Core implementation, designed for 5G SA, with the following Network Functions:
- **NRF** (Network Repository Function) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **AUSF** (Authentication Server Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **UDM** (Unified Data Management) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **NSSF** (Network Slice Selection Function) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **AMF** (Access and Mobility Management Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **SMF** (Session Management Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **UPF** (User Plane Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **SCP** (Service Communication Proxy) <img src="img/rust.png" alt="Rust" width="20" height="20">


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
