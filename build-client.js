#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building client for production deployment...');

// Ensure dist/public directory exists
const distPublicPath = './dist/public';
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist');
}
if (!fs.existsSync(distPublicPath)) {
  fs.mkdirSync(distPublicPath);
}

// Copy client dist files to production location
console.log('Copying client files to production directory...');
execSync('cp -r client/dist/* dist/public/', { stdio: 'inherit' });

console.log('Client build complete!');