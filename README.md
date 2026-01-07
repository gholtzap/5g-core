# 5G Mobile Core Implementation

<img width="405" height="711" alt="Screenshot 2026-01-07 at 9 40 51 AM" src="https://github.com/user-attachments/assets/2d5e42e1-c1f2-4c5e-9efc-e39b0daa48a5" />

A complete 5G Mobile Core implementation, designed for 5G SA, with the following Network Functions:
- **NRF** (Network Repository Function) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **AUSF** (Authentication Server Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **UDM** (Unified Data Management) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **NSSF** (Network Slice Selection Function) <img src="img/typescript.svg" alt="TypeScript" width="20" height="20">
- **AMF** (Access and Mobility Management Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **SMF** (Session Management Function) <img src="img/rust.png" alt="Rust" width="20" height="20">
- **UPF** (User Plane Function) <img src="img/rust.png" alt="Rust" width="20" height="20">


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
