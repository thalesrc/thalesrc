import { uniqueId } from '@telperion/js-utils';
import { Subject } from 'rxjs';
import { MessageHost } from '../message-host';
import { SuccessfulMessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { CHANNEL_PATH_SPLITTER } from './channel-path-splitter';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { SOURCE_ID_SPLITTER } from './source-id-splitter';
import { IFrame } from './iframe.type';
import { LISTEN, RESPONSE } from '../selectors';

const OPTIONS_TARGET_FRAME = Symbol('IframeMessageHost Option Target Frame');
const TARGET_FRAME = Symbol('IframeMessageHost Target Frame');
const REQUESTS = Symbol('IframeMessageHost Requests');
const SOURCES = Symbol('IframeMessageHost Sources');

export class IframeMessageHost extends MessageHost {
  private [REQUESTS] = new Subject<Message>();
  private [SOURCES]: Array<[string, MessageEventSource]> = [];
  private [OPTIONS_TARGET_FRAME]: IFrame = undefined;

  private get [TARGET_FRAME](): null | HTMLIFrameElement {
    return typeof this[OPTIONS_TARGET_FRAME] === 'function'
      ? (this[OPTIONS_TARGET_FRAME] as () => HTMLIFrameElement | undefined)() ?? null
      : this[OPTIONS_TARGET_FRAME] as HTMLIFrameElement ?? null;
  }

  constructor(
    private channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrame
  ) {
    super();

    this[OPTIONS_TARGET_FRAME] = targetFrame;

    window.addEventListener('message', this.#handler);

    this[LISTEN](this[REQUESTS]);
  }

  public terminate(): void {
    window.removeEventListener('message', this.#handler);
  }

  protected [RESPONSE](message: SuccessfulMessageResponse): void {
    const [sourceId, messageId] = message.id.split(SOURCE_ID_SPLITTER);
    const [, source] = this[SOURCES].find(([sId]) => sId === sourceId)!;

    message = {
      ...message,
      id: messageId,
    };

    (source as any).postMessage(message);
  }

  #handler = ({ data, source }: MessageEvent<Message>) => {
    if (!data || typeof data !== 'object' || !data.path || typeof data.id === 'undefined') {
      return;
    }

    const targetFrame = this[TARGET_FRAME];

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
