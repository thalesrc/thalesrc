import { mixin } from './mixin';

describe('Mixin', () => {
  it('should initialize properly', () => {
    class Foo {}
    class Bar {}
    class Baz extends mixin(Foo, Bar) {}

    expect(Baz).toBeTruthy();
  });

  it('should contain defined props', () => {
    const sym = Symbol();

    class Foo {}
    class Bar {}
    class Baz extends mixin(Foo, Bar) {
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
    class Baz extends mixin(Foo, Bar) {
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
    class Baz extends mixin(Foo, Bar) {}

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
    class Baz extends mixin(Foo, Bar) {}

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
    class Baz extends mixin(Foo, Bar) {}

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
    class Baz extends mixin(Foo, Bar) {}

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
    class Baz extends mixin(Foo, Bar) {}

    const baz = new Baz([], []);

    expect(baz.prop).toBe(1);
    expect(baz[sym]).toBe(2);
    expect(baz.propMethod()).toBe(3);
    expect(baz.prop2).toBe(1);
    expect(baz[sym2]).toBe(2);
    expect(baz.propMethod2()).toBe(3);
  });

  it('should work with constructor arguments', () => {
    class User {
      constructor(public name: string) {}
      greet() {
        return `Hello, ${this.name}`;
      }
    }

    class Timestamped {
      timestamp: number;
      constructor(time: number) {
        this.timestamp = time;
      }
      getTime() {
        return this.timestamp;
      }
    }

    class TimestampedUser extends mixin(User, Timestamped) {}

    const user = new TimestampedUser(['Alice'], [12345]);
    expect(user.name).toBe('Alice');
    expect(user.greet()).toBe('Hello, Alice');
    expect(user.timestamp).toBe(12345);
    expect(user.getTime()).toBe(12345);
  });

  it('should properly override methods from base class', () => {
    class Base {
      getValue() {
        return 'base';
      }
    }

    class Override {
      getValue() {
        return 'override';
      }
    }

    class Combined extends mixin(Base, Override) {}

    const instance = new Combined([], []);
    expect(instance.getValue()).toBe('override');
  });
});
