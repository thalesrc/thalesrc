import { uniqueId } from '@thalesrc/js-utils';
import { Subject } from 'rxjs';
import { MessageHost } from '../message-host';
import { SuccessfulMessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { CHANNEL_PATH_SPLITTER } from './channel-path-splitter';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { SOURCE_ID_SPLITTER } from './source-id-splitter';
import { IFrame } from './iframe.type';
import { LISTEN, RESPONSE } from '../selectors';

export class IframeMessageHost extends MessageHost {
  #requests = new Subject<Message>();
  #sources: Array<[string, MessageEventSource]> = [];
  #_targetFrame: IFrame | undefined;

  get #targetFrame(): null | HTMLIFrameElement {
    return typeof this.#_targetFrame === 'function'
      ? (this.#_targetFrame as () => HTMLIFrameElement)() || null
      : this.#_targetFrame as HTMLIFrameElement || null;
  }

  constructor(
    private channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrame
  ) {
    super();

    this.#_targetFrame = targetFrame;

    window.addEventListener('message', this.#handler);

    this[LISTEN](this.#requests);
  }

  public terminate(): void {
    window.removeEventListener('message', this.#handler);
  }

  protected [RESPONSE](message: SuccessfulMessageResponse): void {
    const [sourceId, messageId] = message.id.split(SOURCE_ID_SPLITTER);
    const [, source] = this.#sources.find(([sId]) => sId === sourceId)!;

    message = {
      ...message,
      id: messageId,
    };

    (source as any).postMessage(message);
  }

  #handler = ({data, source}: MessageEvent<Message>) => {
    if (!data || typeof data !== 'object' || !data.path || typeof data.id === 'undefined') {
      return;
    }

    const targetFrame = this.#targetFrame;

    if (targetFrame && targetFrame.contentWindow !== source) {
      return;
    }

    const [channel, path] = data.path.split(CHANNEL_PATH_SPLITTER);

    if (channel !== this.channelName) {
      return;
    }

    if (!this.#sources.some(([, s]) => s === source)) {
      this.#sources.push([uniqueId('hermes-iframe-source') as string, source!]);
    }

    const [sourceId] = this.#sources.find(([, s]) => s === source)!;
    this.#requests.next({
      body: targetFrame ? data.body : {data: data.body, sender: source},
      id: `${sourceId}${SOURCE_ID_SPLITTER}${data.id}`,
      path,
    });
  }
}
