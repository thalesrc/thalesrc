import { ExecutorContext } from '@nx/devkit';

import { FillPackageJsonExecutorSchema } from './schema';
import executor from './executor';

const options: FillPackageJsonExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('FillPackageJson Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
