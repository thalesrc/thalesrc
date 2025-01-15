import { ExecutorContext } from '@nx/devkit';

import { WatchExecutorSchema } from './schema';
import executor from './executor';

const options: WatchExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('Watch Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
