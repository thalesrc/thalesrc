import { PromiseExecutor, logger } from '@nx/devkit';
import { chain } from '@thalesrc/js-utils/promise/chain';
import { tryCatch } from '@thalesrc/js-utils/promise/try-catch';
import { arrayize } from '@thalesrc/js-utils/array/arrayize';
import { never } from '@thalesrc/js-utils/promise/never';
import { RunParallelExecutorSchema } from './schema';
import { exec } from 'child_process';

const runExecutor: PromiseExecutor<RunParallelExecutorSchema> = async (
  { commands, cwd: defaultCwd },
  { projectName, projectsConfigurations: { projects: { [projectName]: projectConfig } } }
) => {
  const cmds = commands.map(({ command, cwd, readyWhen, stopWhenReady }) => () => new Promise<void>((resolve, reject) => {
    const child = exec(command, { ...(!cwd || !defaultCwd ? null : { cwd: cwd ?? defaultCwd }) }, (error) => {
      if (error) {
        reject(error);
      }
    });

    if (!readyWhen) resolve();

    child.stdout.on('data', (data) => {
      logger.log(data.toString());

      if (readyWhen && arrayize(readyWhen).some(defining => data.toString().includes(defining))) {
        if (stopWhenReady) {
          child.kill();
        }
        resolve();
      }
    });
  }));
  const [error] = await tryCatch(chain(cmds));

  if (error) {
    logger.error(error);

    return {
      success: false,
    };
  }

  if (!commands.at(-1).readyWhen) {
    await never();
  }

  return {
    success: true,
  };
};

export default runExecutor;
