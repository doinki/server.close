---
'server.close': minor
---

refactor: improve type safety and code quality

- Add proper TypeScript type definitions for Node.js server types
- Replace 'any' types with specific ServerType and SocketWithResponse interfaces
- Improve variable and function naming for better readability
- Consolidate connection handlers to reduce code duplication
- Add signal parameter to shutdown and onShutdown callback
