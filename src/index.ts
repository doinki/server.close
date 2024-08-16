export interface Options {
  onShutdown?: (signal?: string) => Promise<void> | void;
  signals?: string[];
  timeout?: number;
}

export function gracefulShutdown(
  server: any,
  {
    onShutdown,
    signals = ['SIGINT', 'SIGTERM'],
    timeout = 10000,
  }: Options = {},
) {
  let isShuttingDown = false;
  let connections = new Set();
  let secureConnections = new Set();

  async function shutdown() {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    try {
      connections.forEach((socket) => {
        // @ts-ignore
        setHeader(null, socket._httpMessage);
      });
      secureConnections.forEach((socket) => {
        // @ts-ignore
        setHeader(null, socket._httpMessage);
      });

      await Promise.race([close(server), delay(timeout)]);
      await onShutdown?.();

      process.exit(0);
    } catch (error) {
      console.error(error);

      process.exit(1);
    }
  }

  // @ts-ignore
  server.on('request', setHeader);

  // @ts-ignore
  server.on('connection', (socket) => {
    connections.add(socket);

    socket.on('close', () => {
      connections.delete(socket);
    });
  });
  // @ts-ignore
  server.on('secureConnection', (socket) => {
    secureConnections.add(socket);

    socket.on('close', () => {
      secureConnections.delete(socket);
    });
  });

  for (let i = 0; i < signals.length; ++i) {
    let signal = signals[i];

    process.on(signal, shutdown);
  }

  return shutdown;
}

function close(server: any): Promise<void> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    server.close((error) => {
      return error ? reject(error) : resolve();
    });
  });
}

function setHeader(req: any, res: any): void {
  if (res && !res.headersSent) {
    res.setHeader('Connection', 'close');
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
