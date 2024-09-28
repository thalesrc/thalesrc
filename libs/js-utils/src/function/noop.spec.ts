
import { noop } from './noop';

describe('Noop Function', () => {
  it('should return void', () => {
    expect(noop()).toBe(undefined);
  });
});
