import { PromiseExecutor, logger } from '@nx/devkit';
import { globSync } from 'glob';
import { RunForEachExecutorSchema } from './schema';
import { globCommandParser } from '../watch/glob-command-parser';
import { chain } from '@thalesrc/js-utils';
import { platformScriptReplacer } from '../platform-runner/platform-script-replacer';
import { promisifiedSpawn } from '../utils/promisified-spawn';

const runExecutor: PromiseExecutor<RunForEachExecutorSchema> = async (
  { command, items, glob: globPattern, parallel = true, platformVariables = null },
) => {
  if (!items && !globPattern) {
    throw new Error('Either items or glob must be provided');
  }

  if (items && globPattern) {
    throw new Error('Only one of items or glob must be provided');
  }

  const scripts = items ? items.map((item) => command.replace(/<item>/ig, item)) : globSync(globPattern).map((file) => globCommandParser(command, file));
  const platformBasedScripts = !platformVariables ? scripts : scripts.map((script) => platformScriptReplacer({ ...platformVariables, script }));

  logger.info(`Running scripts: ${platformBasedScripts.map((script) => `\n${script}`).join('')}`);

  if (parallel) {
    await Promise.all(platformBasedScripts.map((script) => promisifiedSpawn(script)));
  } else {
    await chain(platformBasedScripts.map((script) => () => promisifiedSpawn(script)));
  }

  logger.info('All scripts have been executed');

  return {
    success: true,
  };
};

export default runExecutor;
