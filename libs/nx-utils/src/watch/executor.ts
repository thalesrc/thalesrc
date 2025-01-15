import { PromiseExecutor } from '@nx/devkit';
import { WatchExecutorSchema } from './schema';
import * as watch from 'glob-watcher';
import { never } from '@thalesrc/js-utils/promise/never';
import { exec, ExecException } from 'child_process';
import { arrayize } from '@thalesrc/js-utils/array/arrayize';

function handleCommandEvents(error: ExecException, stdout: string, stderr: string) {
  if (error) {
    console.error(error);
  }

  if (stdout) {
    console.log(stdout);
  }

  if (stderr) {
    console.error(stderr);
  }
}

const runExecutor: PromiseExecutor<WatchExecutorSchema> = async ({ glob, command }) => {
  const commands = arrayize(command);

  for (const cmd of commands) {
    exec(cmd, handleCommandEvents);
  }

  watch(glob, async done => {
    for (const cmd of commands) {
      exec(cmd, handleCommandEvents);
    }

    done();
  });

  await never();

  return {
    success: true
  };
};

export default runExecutor;
