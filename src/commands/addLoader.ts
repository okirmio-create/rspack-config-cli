import { Command } from 'commander';
import { getLoaderSnippet, LoaderType } from '../templates/loaders.js';
import { fileExists } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const VALID_TYPES: LoaderType[] = ['css', 'sass', 'less', 'postcss', 'svg', 'image', 'font', 'wasm'];

export function registerAddLoader(program: Command): void {
  program
    .command('add-loader <type>')
    .description('Add a loader configuration snippet to rspack.config.ts')
    .action((type: string) => {
      if (!VALID_TYPES.includes(type as LoaderType)) {
        logger.error(`Unknown loader type: "${type}"`);
        logger.dim(`Valid types: ${VALID_TYPES.join(', ')}`);
        process.exit(1);
      }

      const snippet = getLoaderSnippet(type as LoaderType);
      const configFile = 'rspack.config.ts';

      if (!fileExists(configFile)) {
        logger.warn(`${configFile} not found. Generating a standalone loader snippet instead.`);
        logger.heading(`\n// Add this rule to your module.rules array:`);
        console.log(snippet);
        return;
      }

      const filepath = resolve(process.cwd(), configFile);
      const existing = readFileSync(filepath, 'utf-8');

      // Inject before last closing `}` of module.rules or at end
      const loaderComment = `\n// --- Added by rspack-config-cli: ${type} loader ---\n// Add the following rule to your module.rules array:\n/*\n${snippet}\n*/\n`;
      writeFileSync(filepath, existing + loaderComment, 'utf-8');

      logger.success(`Added ${type} loader snippet to ${configFile}`);
      logger.dim('Move the rule from the comment into your module.rules array.');

      const hints: Partial<Record<LoaderType, string>> = {
        sass: 'npm install -D sass sass-loader css-loader style-loader',
        less: 'npm install -D less less-loader css-loader style-loader',
        postcss: 'npm install -D postcss postcss-loader postcss-preset-env css-loader style-loader',
        svg: 'npm install -D @svgr/webpack',
        wasm: '# No extra packages needed — asyncWebAssembly is a built-in experiment',
      };
      const hint = hints[type as LoaderType];
      if (hint) logger.info(`Install deps: ${hint}`);
    });
}
