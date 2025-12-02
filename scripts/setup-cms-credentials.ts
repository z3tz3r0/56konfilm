#!/usr/bin/env tsx

/**
 * Setup script for CMS credentials
 *
 * Usage:
 *   npx tsx scripts/setup-cms-credentials.ts --create   # Create new credentials
 *   npx tsx scripts/setup-cms-credentials.ts --delete    # Delete credentials
 *   npx tsx scripts/setup-cms-credentials.ts --reset     # Reset (delete + create)
 *   npx tsx scripts/setup-cms-credentials.ts --update   # Update credentials
 */

import * as readline from 'readline';
import { createClient } from 'next-sanity';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from project root
const envPath = resolve(process.cwd(), '.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Error loading .env file from: ${envPath}`);
  console.error(`   Error: ${result.error.message}`);
  process.exit(1);
}

// Debug: Check if env vars are loaded
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not set');
  console.error(`   .env file path: ${envPath}`);
  console.error('   Make sure .env file exists in project root');
  process.exit(1);
}

const SALT_ROUNDS = 12;
const DOCUMENT_ID = 'cms-credentials';

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-12',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published',
});

if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ Error: SANITY_API_TOKEN is not set in .env file');
  console.error(
    'Please create a write token in Sanity Dashboard and add it to .env'
  );
  process.exit(1);
}

// Readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let input = '';
    process.stdin.on('data', (char: string) => {
      char = char.toString();

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(input);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f':
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          input += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createCredentials() {
  console.log('\n📝 Creating new CMS credentials...\n');

  const username = await question('Username: ');
  if (!username.trim()) {
    console.error('❌ Username is required');
    rl.close();
    process.exit(1);
  }

  const password = await questionHidden('Password: ');
  if (!password.trim()) {
    console.error('❌ Password is required');
    rl.close();
    process.exit(1);
  }

  const confirmPassword = await questionHidden('Confirm Password: ');
  if (password !== confirmPassword) {
    console.error('❌ Passwords do not match');
    rl.close();
    process.exit(1);
  }

  // Check if document already exists
  const existing = await client.fetch(`*[_id == "${DOCUMENT_ID}"][0]`);
  if (existing) {
    const overwrite = await question(
      '\n⚠️  Credentials already exist. Overwrite? (y/N): '
    );
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      rl.close();
      process.exit(0);
    }
  }

  // Hash password
  console.log('\n🔐 Hashing password...');
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create/update document
  try {
    await client
      .transaction()
      .createOrReplace({
        _id: DOCUMENT_ID,
        _type: 'cmsCredentials',
        username: username.trim(),
        password: passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    console.log('✅ Credentials created successfully!');
    console.log(`   Username: ${username.trim()}`);
  } catch (error) {
    console.error('❌ Error creating credentials:', error);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

async function deleteCredentials() {
  console.log('\n🗑️  Deleting CMS credentials...\n');

  const existing = await client.fetch(`*[_id == "${DOCUMENT_ID}"][0]`);
  if (!existing) {
    console.log('ℹ️  No credentials found to delete');
    rl.close();
    process.exit(0);
  }

  const confirm = await question(
    `⚠️  Are you sure you want to delete credentials for "${existing.username}"? (y/N): `
  );

  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled');
    rl.close();
    process.exit(0);
  }

  try {
    await client.delete(DOCUMENT_ID);
    console.log('✅ Credentials deleted successfully!');
  } catch (error) {
    console.error('❌ Error deleting credentials:', error);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

async function resetCredentials() {
  console.log('\n🔄 Resetting CMS credentials...\n');

  // Delete existing
  const existing = await client.fetch(`*[_id == "${DOCUMENT_ID}"][0]`);
  if (existing) {
    console.log(`Found existing credentials for "${existing.username}"`);
    try {
      await client.delete(DOCUMENT_ID);
      console.log('✅ Deleted existing credentials');
    } catch (error) {
      console.error('❌ Error deleting existing credentials:', error);
      rl.close();
      process.exit(1);
    }
  }

  // Create new
  await createCredentials();
}

async function updateCredentials() {
  console.log('\n✏️  Updating CMS credentials...\n');

  const existing = await client.fetch(`*[_id == "${DOCUMENT_ID}"][0]`);
  if (!existing) {
    console.log(
      '❌ No credentials found. Use --create to create new credentials.'
    );
    rl.close();
    process.exit(1);
  }

  console.log(`Current username: ${existing.username}`);

  const currentPassword = await questionHidden('Current Password: ');
  if (!currentPassword.trim()) {
    console.error('❌ Current password is required');
    rl.close();
    process.exit(1);
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, existing.password);
  if (!isValid) {
    console.error('❌ Current password is incorrect');
    rl.close();
    process.exit(1);
  }

  const updateUsername = await question(
    `Update username? (current: ${existing.username}) (y/N): `
  );

  let newUsername = existing.username;
  if (updateUsername.toLowerCase() === 'y') {
    const usernameInput = await question('New Username: ');
    if (usernameInput.trim()) {
      newUsername = usernameInput.trim();
    }
  }

  const updatePassword = await question('Update password? (y/N): ');

  let newPasswordHash = existing.password;
  if (updatePassword.toLowerCase() === 'y') {
    const newPassword = await questionHidden('New Password: ');
    if (!newPassword.trim()) {
      console.error('❌ New password is required');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await questionHidden('Confirm New Password: ');
    if (newPassword !== confirmPassword) {
      console.error('❌ Passwords do not match');
      rl.close();
      process.exit(1);
    }

    newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  try {
    await client
      .patch(DOCUMENT_ID)
      .set({
        username: newUsername,
        password: newPasswordHash,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    console.log('✅ Credentials updated successfully!');
    console.log(`   Username: ${newUsername}`);
  } catch (error) {
    console.error('❌ Error updating credentials:', error);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--create';

  try {
    switch (mode) {
      case '--create':
        await createCredentials();
        break;
      case '--delete':
        await deleteCredentials();
        break;
      case '--reset':
        await resetCredentials();
        break;
      case '--update':
        await updateCredentials();
        break;
      default:
        console.error(`❌ Unknown mode: ${mode}`);
        console.log('\nUsage:');
        console.log('  npx tsx scripts/setup-cms-credentials.ts --create');
        console.log('  npx tsx scripts/setup-cms-credentials.ts --delete');
        console.log('  npx tsx scripts/setup-cms-credentials.ts --reset');
        console.log('  npx tsx scripts/setup-cms-credentials.ts --update');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
    process.exit(1);
  }
}

main();
