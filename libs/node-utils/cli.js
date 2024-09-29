#!/usr/bin/env node

const { ensureDirectory } = require('./src');

require('yargs').scriptName("nu")
  .usage('$0 <cmd> [args]')
  .command('ensure-dir [dir]', 'Ensure a directory exists, create otherwise', {
    dir: {
      describe: 'Directory to ensure exists',
      type: 'string',
      demandOption: true,
    }
  }, function ({dir}) {
    ensureDirectory(dir).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  })
  .help()
  .argv;
