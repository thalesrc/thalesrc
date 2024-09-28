import { ExecutorContext } from '@nx/devkit';

import { TsBuilderExecutorSchema } from './schema';
import executor from './executor';

const options: TsBuilderExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('TsBuilder Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
