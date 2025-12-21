# Installation
```
git clone --recursive https://github.com/gholtzap/5g-core.git
```
If you cloned already without ``--recursive``, then use the following command to fetch the submodules:

```
git submodule update --init --recursive
```

# Quickstart 

```
docker compose build
docker compose up
```

> Note: you will need to connect to MongoDB and provision a subscriber to use the 5g core, this is normal.

Add a mongodb connection str to ``.env`` and then run 

```bash
npm install mongodb dotenv
node scripts/provision-subscriber.js
```
