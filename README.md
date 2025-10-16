# server.close

A graceful shutdown handler for Node.js HTTP/HTTP2 servers.

## Features

- 🚀 Support for HTTP and HTTP2 servers
- ⏱️ Configurable timeout
- 🔌 Automatic `Connection: close` header for active connections
- 🎯 Custom signal support
- 📦 TypeScript support
- 🪶 Zero dependencies

## Installation

```bash
npm install server.close
```

```bash
pnpm add server.close
```

```bash
yarn add server.close
```

## Usage

### Basic Usage

```typescript
import { createServer } from 'node:http';
import { gracefulShutdown } from 'server.close';

const server = createServer((req, res) => {
  res.end('Hello World');
});

// Setup graceful shutdown
gracefulShutdown(server);

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

### With Options

```typescript
import { createServer } from 'node:http';
import { gracefulShutdown } from 'server.close';

const server = createServer((req, res) => {
  res.end('Hello World');
});

gracefulShutdown(server, {
  // Callback to execute before shutdown
  onShutdown: async (signal) => {
    console.log(`Received ${signal}, cleaning up...`);
    // Close database connections, clear caches, etc.
  },
  // Signals to listen for (default: ['SIGINT', 'SIGTERM'])
  signals: ['SIGINT', 'SIGTERM'],
  // Timeout in milliseconds (default: 10000)
  timeout: 15000,
});

server.listen(3000);
```

### Manual Shutdown

```typescript
import { createServer } from 'node:http';
import { gracefulShutdown } from 'server.close';

const server = createServer((req, res) => {
  res.end('Hello World');
});

// Get the shutdown function for manual invocation
const shutdown = gracefulShutdown(server);

server.listen(3000);

// Manually trigger shutdown when needed
await shutdown();
```

### With HTTP2

```typescript
import { createSecureServer } from 'node:http2';
import { readFileSync } from 'node:fs';
import { gracefulShutdown } from 'server.close';

const server = createSecureServer({
  key: readFileSync('server-key.pem'),
  cert: readFileSync('server-cert.pem'),
});

gracefulShutdown(server, {
  timeout: 20000,
});

server.listen(3000);
```

## API

### `gracefulShutdown(server, options?)`

Sets up graceful shutdown for the server.

#### Parameters

- `server`: `Server | Http2Server | Http2SecureServer` - Node.js HTTP or HTTP2 server instance
- `options?`: `Options` - Optional configuration

#### Options

| Option       | Type                                         | Default                 | Description                                 |
| ------------ | -------------------------------------------- | ----------------------- | ------------------------------------------- |
| `onShutdown` | `(signal?: string) => Promise<void> \| void` | `undefined`             | Callback to execute before server shutdown  |
| `signals`    | `string[]`                                   | `['SIGINT', 'SIGTERM']` | List of signals to listen for               |
| `timeout`    | `number`                                     | `10000`                 | Time to wait before forced shutdown (in ms) |

#### Returns

`(signal?: string) => Promise<void>` - Function to manually trigger shutdown

## How It Works

1. **Signal Detection**: Listens for specified signals (SIGINT, SIGTERM, etc.)
2. **Reject New Connections**: Sets `Connection: close` header for new requests
3. **Handle Active Connections**: Sets `Connection: close` header for in-flight requests
4. **Start Server Closure**: Stops accepting new connections and waits for existing ones to complete
5. **Timeout**: Forces shutdown if all connections don't close within the configured time
6. **Cleanup**: Executes the `onShutdown` callback
7. **Process Exit**: Safely terminates the process
