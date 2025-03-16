import { PromiseExecutor, logger } from '@nx/devkit';
import { globSync } from 'glob';
import { RunForEachExecutorSchema } from './schema';
import { globCommandParser } from '../watch/glob-command-parser';
import { promisifiedExec } from '../utils/promisified-exec';
import { chain } from '@thalesrc/js-utils';

const runExecutor: PromiseExecutor<RunForEachExecutorSchema> = async (
  { command, items, glob: globPattern, parallel = true }
) => {
  if (!items && !globPattern) {
    throw new Error('Either items or glob must be provided');
  }

  if (items && globPattern) {
    throw new Error('Only one of items or glob must be provided');
  }

  const scripts = items ? items.map((item) => command.replace(/<item>/ig, item)) : globSync(globPattern).map((file) => globCommandParser(command, file));

  logger.info(`Running scripts: ${scripts.map((script) => `\n${script}`).join('')}`);

  if (parallel) {
    await Promise.all(scripts.map((script) => promisifiedExec(script)));
  } else {
    await chain(scripts.map((script) => () => promisifiedExec(script)));
  }

  logger.info('All scripts have been executed');

  return {
    success: true,
  };
};

export default runExecutor;
