import { Command } from 'commander';
import { getInitTemplate, InitType } from '../templates/init.js';
import { writeConfig } from '../utils/fs.js';
import { logger } from '../utils/logger.js';

const VALID_TYPES: InitType[] = ['react', 'vue', 'svelte', 'vanilla', 'library', 'node'];

export function registerInit(program: Command): void {
  program
    .command('init <type>')
    .description('Generate rspack.config.ts for a project type')
    .action((type: string) => {
      if (!VALID_TYPES.includes(type as InitType)) {
        logger.error(`Unknown type: "${type}"`);
        logger.dim(`Valid types: ${VALID_TYPES.join(', ')}`);
        process.exit(1);
      }
      const content = getInitTemplate(type as InitType);
      writeConfig('rspack.config.ts', content);
      logger.dim(`Generated rspack.config.ts for "${type}" project`);
      logger.info('Install @rspack/core to get started: npm install -D @rspack/core @rspack/cli');
    });
}
