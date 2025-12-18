// tslint:disable:max-classes-per-file no-empty ban-types
import 'jest';

import { of } from 'rxjs';
import { Context, marbles } from 'rxjs-marbles/jest';

import { MessageHost } from './message-host';
import { Message } from './message.interface';
import { LISTEN, MESSAGE_LISTENERS, RESPONSE } from './selectors';

function asyncMarbles(callback: (m: Context, done: Function) => void) {
  return (done: jest.DoneCallback) => {
    marbles((m) => {
      callback(m, done);
    })();
  };
}

describe.only('Message Host', () => {
  it('should initialize properly', () => {
    class Foo extends MessageHost {
      public [RESPONSE]() {}
    }

    expect(Foo).toBeTruthy();
  });

  it('should start listening after listen method called', asyncMarbles((m, done) => {
    const reqs = m.cold('abcd|', {
      a: {path: 'a', id: '1', body: 'foo'} as Message,
      b: {path: 'b', id: '2', body: 'bar'} as Message,
      c: {path: 'c', id: '3', body: 'baz'} as Message,
      d: {path: 'a', id: '4', body: 'foo'} as Message,
    });

    function aListener(message: string) {
      return of('aListener');
    }

    function bListener(message: string) {
      return of('bListener');
    }

    class Foo extends MessageHost {
      public static [MESSAGE_LISTENERS] = new Map([['a', [aListener]], ['b', [bListener]]]);

      public [RESPONSE] = jest.fn();

      constructor() {
        super();

        this[LISTEN](reqs);
      }
    }

    const foo = new Foo();

    m.expect(reqs).toHaveSubscriptions(['^---!', '^---!']);

    setTimeout(() => {
      expect(foo[RESPONSE]).toHaveBeenCalledTimes(6);
      expect(foo[RESPONSE]).toHaveBeenNthCalledWith(1, {id: '1', body: 'aListener', completed: false});
      expect(foo[RESPONSE]).toHaveBeenNthCalledWith(2, {id: '1', completed: true});
      expect(foo[RESPONSE]).toHaveBeenNthCalledWith(3, {id: '2', body: 'bListener', completed: false});
      expect(foo[RESPONSE]).toHaveBeenNthCalledWith(4, {id: '2', completed: true});
      expect(foo[RESPONSE]).toHaveBeenNthCalledWith(5, {id: '4', body: 'aListener', completed: false});
      expect(foo[RESPONSE]).toHaveBeenNthCalledWith(6, {id: '4', completed: true});
      done();
    }, 60);
  }));

  it('should work with class extensioning', asyncMarbles((m, done) => {
    const reqs = m.cold('abcd|', {
      a: {path: 'foo', id: '1', body: 'foo'} as Message,
      b: {path: 'bar', id: '2', body: 'bar'} as Message,
      c: {path: 'baz', id: '3', body: 'baz'} as Message,
      d: {path: 'foo', id: '4', body: 'foo'} as Message,
    });

    const fooListener = jest.fn(() => of('fooListener'));
    const barListener = jest.fn(() => of('barListener'));
    const bazListener = jest.fn(() => of('bazListener'));
    const superBarListener = jest.fn(() => of('superBarListener'));

    class Foo extends MessageHost {
      public static [MESSAGE_LISTENERS] = new Map([['foo', [fooListener]]]);

      public [RESPONSE] = jest.fn();

      constructor() {
        super();

        this[LISTEN](reqs);
      }
    }

    class Bar extends Foo {
      public static override [MESSAGE_LISTENERS] = new Map([['bar', [barListener]]]);
    }

    class Baz extends Foo {
      public static override [MESSAGE_LISTENERS] = new Map([['baz', [bazListener]]]);
    }

    class SuperBar extends Bar {
      public static override [MESSAGE_LISTENERS] = new Map([['bar', [superBarListener]]]);
    }

    const bar = new Bar();
    const baz = new Baz();
    const superBar = new SuperBar();

    m.expect(reqs).toHaveSubscriptions(['^---!', '^---!', '^---!', '^---!', '^---!', '^---!']);

    setTimeout(() => {
      expect(bar[RESPONSE]).toHaveBeenCalledTimes(6);
      expect(baz[RESPONSE]).toHaveBeenCalledTimes(6);
      expect(superBar[RESPONSE]).toHaveBeenCalledTimes(8);

      expect(bar[RESPONSE]).toHaveBeenNthCalledWith(1, {id: '1', body: 'fooListener', completed: false});
      expect(bar[RESPONSE]).toHaveBeenNthCalledWith(2, {id: '1', completed: true});
      expect(bar[RESPONSE]).toHaveBeenNthCalledWith(3, {id: '2', body: 'barListener', completed: false});
      expect(bar[RESPONSE]).toHaveBeenNthCalledWith(4, {id: '2', completed: true});
      expect(bar[RESPONSE]).toHaveBeenNthCalledWith(5, {id: '4', body: 'fooListener', completed: false});
      expect(bar[RESPONSE]).toHaveBeenNthCalledWith(6, {id: '4', completed: true});
      expect(baz[RESPONSE]).toHaveBeenNthCalledWith(1, {id: '1', body: 'fooListener', completed: false});
      expect(baz[RESPONSE]).toHaveBeenNthCalledWith(2, {id: '1', completed: true});
      expect(baz[RESPONSE]).toHaveBeenNthCalledWith(3, {id: '3', body: 'bazListener', completed: false});
      expect(baz[RESPONSE]).toHaveBeenNthCalledWith(4, {id: '3', completed: true});
      expect(baz[RESPONSE]).toHaveBeenNthCalledWith(5, {id: '4', body: 'fooListener', completed: false});
      expect(baz[RESPONSE]).toHaveBeenNthCalledWith(6, {id: '4', completed: true});

      expect(superBar[RESPONSE]).toHaveBeenNthCalledWith(1, {id: '1', body: 'fooListener', completed: false});
      expect(superBar[RESPONSE]).toHaveBeenNthCalledWith(2, {id: '1', completed: true});
      expect(superBar[RESPONSE]).toHaveBeenNthCalledWith(3, {id: '2', body: 'superBarListener', completed: false});
      expect(superBar[RESPONSE]).toHaveBeenNthCalledWith(4, {id: '2', completed: true});
      expect(superBar[RESPONSE]).toHaveBeenNthCalledWith(5, {id: '2', body: 'barListener', completed: false});
      expect(superBar[RESPONSE]).toHaveBeenNthCalledWith(6, {id: '2', completed: true});
      expect(superBar[RESPONSE]).toHaveBeenNthCalledWith(7, {id: '4', body: 'fooListener', completed: false});
      expect(superBar[RESPONSE]).toHaveBeenNthCalledWith(8, {id: '4', completed: true});
      done();
    }, 60);
  }));
});
