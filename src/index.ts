import type {
  IncomingMessage,
  RequestListener,
  Server,
  ServerResponse,
} from 'node:http';
import type { Http2SecureServer, Http2Server } from 'node:http2';
import type { Socket } from 'node:net';

export type ServerType = Server | Http2Server | Http2SecureServer;

export interface Options {
  onShutdown?: (signal?: string) => Promise<void> | void;
  signals?: string[];
  timeout?: number;
}

interface SocketWithResponse extends Socket {
  _httpMessage?: ServerResponse;
}

export function gracefulShutdown(
  server: ServerType,
  {
    onShutdown,
    signals = ['SIGINT', 'SIGTERM'],
    timeout = 10000,
  }: Options = {},
) {
  let shuttingDown = false;

  const activeSockets = new Set<SocketWithResponse>();

  async function shutdown(signal?: string): Promise<void> {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    try {
      const closePromise = closeServer(server);

      for (const socket of activeSockets) {
        if (socket._httpMessage) {
          setConnectionCloseHeader(socket._httpMessage);
        }
      }

      await Promise.race([closePromise, wait(timeout)]);

      await onShutdown?.(signal);

      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  server.on('request', ((_, res) => {
    if (shuttingDown) {
      setConnectionCloseHeader(res);
    }
  }) as RequestListener<typeof IncomingMessage, typeof ServerResponse>);

  const handleConnection = (socket: SocketWithResponse): void => {
    activeSockets.add(socket);

    socket.once('close', () => {
      activeSockets.delete(socket);
    });
  };

  server.on('connection', handleConnection);
  server.on('secureConnection', handleConnection);

  for (const signal of signals) {
    process.on(signal, () => shutdown(signal));
  }

  return shutdown;
}

function closeServer(server: ServerType): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function setConnectionCloseHeader(res: ServerResponse): void {
  if (!res.headersSent) {
    res.setHeader('Connection', 'close');
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
