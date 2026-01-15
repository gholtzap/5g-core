# 5G Core Network Dashboard

A web interface for monitoring and managing your 5G mobile core network.


## Running in Docker

run:
```
docker compose up web-ui
```


## Development

Start (dev):

```
npm run dev
```

Start (prod):
```
npm start
```

Build:
```
npm run build
```

## Pages

- `/` - Dashboard overview with network status
- `/network-functions` - Detailed view of all NFs with metrics
- `/subscribers` - Registered UE devices and connection status
- `/sessions` - Active PDU sessions with throughput data
- `/metrics` - Real-time performance metrics and charts