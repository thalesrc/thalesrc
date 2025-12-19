import { uniqueId } from '@thalesrc/js-utils';
import { Subject } from 'rxjs';
import { MessageClient } from '../message-client';
import { MessageResponse, SuccessfulMessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { CHANNEL_PATH_SPLITTER } from './channel-path-splitter';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { IFrame } from './iframe.type';

export class IframeMessageClient extends MessageClient {
  public [RESPONSES$] = new Subject<MessageResponse>();
  #_targetFrame: IFrame | undefined;

  get #targetFrame(): null | HTMLIFrameElement {
    return typeof this.#_targetFrame === 'function'
      ? (this.#_targetFrame as () => HTMLIFrameElement)() ?? null
      : this.#_targetFrame as HTMLIFrameElement ?? null;
  }

  constructor(
    private channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrame
  ) {
    super();

    this.#_targetFrame = targetFrame;

    window.addEventListener('message', ({ data, source }: MessageEvent<SuccessfulMessageResponse>) => {
      const target = this.#targetFrame;

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

    const target = this.#targetFrame;

    if (target) {
      target.contentWindow!.postMessage(message, '*');
    } else {
      window.parent.postMessage(message, '*');
    }
  }

  protected [GET_NEW_ID](): string {
    return uniqueId('hermes-iframe-message') as string;
  }
}
