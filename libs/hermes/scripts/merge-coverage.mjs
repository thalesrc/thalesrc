#!/usr/bin/env node
/**
 * Script to merge coverage reports from all submodules
 * This ensures we have a unified coverage report across all test suites
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const coverageDir = path.join(process.cwd(), 'coverage/libs/hermes');
const submodules = ['core', 'worker', 'chrome', 'broadcast', 'iframe'];

console.log('📊 Merging coverage reports for Hermes library...\n');

// Check which submodule coverage reports exist
const existingReports = submodules.filter(submodule => {
  const reportDir = path.join(coverageDir, submodule);
  return fs.existsSync(reportDir);
});

if (existingReports.length === 0) {
  console.log('❌ No coverage reports found. Run tests first.');
  process.exit(1);
}

console.log(`✅ Found ${existingReports.length} coverage report(s):`);
existingReports.forEach(report => console.log(`   - ${report}`));
console.log();

// Create merged directory
const mergedDir = path.join(coverageDir, 'merged');
if (fs.existsSync(mergedDir)) {
  fs.rmSync(mergedDir, { recursive: true, force: true });
}
fs.mkdirSync(mergedDir, { recursive: true });

// Copy all coverage files to merged directory
existingReports.forEach(submodule => {
  const sourceDir = path.join(coverageDir, submodule);
  console.log(`📦 Processing ${submodule} coverage...`);

  // Copy coverage files
  const files = fs.readdirSync(sourceDir);
  files.forEach(file => {
    if (file.endsWith('.json') || file === 'coverage-final.json') {
      const source = path.join(sourceDir, file);
      const dest = path.join(mergedDir, `${submodule}-${file}`);
      fs.copyFileSync(source, dest);
    }
  });
});

console.log('\n✅ Coverage reports merged successfully!');
console.log(`📁 Merged reports location: ${mergedDir}`);
console.log('\nYou can now upload the merged coverage to your preferred platform.');
