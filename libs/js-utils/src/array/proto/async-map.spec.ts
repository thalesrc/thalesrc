import 'jest';

import './async-map';
import '../../promise/static/timeout';
import { asyncMap } from '../async-map';

describe('Array Async Map Proto Function', () => {
  it('should work as same', done => {
    const foo = [1, 2, 3];

    async function addOneAfterSomeTime(value) {
      return await Promise.timeout(Math.random() * 100).then(() => value + 1);
    }

    Promise.all([
      asyncMap(foo, addOneAfterSomeTime),
      foo.asyncMap(addOneAfterSomeTime)
    ]).then(([first, second]) => {
      expect(first).toEqual(second);
      done();
    });
  });
});
