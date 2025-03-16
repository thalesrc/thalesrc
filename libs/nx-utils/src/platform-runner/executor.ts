import { PromiseExecutor, logger } from '@nx/devkit';
import { PlatformRunnerExecutorSchema } from './schema';
import { platformScriptReplacer } from './platform-script-replacer';
import { promisifiedExec } from '../utils/promisified-exec';

const runExecutor: PromiseExecutor<PlatformRunnerExecutorSchema> = async (
  options
) => {
  const script = platformScriptReplacer(options);

  logger.info(`Running script: ${script}`);

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
