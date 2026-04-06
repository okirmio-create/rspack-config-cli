import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';

function migrateContent(source: string): string {
  let out = source;

  // Replace webpack import with rspack
  out = out.replace(/require\(['"]webpack['"]\)/g, "require('@rspack/core')");
  out = out.replace(/from ['"]webpack['"]/g, "from '@rspack/core'");

  // Convert module.exports to export default + add type
  out = out.replace(/module\.exports\s*=\s*\{/, 'const config: Configuration = {');
  if (out.includes('const config: Configuration = {')) {
    out = out.replace(
      /^(const config: Configuration = \{)/m,
      "import { Configuration } from '@rspack/core';\nimport path from 'path';\n\n$1"
    );
    out = out + '\n\nexport default config;\n';
  }

  // Replace old webpack loaders with rspack built-in equivalents
  out = out.replace(
    /\{\s*loader:\s*['"]babel-loader['"]\s*,\s*options:\s*\{[\s\S]*?\}\s*\}/g,
    `{
      loader: 'builtin:swc-loader',
      options: {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    }`
  );

  // Replace ts-loader
  out = out.replace(
    /\{\s*loader:\s*['"]ts-loader['"]\s*(?:,\s*options:[^}]*\})?\s*\}/g,
    `{
      loader: 'builtin:swc-loader',
      options: {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
        },
      },
    }`
  );

  // Replace speed-measure-plugin references (not supported)
  out = out.replace(/const SpeedMeasurePlugin[\s\S]*?new SpeedMeasurePlugin\(\)[^\n]*\n/g, '');

  // Replace HardSourceWebpackPlugin (not needed, rspack has built-in caching)
  out = out.replace(/new HardSourceWebpackPlugin\(\)/g, '// HardSourceWebpackPlugin removed — rspack has built-in persistent caching');

  // Convert .js extension reference to .ts
  out = out.replace(/rspack\.config\.js/g, 'rspack.config.ts');

  // Add note about asset modules replacing file-loader/url-loader
  if (out.includes('file-loader') || out.includes('url-loader')) {
    out = `// NOTE: file-loader and url-loader are replaced by Asset Modules in rspack.\n// See: https://www.rspack.dev/guide/features/asset-module\n` + out;
    out = out.replace(/['"]file-loader['"]/g, '// "file-loader" → use type: "asset/resource"');
    out = out.replace(/['"]url-loader['"]/g, '// "url-loader" → use type: "asset"');
  }

  return out;
}

export function registerMigrateWebpack(program: Command): void {
  program
    .command('migrate-webpack <file>')
    .description('Convert webpack.config.js to rspack.config.ts')
    .action((file: string) => {
      const inputPath = resolve(process.cwd(), file);
      if (!existsSync(inputPath)) {
        logger.error(`File not found: ${file}`);
        process.exit(1);
      }

      const source = readFileSync(inputPath, 'utf-8');
      logger.info(`Migrating ${basename(file)} → rspack.config.ts`);

      const migrated = migrateContent(source);
      const outputPath = resolve(process.cwd(), 'rspack.config.ts');
      writeFileSync(outputPath, migrated, 'utf-8');

      logger.success(`Written to rspack.config.ts`);
      logger.warn('This is a best-effort migration. Review the output carefully:');
      logger.dim('  1. Check loader configurations — some webpack loaders have no rspack equivalent');
      logger.dim('  2. Verify plugin compatibility at https://www.rspack.dev/guide/compatibility/plugin');
      logger.dim('  3. babel-loader → replaced with builtin:swc-loader (faster)');
      logger.dim('  4. ts-loader → replaced with builtin:swc-loader');
      logger.dim('  5. file-loader/url-loader → replaced with Asset Modules');
      logger.info('Run: npm install -D @rspack/core @rspack/cli');
    });
}
