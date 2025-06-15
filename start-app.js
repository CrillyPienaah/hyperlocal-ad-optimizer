#!/usr/bin/env node

import { spawn } from 'child_process';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting Hyperlocal Ad Optimizer...');

// Ensure production files are ready
const distDir = './dist';
const distPublicDir = './dist/public';

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir);
}

// Copy client files to production directory
if (fs.existsSync('./client/dist/index.html')) {
  console.log('Copying HTML interface to production...');
  execSync('cp -r client/dist/* dist/public/', { stdio: 'inherit' });
} else {
  console.log('Client files not found, creating production build...');
}

// Build server
console.log('Building server...');
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

// Start the production server
console.log('Starting production server...');
process.env.NODE_ENV = 'production';
const server = spawn('node', ['dist/index.js'], { stdio: 'inherit' });

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.kill('SIGTERM');
});