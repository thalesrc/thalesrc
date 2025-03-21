import { ExecutorContext } from '@nx/devkit';

import { RunForEachExecutorSchema } from './schema';
import executor from './executor';

const options: RunForEachExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('RunForEach Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
