import { Command } from 'commander';
import chalk from 'chalk';
import { registerInit } from './commands/init.js';
import { registerAddLoader } from './commands/addLoader.js';
import { registerAddPlugin } from './commands/addPlugin.js';
import { registerAddDevServer } from './commands/addDevServer.js';
import { registerAddOptimization } from './commands/addOptimization.js';
import { registerMigrateWebpack } from './commands/migrateWebpack.js';
import { registerValidate } from './commands/validate.js';

const program = new Command();

program
  .name('rspack-config')
  .description(chalk.cyan('Rspack configuration generator and manager'))
  .version('1.0.0');

registerInit(program);
registerAddLoader(program);
registerAddPlugin(program);
registerAddDevServer(program);
registerAddOptimization(program);
registerMigrateWebpack(program);
registerValidate(program);

program.addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.dim('Generate a React config:')}
  $ rspack-config init react

  ${chalk.dim('Add CSS loader:')}
  $ rspack-config add-loader css

  ${chalk.dim('Add HTML plugin:')}
  $ rspack-config add-plugin html

  ${chalk.dim('Add dev server config:')}
  $ rspack-config add-dev-server

  ${chalk.dim('Add optimization (splitChunks, tree-shaking):')}
  $ rspack-config add-optimization

  ${chalk.dim('Migrate from webpack:')}
  $ rspack-config migrate-webpack webpack.config.js

  ${chalk.dim('Validate config:')}
  $ rspack-config validate

${chalk.bold('Init types:')}    react | vue | svelte | vanilla | library | node
${chalk.bold('Loaders:')}       css | sass | less | postcss | svg | image | font | wasm
${chalk.bold('Plugins:')}       html | copy | define | progress | bundle-analyzer | mini-css-extract
`);

program.parse(process.argv);
