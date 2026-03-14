import { uniqueId } from '@telperion/js-utils/unique-id';
import { noop } from '@telperion/js-utils/function/noop';
import { call } from '@telperion/js-utils/function/call';
import { promisify } from '@telperion/js-utils/promise/promisify';
import { timeout } from '@telperion/js-utils/promise/timeout';
import { Subject } from 'rxjs';

import { MessageHost } from '../message-host';
import { SuccessfulMessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { CHANNEL_PATH_SPLITTER } from './channel-path-splitter';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { SOURCE_ID_SPLITTER } from './source-id-splitter';
import { LISTEN, RESPONSE } from '../selectors';
import { IFrameArg, IFrameType } from './iframe.type';

const REQUESTS = Symbol('IframeMessageHost Requests');
const SOURCES = Symbol('IframeMessageHost Sources');
const HANDLER = Symbol('IframeMessageHost Handler');

export class IframeMessageHost extends MessageHost {
  private [REQUESTS] = new Subject<Message>();
  private [SOURCES]: Array<[string, MessageEventSource]> = [];

  #deinitialize = Promise.resolve(noop);

  constructor(
    private channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrameArg
  ) {
    super();

    IframeMessageHost.prototype.initialize.call(this, targetFrame);

    this[LISTEN](this[REQUESTS]);
  }

  initialize(targetFrame: IFrameArg): void {
    this.#deinitialize = Promise.race([
      this.#deinitialize,
      timeout(5000, noop)
    ])
      .then(call)
      .then(() => {
        const _frame = typeof targetFrame === 'function' ? targetFrame() : targetFrame;
        return promisify(_frame);
      })
      .then(frame => {
        const handler = this[HANDLER](frame);
        window.addEventListener('message', handler);

        return () => {
          window.removeEventListener('message', handler);
        }
      });
  }

  public terminate(): void {
    this.#deinitialize.then(call).catch(noop);
  }

  protected [RESPONSE](message: SuccessfulMessageResponse): void {
    const [sourceId, messageId] = message.id.split(SOURCE_ID_SPLITTER);
    const [, source] = this[SOURCES].find(([sId]) => sId === sourceId)!;

    message = {
      ...message,
      id: messageId,
    };

    (source as Window).postMessage(message, '*');
  }

  private [HANDLER] = (targetFrame: IFrameType) => ({ data, source }: MessageEvent<Message>) => {
    if (!data || typeof data !== 'object' || !data.path || typeof data.id === 'undefined') {
      return;
    }

    if (targetFrame && targetFrame.contentWindow !== source) {
      return;
    }

    const [channel, path] = data.path.split(CHANNEL_PATH_SPLITTER);

    if (channel !== this.channelName) {
      return;
    }

    if (!this[SOURCES].some(([, s]) => s === source)) {
      this[SOURCES].push([uniqueId('messenger-iframe-source') as string, source!]);
    }

    const [sourceId] = this[SOURCES].find(([, s]) => s === source)!;
    this[REQUESTS].next({
      body: targetFrame ? data.body : { data: data.body, sender: source },
      id: `${sourceId}${SOURCE_ID_SPLITTER}${data.id}`,
      path,
    });
  };
}
