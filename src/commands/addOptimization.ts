import { Command } from 'commander';
import { fileExists } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const OPTIMIZATION_SNIPPET = `
// Optimization Configuration
// Add this to your rspack.config.ts Configuration object:
/*
  optimization: {
    minimize: true,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      new rspack.LightningCssMinimizerRspackPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          test: /[\\\\/]node_modules[\\\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name: 'vendors',
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        // Framework chunk (e.g. React)
        framework: {
          test: /[\\\\/]node_modules[\\\\/](react|react-dom)[\\\\/]/,
          name: 'framework',
          priority: 10,
          chunks: 'all',
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
    // Tree shaking (enabled automatically in production mode)
    usedExports: true,
    sideEffects: true,
  },
*/
`;

export function registerAddOptimization(program: Command): void {
  program
    .command('add-optimization')
    .description('Generate optimization config: splitChunks, minimize, tree-shaking')
    .action(() => {
      const configFile = 'rspack.config.ts';

      if (!fileExists(configFile)) {
        logger.warn(`${configFile} not found. Showing standalone snippet:`);
        console.log(OPTIMIZATION_SNIPPET);
        return;
      }

      const filepath = resolve(process.cwd(), configFile);
      const existing = readFileSync(filepath, 'utf-8');
      writeFileSync(filepath, existing + OPTIMIZATION_SNIPPET, 'utf-8');

      logger.success(`Added optimization snippet to ${configFile}`);
      logger.dim('Move the optimization block into your Configuration object.');
      logger.dim('Tree shaking is automatic in production mode — ensure package.json has "sideEffects": false for your lib.');
    });
}
