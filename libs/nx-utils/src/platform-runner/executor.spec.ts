import { ExecutorContext } from '@nx/devkit';

import { PlatformRunnerExecutorSchema } from './schema';
import executor from './executor';

const options: PlatformRunnerExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('PlatformRunner Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
