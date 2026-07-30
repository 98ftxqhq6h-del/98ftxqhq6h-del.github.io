#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const command = args[0];

if (command === 'setup') {
  const child = spawn('node', [path.join(__dirname, 'setup.js')], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code || 0));
} else {
  // Default action: start daemon
  console.log("🦞 Pinching the system awake... Starting Lobby Daemon...");
  const child = spawn('node', [path.join(__dirname, '../src/daemon.js')], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code || 0));
}
