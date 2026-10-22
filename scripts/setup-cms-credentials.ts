#!/usr/bin/env tsx

/**
 * Operator-only entry. Tests import ./utils/cmsCredentials, never this env loader.
 * pnpm exec tsx scripts/setup-cms-credentials.ts --create|--update|--reset|--delete
 * Stop legacy deployments before using this tool after the credential migration.
 */
import * as readline from 'node:readline';
import { resolve } from 'node:path';
import { createClient } from 'next-sanity';
import dotenv from 'dotenv';
import {
  CredentialSetupError,
  isCredentialSetupMode,
  runCredentialSetup,
} from './utils/cmsCredentials';

async function main() {
  // Only explicitly running the operator entry loads local deployment secrets.
  const loaded = dotenv.config({
    path: resolve(process.cwd(), '.env.local'),
    quiet: true,
  });
  if (loaded.error)
    throw new CredentialSetupError(
      'Unable to load the local operator environment.'
    );
  const {
    NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
    NEXT_PUBLIC_SANITY_DATASET: dataset,
    NEXT_PUBLIC_SANITY_API_VERSION: apiVersion,
    SANITY_API_TOKEN: token,
  } = process.env;
  if (!projectId || !dataset || !token?.trim()) {
    throw new CredentialSetupError(
      'Project, dataset and server API token are required.'
    );
  }
  const mode = process.argv[2] ?? '--create';
  if (!isCredentialSetupMode(mode)) {
    throw new CredentialSetupError(
      'Use --create, --update, --reset or --delete.'
    );
  }
  const client = createClient({
    projectId,
    dataset,
    apiVersion: apiVersion || '2025-08-12',
    token,
    useCdn: false,
    perspective: 'raw',
  });
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    // OS echo handles ordinary input; readline must not echo raw password keys.
    terminal: false,
  });
  const question = (prompt: string) =>
    new Promise<string>((resolve) => rl.question(prompt, resolve));
  const hidden = (prompt: string) =>
    new Promise<string>((resolve, reject) => {
      if (!process.stdin.isTTY) {
        reject(
          new CredentialSetupError(
            'Password prompts require an interactive terminal.'
          )
        );
        return;
      }
      rl.pause();
      process.stdout.write(prompt);
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      let input = '';
      const finish = () => {
        process.stdin.off('data', onData);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        rl.resume();
      };
      const onData = (chunk: string) => {
        for (const char of chunk.toString()) {
          if (['\n', '\r', '\u0004'].includes(char)) {
            finish();
            resolve(input);
            return;
          }
          if (char === '\u0003') {
            finish();
            reject(new CredentialSetupError('Cancelled.'));
            return;
          }
          if (char === '\u007f' || char === '\b') input = input.slice(0, -1);
          else input += char;
        }
      };
      process.stdin.on('data', onData);
    });
  try {
    await runCredentialSetup(client, mode, {
      question,
      hidden,
      log: (message) => console.log(message),
    });
  } finally {
    if (process.stdin.isTTY && process.stdin.isRaw)
      process.stdin.setRawMode(false);
    rl.close();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof CredentialSetupError
      ? error.message
      : 'Credential setup failed.'
  );
  process.exitCode = 1;
});
