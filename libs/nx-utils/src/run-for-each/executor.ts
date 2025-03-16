import { PromiseExecutor } from '@nx/devkit';
import { RunForEachExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<RunForEachExecutorSchema> = async (
  options
) => {
  console.log('Executor ran for RunForEach', options);
  return {
    success: true,
  };
};

export default runExecutor;
