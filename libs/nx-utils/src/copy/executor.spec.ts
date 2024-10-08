import { CopyExecutorSchema } from './schema';
import executor from './executor';

const options: CopyExecutorSchema = {};

describe('Copy Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
