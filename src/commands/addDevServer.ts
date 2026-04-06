import { Command } from 'commander';
import { fileExists } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const DEV_SERVER_SNIPPET = `
// Dev Server Configuration
// Add this to your rspack.config.ts Configuration object:
/*
  devServer: {
    port: 3000,
    host: 'localhost',
    hot: true,
    open: true,
    compress: true,
    historyApiFallback: true,
    static: {
      directory: path.join(process.cwd(), 'public'),
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    ],
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
*/
`;

export function registerAddDevServer(program: Command): void {
  program
    .command('add-dev-server')
    .description('Generate dev server configuration snippet')
    .action(() => {
      const configFile = 'rspack.config.ts';

      if (!fileExists(configFile)) {
        logger.warn(`${configFile} not found. Showing standalone snippet:`);
        console.log(DEV_SERVER_SNIPPET);
        return;
      }

      const filepath = resolve(process.cwd(), configFile);
      const existing = readFileSync(filepath, 'utf-8');
      writeFileSync(filepath, existing + DEV_SERVER_SNIPPET, 'utf-8');

      logger.success(`Added devServer snippet to ${configFile}`);
      logger.dim('Move the devServer block into your Configuration object.');
      logger.info('Install: npm install -D @rspack/dev-server webpack-dev-server');
    });
}
