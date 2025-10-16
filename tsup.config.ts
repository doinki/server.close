import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/**/*.ts'],
  env: {
    NODE_ENV: 'production',
  },
  minifyIdentifiers: true,
  minifyWhitespace: true,
  format: ['cjs', 'esm'],
  esbuildOptions: (options) => {
    options.sourcemap = true;
  },
  target: 'node19',
  treeshake: true,
});
