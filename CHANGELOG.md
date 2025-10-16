# server.close

## 0.2.0

### Minor Changes

- 3ca3a1d: build!: bump minimum Node.js version to 19

  BREAKING CHANGE: Node.js 19 or higher is now required. Updated build target and engine requirements accordingly.

### Patch Changes

- 651eda4: fix: ensure server close starts before timeout race

  Extract closeServer call before Promise.race to guarantee server
  closing begins after setting connection close headers on active sockets.

## 0.1.0

### Minor Changes

- 35a5a3a: refactor: improve type safety and code quality
  - Add proper TypeScript type definitions for Node.js server types
  - Replace 'any' types with specific ServerType and SocketWithResponse interfaces
  - Improve variable and function naming for better readability
  - Consolidate connection handlers to reduce code duplication
  - Add signal parameter to shutdown and onShutdown callback

## 0.0.2

### Patch Changes

- ef4b32c: 🐛

## 0.0.1

### Patch Changes

- e07e318: 🎉
