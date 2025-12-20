import { TestScheduler } from 'rxjs/testing';
import { EMPTY, Observable } from 'rxjs';
import { vi } from 'vitest';

import { Message } from './message.interface';
import { Request } from './request.decorator';
import { GET_NEW_ID, RESPONSES$, SEND } from './selectors';

function getTestScheduler() {
  return new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
}

describe('Request Decorator', () => {
  class Foo {
    @Request('bar')
    public baz(message: string) {
      return null;
    }
  }

  it('should initialize properly', () => {
    expect(Foo.prototype.baz).toBeTruthy();
  });

  it('should use send method of the client to send messages', () => {
    const instance = new Foo();

    (instance as any)[GET_NEW_ID] = vi.fn().mockReturnValue('1');
    (instance as any)[SEND] = vi.fn();
    (instance as any)[RESPONSES$] = EMPTY;

    const res = instance.baz('test message');

    expect((instance as any)[GET_NEW_ID]).toBeCalledTimes(1);
    expect((instance as any)[SEND]).toBeCalledTimes(1);
    expect((instance as any)[SEND]).toBeCalledWith({ body: 'test message', id: '1', path: 'bar' } as Message);
    expect(res).toBeInstanceOf(Observable);
  });

  it('should return only body of the message', () => {
    const testScheduler = getTestScheduler();

    testScheduler.run(({ cold, expectObservable }) => {
      const instance = new Foo();

      (instance as any)[GET_NEW_ID] = vi.fn().mockReturnValue('1');
      (instance as any)[SEND] = vi.fn();
      (instance as any)[RESPONSES$] = cold('a-b|', {
        a: { body: 'heyy', id: '1', completed: false },
        b: { id: '1', completed: true },
      });

      const res = instance.baz('test message');

      expectObservable(res!).toBe('a-|', { a: 'heyy' });
    });
  });

  it('should listen until complete message received', () => {
    const testScheduler = getTestScheduler();

    testScheduler.run(({ cold, expectObservable }) => {
      const instance = new Foo();

      (instance as any)[GET_NEW_ID] = vi.fn().mockReturnValue('1');
      (instance as any)[SEND] = vi.fn();
      (instance as any)[RESPONSES$] = cold('-a-b-c-d|', {
        a: { body: 'heyy', id: '1', completed: false },
        b: { body: 'hermes', id: '1', completed: false },
        c: { body: 'rocks', id: '1', completed: false },
        d: { id: '1', completed: true },
      });

      const res = instance.baz('test message');

      expectObservable(res!).toBe('-a-b-c-|', {
        a: 'heyy',
        b: 'hermes',
        c: 'rocks',
      });
    });
  });
});
