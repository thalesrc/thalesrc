#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { ensureDir } = require('@thalesrc/node-utils');

// Parse command-line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <path>')
  .demandCommand(1, 'You need to specify a path')
  .argv;

const path = argv._[0];

ensureDir(path).catch((err) => {
  console.error(err);
  process.exit(1);
});
