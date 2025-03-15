import { PromiseExecutor, logger } from '@nx/devkit';
import { PlatformRunnerExecutorSchema } from './schema';
import { exec } from 'child_process';
import { promisify } from 'util';

const runExecutor: PromiseExecutor<PlatformRunnerExecutorSchema> = async (
  options
) => {
  const platform = process.platform;
  const aliases = {
    ...options.default,
    ...(options[platform] || {}),
  };
  const script = Object.entries(aliases).reduce(
    (acc, [key, value]) => acc.replace(`<<${key}>>`, value.toString()),
    options.script
  );

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
