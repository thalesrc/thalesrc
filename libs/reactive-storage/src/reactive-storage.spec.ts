import { reactiveStorage } from './reactive-storage';

describe('reactiveStorage', () => {
  it('should work', () => {
    expect(reactiveStorage()).toEqual('reactive-storage');
  });
});
