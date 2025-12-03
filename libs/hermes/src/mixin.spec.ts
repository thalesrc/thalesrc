import 'jest';

import { Mixin } from './mixin';

describe('Mixin', () => {
  it('should initialize properly', () => {
    class Foo {}
    class Bar {}
    class Baz extends Mixin(Foo, Bar) {}

    expect(Baz).toBeTruthy();
  });

  it('should contain defined props', () => {
    const sym = Symbol();

    class Foo {}
    class Bar {}
    class Baz extends Mixin(Foo, Bar) {
      prop = 1;
      [sym] = 2;
      propMethod = () => 3;
    }

    const baz = new Baz([], []);

    expect(baz.prop).toBe(1);
    expect(baz[sym]).toBe(2);
    expect(baz.propMethod()).toBe(3);
  });

  it('should contain defined methods', () => {
    const sym = Symbol();

    class Foo {}
    class Bar {}
    class Baz extends Mixin(Foo, Bar) {
      method() {
        return 1;
      }
      [sym]() {
        return 2;
      }
    }

    const baz = new Baz([], []);

    expect(baz.method()).toBe(1);
    expect(baz[sym]()).toBe(2);
  });

  it('should contain props which defined in first parent', () => {
    const sym = Symbol();
    class Foo {
      prop = 1;
      [sym] = 2;
      propMethod = () => 3;
    }
    class Bar {}
    class Baz extends Mixin(Foo, Bar) {}

    const baz = new Baz([], []);

    expect(baz.prop).toBe(1);
    expect(baz[sym]).toBe(2);
    expect(baz.propMethod()).toBe(3);
  });

  it('should contain methods which defined in first parent', () => {
    const sym = Symbol();
    class Foo {
      method() {
        return 1;
      }

      [sym]() {
        return 2;
      }
    }
    class Bar {}
    class Baz extends Mixin(Foo, Bar) {}

    const baz = new Baz([], []);

    expect(baz.method()).toBe(1);
    expect(baz[sym]()).toBe(2);
  });

  it('should contain props which defined in second parent', () => {
    const sym = Symbol();
    class Foo {}
    class Bar {
      prop = 1;
      [sym] = 2;
      propMethod = () => 3;
    }
    class Baz extends Mixin(Foo, Bar) {}

    const baz = new Baz([], []);

    expect(baz.prop).toBe(1);
    expect(baz[sym]).toBe(2);
    expect(baz.propMethod()).toBe(3);
  });

  it('should contain methods which defined in second parent', () => {
    const sym = Symbol();
    class Foo {}
    class Bar {
      method() {
        return 1;
      }

      [sym]() {
        return 2;
      }
    }
    class Baz extends Mixin(Foo, Bar) {}

    const baz = new Baz([], []);

    expect(baz.method()).toBe(1);
    expect(baz[sym]()).toBe(2);
  });

  it('should contain props which defined in both parent', () => {
    const sym = Symbol();
    const sym2 = Symbol();
    class Foo {
      prop = 1;
      [sym] = 2;
      propMethod = () => 3;
    }
    class Bar {
      prop2 = 1;
      [sym2] = 2;
      propMethod2 = () => 3;
    }
    class Baz extends Mixin(Foo, Bar) {}

    const baz = new Baz([], []);

    expect(baz.prop).toBe(1);
    expect(baz[sym]).toBe(2);
    expect(baz.propMethod()).toBe(3);
    expect(baz.prop2).toBe(1);
    expect(baz[sym2]).toBe(2);
    expect(baz.propMethod2()).toBe(3);
  });
});
