import { EMPTY } from 'rxjs';

import { MessageClient } from './message-client';
import { GET_NEW_ID, RESPONSES$, SEND } from './selectors';

describe('Message Client', () => {
  it('should initialize properly', () => {
    class Foo extends MessageClient {
      protected [RESPONSES$] = EMPTY;

      protected [GET_NEW_ID](): string {
        return '1';
      }

      protected [SEND]() {
        return null;
      }
    }

    const foo = new Foo();

    expect(Foo).toBeTruthy();
    expect(foo).toBeTruthy();
  });
});
