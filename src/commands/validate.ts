import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateConfig(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for export default
  if (!content.includes('export default')) {
    errors.push('Missing "export default" — config must export a default value');
  }

  // Check for entry point
  if (!content.includes('entry:')) {
    errors.push('Missing "entry" — every rspack config requires an entry point');
  }

  // Check for output
  if (!content.includes('output:')) {
    warnings.push('Missing "output" — rspack will use defaults (dist/ folder)');
  }

  // Check for shebang in config (common mistake)
  if (content.startsWith('#!/')) {
    errors.push('Shebang found at top of config — remove it (shebang belongs in CLI entry only)');
  }

  // Check for obsolete webpack-only plugins
  const obsoletePlugins = ['HardSourceWebpackPlugin', 'SpeedMeasurePlugin'];
  for (const plugin of obsoletePlugins) {
    if (content.includes(plugin)) {
      warnings.push(`"${plugin}" is not supported in rspack — remove it`);
    }
  }

  // Check for file-loader / url-loader (deprecated, use asset modules)
  if (content.includes("'file-loader'") || content.includes('"file-loader"')) {
    warnings.push('"file-loader" is deprecated — use Asset Modules: type: "asset/resource"');
  }
  if (content.includes("'url-loader'") || content.includes('"url-loader"')) {
    warnings.push('"url-loader" is deprecated — use Asset Modules: type: "asset"');
  }

  // Check for babel-loader (works but swc is preferred)
  if (content.includes("'babel-loader'") || content.includes('"babel-loader"')) {
    warnings.push('"babel-loader" works but consider switching to "builtin:swc-loader" for better performance');
  }

  // Check for TypeScript type import
  if (!content.includes('Configuration') && !content.includes(': Configuration')) {
    warnings.push('No Configuration type import found — add "import { Configuration } from \'@rspack/core\'" for type safety');
  }

  // Check for clean: true in output (good practice)
  if (content.includes('output:') && !content.includes('clean: true') && !content.includes('clean:true')) {
    warnings.push('Consider adding "clean: true" to output to clean dist before each build');
  }

  // Check for mode
  if (!content.includes('mode:') && !content.includes("process.env['NODE_ENV']") && !content.includes('process.env.NODE_ENV')) {
    warnings.push('No "mode" set — consider setting mode or deriving it from NODE_ENV');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function registerValidate(program: Command): void {
  program
    .command('validate [file]')
    .description('Validate rspack configuration file')
    .action((file?: string) => {
      const configFile = file || 'rspack.config.ts';
      const filepath = resolve(process.cwd(), configFile);

      if (!existsSync(filepath)) {
        logger.error(`Config file not found: ${configFile}`);
        logger.dim('Run "rspack-config init <type>" to create one.');
        process.exit(1);
      }

      const content = readFileSync(filepath, 'utf-8');
      logger.info(`Validating ${configFile}...`);

      const result = validateConfig(content);

      if (result.errors.length > 0) {
        logger.heading('\nErrors:');
        for (const err of result.errors) {
          logger.error(`  ${err}`);
        }
      }

      if (result.warnings.length > 0) {
        logger.heading('\nWarnings:');
        for (const warn of result.warnings) {
          logger.warn(`  ${warn}`);
        }
      }

      if (result.valid) {
        logger.success(`\n${configFile} is valid`);
        if (result.warnings.length > 0) {
          logger.dim(`  ${result.warnings.length} warning(s) — review above`);
        }
      } else {
        logger.error(`\n${configFile} has ${result.errors.length} error(s)`);
        process.exit(1);
      }
    });
}
