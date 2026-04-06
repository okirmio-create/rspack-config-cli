import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { logger } from './logger.js';

export function writeConfig(filename: string, content: string): void {
  const filepath = resolve(process.cwd(), filename);
  if (existsSync(filepath)) {
    logger.warn(`${filename} already exists. Overwriting...`);
  }
  writeFileSync(filepath, content, 'utf-8');
  logger.success(`Created ${filename}`);
}

export function appendToConfig(filename: string, content: string): void {
  const filepath = resolve(process.cwd(), filename);
  if (!existsSync(filepath)) {
    logger.error(`${filename} not found. Run 'rspack-config init' first.`);
    process.exit(1);
  }
  const existing = readFileSync(filepath, 'utf-8');
  writeFileSync(filepath, existing + '\n' + content, 'utf-8');
  logger.success(`Updated ${filename}`);
}

export function readConfig(filename: string): string {
  const filepath = resolve(process.cwd(), filename);
  if (!existsSync(filepath)) {
    logger.error(`${filename} not found.`);
    process.exit(1);
  }
  return readFileSync(filepath, 'utf-8');
}

export function fileExists(filename: string): boolean {
  return existsSync(resolve(process.cwd(), filename));
}
