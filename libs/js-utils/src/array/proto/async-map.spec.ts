
import './async-map';
import '../../promise/static/timeout';
import { asyncMap } from '../async-map';

describe('Array Async Map Proto Function', () => {
  it('should work as same', async () => {
    const foo = [1, 2, 3];

    async function addOneAfterSomeTime(value: number) {
      return await Promise.timeout(Math.random() * 100).then(() => value + 1);
    }

    const [first, second] = await Promise.all([
      asyncMap(foo, addOneAfterSomeTime),
      foo.asyncMap(addOneAfterSomeTime)
    ]);

    expect(first).toEqual(second);
  });
});
