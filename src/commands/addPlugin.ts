import { Command } from 'commander';
import { getPluginSnippet, PluginName } from '../templates/plugins.js';
import { fileExists } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const VALID_PLUGINS: PluginName[] = ['html', 'copy', 'define', 'progress', 'bundle-analyzer', 'mini-css-extract'];

export function registerAddPlugin(program: Command): void {
  program
    .command('add-plugin <name>')
    .description('Add a plugin configuration snippet to rspack.config.ts')
    .action((name: string) => {
      if (!VALID_PLUGINS.includes(name as PluginName)) {
        logger.error(`Unknown plugin: "${name}"`);
        logger.dim(`Valid plugins: ${VALID_PLUGINS.join(', ')}`);
        process.exit(1);
      }

      const { imports, plugin } = getPluginSnippet(name as PluginName);
      const configFile = 'rspack.config.ts';

      if (!fileExists(configFile)) {
        logger.warn(`${configFile} not found. Showing standalone snippet:`);
        logger.heading('\n// Import:');
        console.log(imports);
        logger.heading('\n// Plugin instance (add to plugins array):');
        console.log(plugin);
        return;
      }

      const filepath = resolve(process.cwd(), configFile);
      const existing = readFileSync(filepath, 'utf-8');
      const snippet = `\n// --- Added by rspack-config-cli: ${name} plugin ---\n// 1. Add this import at the top of your config:\n// ${imports}\n// 2. Add to plugins array:\n/*\n${plugin}\n*/\n`;
      writeFileSync(filepath, existing + snippet, 'utf-8');

      logger.success(`Added ${name} plugin snippet to ${configFile}`);
      logger.dim('Move the import and plugin instance into their correct positions.');

      const hints: Partial<Record<PluginName, string>> = {
        html: 'npm install -D html-webpack-plugin',
        copy: 'npm install -D copy-webpack-plugin',
        'bundle-analyzer': 'npm install -D webpack-bundle-analyzer',
        'mini-css-extract': 'npm install -D mini-css-extract-plugin',
      };
      const hint = hints[name as PluginName];
      if (hint) logger.info(`Install deps: ${hint}`);
    });
}
