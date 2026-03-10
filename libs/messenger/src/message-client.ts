import { Observable } from 'rxjs';

import { MessageResponse } from './message-response.type';
import { Message } from './message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from './selectors';

/**
 * Message Client
 */
export abstract class MessageClient {
  /**
   * Emits all messages got from hosts
   */
  protected abstract readonly [RESPONSES$]: Observable<MessageResponse>;

  /**
   * Request decorators use this method to send messages
   *
   * @param message Message payload to send
   */
  protected abstract [SEND](message: Message): void;

  /**
   * Request decorators use this method to get unique message id all accross the platform
   */
  protected abstract [GET_NEW_ID](): string;
}
