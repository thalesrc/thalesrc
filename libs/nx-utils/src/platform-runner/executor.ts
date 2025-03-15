import { PromiseExecutor, logger } from '@nx/devkit';
import { PlatformRunnerExecutorSchema } from './schema';
import { exec } from 'child_process';

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

  exec(script, (error, stdout, stderr) => {
    if (error) {
      logger.error(error);

      return;
    }

    if (stderr) {
      logger.error(stderr);
    }

    if (stdout) {
      logger.log(stdout);
    }
  });

  return {
    success: true,
  };
};

export default runExecutor;
