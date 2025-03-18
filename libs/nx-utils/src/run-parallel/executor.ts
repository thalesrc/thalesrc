import { spawn } from 'child_process';
import { PromiseExecutor, logger } from '@nx/devkit';
import { chain } from '@thalesrc/js-utils/promise/chain';
import { tryCatch } from '@thalesrc/js-utils/promise/try-catch';
import { arrayize } from '@thalesrc/js-utils/array/arrayize';
import { never } from '@thalesrc/js-utils/promise/never';
import chalk, { foregroundColorNames } from 'chalk';

import { RunParallelExecutorSchema } from './schema';

function replaceCommandString(command: string, aliases: Record<string, string>) {
  return Object.entries(aliases).reduce((command, [alias, value]) => command.replace(new RegExp(`<<${alias}>>`, 'g'), value), command);
}

const runExecutor: PromiseExecutor<RunParallelExecutorSchema> = async (
  { commands, cwd: defaultCwd, aliases = {} },
  { projectName, targetName, projectsConfigurations: { projects: { [projectName]: projectConfig } } }
) => {
  const logColor = foregroundColorNames[Math.floor(Math.random()*foregroundColorNames.length)];
  /**
   * Normalize the commands to have the same structure
   */
  const normalizedCommands = commands.map(cmd => typeof cmd === 'string' ? { command: cmd } : cmd);
  /**
   * Create the command functions
   */
  const cmds = normalizedCommands.map(({ command, cwd, readyWhen, stopWhenReady }) => () => new Promise<void>((resolve, reject) => {
    for (const cmd of arrayize(command)) {
      const [cmdName, ...cmdArgs] = replaceCommandString(cmd, aliases).split(' ');
      const child = spawn(cmdName, cmdArgs, { ...(!cwd || !defaultCwd ? null : { cwd: cwd ?? defaultCwd }) });

      child.on('error', (error) => {
        reject(error);
      });

      if (!readyWhen) resolve();

      const handleMessage = (data: Buffer | string) => {
        const str = data.toString();
        console.log(`[${chalk[logColor](`[${projectName}:${targetName}]`)}] ${str}`);

        if (readyWhen && arrayize(readyWhen).some(defining => str.includes(defining))) {
          if (stopWhenReady) {
            child.kill();
          }
          resolve();
        }
      };

      child.on('message', handleMessage);
      child.stdout.on('data', handleMessage);
      child.stdout.on('error', handleMessage);
      child.stdio[2].on('data', handleMessage);
      child.stdio[2].on('error', handleMessage);
      child.stderr.on('data', message => {
        logger.error(message.toString());
      });
    }
  }));
  /**
   * Run the commands
   */
  const [error] = await tryCatch(chain(cmds));

  /**
   * Handle the error
   */
  if (error) {
    logger.error(error);

    return {
      success: false,
    };
  }

  /**
   * If the last command is not readyWhen, wait forever
   */
  if (!normalizedCommands.at(-1).readyWhen) {
    await never();
  }

  return {
    success: true,
  };
};

export default runExecutor;
