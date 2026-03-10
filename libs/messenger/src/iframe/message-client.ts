import { uniqueId } from '@telperion/js-utils';
import { Subject } from 'rxjs';
import { MessageClient } from '../message-client';
import { MessageResponse, SuccessfulMessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { CHANNEL_PATH_SPLITTER } from './channel-path-splitter';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { IFrame } from './iframe.type';

const TARGET_FRAME = Symbol('IframeMessageClient Target Frame');
const OPTION_TARGET_FRAME = Symbol('IframeMessageClient Option Target Frame');

export class IframeMessageClient extends MessageClient {
  public [RESPONSES$] = new Subject<MessageResponse>();
  private [OPTION_TARGET_FRAME]: IFrame;

  private get [TARGET_FRAME](): null | HTMLIFrameElement {
    return typeof this[OPTION_TARGET_FRAME] === 'function'
      ? (this[OPTION_TARGET_FRAME] as () => HTMLIFrameElement | undefined)() ?? null
      : this[OPTION_TARGET_FRAME] as HTMLIFrameElement ?? null;
  }

  constructor(
    private channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrame
  ) {
    super();

    this[OPTION_TARGET_FRAME] = targetFrame;

    window.addEventListener('message', ({ data, source }: MessageEvent<SuccessfulMessageResponse>) => {
      const target = this[TARGET_FRAME];

      if (target && source !== target.contentWindow) return;

      if (!data
        || typeof data !== 'object'
        || typeof data.id === 'undefined'
        || typeof data.completed === 'undefined'
      ) {
        return;
      }

      this[RESPONSES$].next(data);
    });
  }

  public [SEND]<T>(message: Message<T>) {
    message = { ...message, path: `${this.channelName}${CHANNEL_PATH_SPLITTER}${message.path}` };

    const target = this[TARGET_FRAME];

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
