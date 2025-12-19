// tslint:disable:no-empty

import 'jest';

import { Listen } from './listen.decorator';

describe('Listen Decorator', () => {
  it('should initialize properly', () => {
    class Foo {
      @Listen('bar')
      public barListener() {}
    }

    const foo = new Foo();

    expect(foo.barListener).toBeTruthy();
  });
});
