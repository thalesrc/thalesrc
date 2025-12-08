import 'jest';

import { empty, Observable } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';

import { Message } from './message.interface';
import { Request } from './request.decorator';
import { GET_NEW_ID, RESPONSES$, SEND } from './selectors';

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

    (instance as any)[GET_NEW_ID] = jest.fn().mockReturnValue('1');
    (instance as any)[SEND] = jest.fn();
    (instance as any)[RESPONSES$] = empty();

    const res = instance.baz('test message');

    expect((instance as any)[GET_NEW_ID]).toBeCalledTimes(1);
    expect((instance as any)[SEND]).toBeCalledTimes(1);
    expect((instance as any)[SEND]).toBeCalledWith({body: 'test message', id: '1', path: 'bar'} as Message);
    expect(res).toBeInstanceOf(Observable);
  });

  it('should return only body of the message', marbles((m) => {
    const instance = new Foo();

    (instance as any)[GET_NEW_ID] = jest.fn().mockReturnValue('1');
    (instance as any)[SEND] = jest.fn();
    (instance as any)[RESPONSES$] = m.cold('a-b|', {
      a: {body: 'heyy', id: '1', completed: false},
      b: {id: '1', completed: true},
    });

    const res = instance.baz('test message');

    m.expect(res!).toBeObservable('a-|', {a: 'heyy'});
  }));

  it('should listen until complete message received', marbles((m) => {
    const instance = new Foo();

    (instance as any)[GET_NEW_ID] = jest.fn().mockReturnValue('1');
    (instance as any)[SEND] = jest.fn();
    (instance as any)[RESPONSES$] = m.cold('-a-b-c-d|', {
      a: {body: 'heyy', id: '1', completed: false},
      b: {body: 'hermes', id: '1', completed: false},
      c: {body: 'rocks', id: '1', completed: false},
      d: {id: '1', completed: true},
    });

    const res = instance.baz('test message');

    const expected = m.cold('-a-b-c-|', {
      a: 'heyy',
      b: 'hermes',
      c: 'rocks',
    });

    m.expect(res!).toBeObservable(expected);
  }));
});
