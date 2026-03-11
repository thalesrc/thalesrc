import { uniqueId } from '@telperion/js-utils/unique-id';
import { noop } from '@telperion/js-utils/function/noop';
import { promisify } from '@telperion/js-utils/promise/promisify';
import { timeout } from '@telperion/js-utils/promise/timeout';
import { Subject } from 'rxjs';

import { MessageClient } from '../message-client';
import { MessageResponse, SuccessfulMessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { CHANNEL_PATH_SPLITTER } from './channel-path-splitter';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { IFrameArg, IFrameType } from './iframe.type';

const TARGET = Symbol('IframeMessageClient Target');

export class IframeMessageClient extends MessageClient {
  public [RESPONSES$] = new Subject<MessageResponse>();
  private [TARGET] = Promise.resolve([undefined as IFrameType, noop] as const);

  constructor(
    private channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrameArg
  ) {
    super();

    this.initialize(targetFrame);
  }

  initialize(target: IFrameArg): void {
    this[TARGET] = Promise.race([
      this[TARGET],
      timeout(5000, [null, noop] as const)
    ])
      .then(([_, deinitialize]) => deinitialize())
      .catch(noop)
      .then(() => {
        const frame = typeof target === 'function' ? target() : target;
        return promisify(frame);
      })
      .then((frame) => {
        const listener = ({ data, source }: MessageEvent<SuccessfulMessageResponse>) => {
          if (frame && source !== frame.contentWindow) return;

          if (!data
            || typeof data !== 'object'
            || typeof data.id === 'undefined'
            || typeof data.completed === 'undefined'
          ) {
            return;
          }

          this[RESPONSES$].next(data);
        };

        window.addEventListener('message', listener);

        return [frame, () => window.removeEventListener('message', listener)];
      })
  }

  public async [SEND]<T>(message: Message<T>) {
    message = { ...message, path: `${this.channelName}${CHANNEL_PATH_SPLITTER}${message.path}` };

    const [target] = await this[TARGET];

    if (target) {
      target.contentWindow!.postMessage(message, '*');
    } else {
      window.parent.postMessage(message, '*');
    }
  }

  protected [GET_NEW_ID](): string {
    return uniqueId('messenger-iframe-message') as string;
  }
}
