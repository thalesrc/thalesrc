import './noop';

describe('Noop Static Function', () => {
  it('should return void', () => {
    expect(Function.noop()).toBe(undefined);
  });
});
