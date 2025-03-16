import { PromiseExecutor, logger } from '@nx/devkit';
import { PlatformRunnerExecutorSchema } from './schema';
import { exec } from 'child_process';
import { promisify } from 'util';
import { platformScriptReplacer } from './platform-script-replacer';

const runExecutor: PromiseExecutor<PlatformRunnerExecutorSchema> = async (
  options
) => {
  const script = platformScriptReplacer(options);

  logger.info(`Running script: ${script}`);

  const promisifiedExec = promisify(exec);
  const { stderr, stdout } = await promisifiedExec(script);

  if (stderr) {
    logger.error(stderr);

    return {
      success: false,
    };
  }

  logger.info(stdout);

  return {
    success: true,
  };
};

export default runExecutor;
