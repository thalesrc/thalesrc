import { ExecutorContext } from '@nx/devkit';

import { RunParallelExecutorSchema } from './schema';
import executor from './executor';

const options: RunParallelExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('RunParallel Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
