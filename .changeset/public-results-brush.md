---
'server.close': patch
---

fix: ensure server close starts before timeout race

Extract closeServer call before Promise.race to guarantee server
closing begins after setting connection close headers on active sockets.
