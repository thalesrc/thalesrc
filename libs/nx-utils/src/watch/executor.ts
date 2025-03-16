import { logger, PromiseExecutor } from '@nx/devkit';
import { WatchExecutorSchema } from './schema';
// @ts-expect-error - no types available
import * as watch from 'glob-watcher';
import { never } from '@thalesrc/js-utils/promise/never';
import { exec, ExecException } from 'child_process';
import { arrayize } from '@thalesrc/js-utils/array/arrayize';
import { platformScriptReplacer } from '../platform-runner/platform-script-replacer';

function handleCommandEvents(error: ExecException, stdout: string, stderr: string) {
  if (error) {
    logger.error(error);
  }

  if (stdout) {
    logger.log(stdout);
  }

  if (stderr) {
    logger.error(stderr);
  }
}

const runExecutor: PromiseExecutor<WatchExecutorSchema> = async ({ glob, command, platformVariables = null }) => {
  const commands = arrayize(command);
  const watcher = watch(glob);
  const platformBasedCommands = !platformVariables ? commands : commands.map(command => platformScriptReplacer({ ...platformVariables, script: command }));

  function handleChange(path: string) {
    const [fileName, fileExt] = path.split('/').pop().split('.');

    for (const cmd of platformBasedCommands) {
      const parsedCommand = cmd
        .replace(/<fileName>/ig, fileName)
        .replace(/<path>/ig, path)
        .replace(/<fileExt>/ig, fileExt);

      logger.info(`Running command: ${parsedCommand}`);

      exec(
        parsedCommand,
        handleCommandEvents
      );
    }
  }

  watcher.on('change', handleChange);
  watcher.on('add', handleChange);

  logger.info(`Watching ${glob.toString()} for changes`);

  await never();

  return {
    success: true
  };
};

export default runExecutor;
