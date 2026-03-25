import { noop } from '@telperion/js-utils/function/noop';
import { promisify } from '@telperion/js-utils/promise/promisify';
import { timeout } from '@telperion/js-utils/promise/timeout';
import { NEVER } from '@telperion/js-utils/promise/never';
import { Subject } from 'rxjs';

import { MessageHost } from '../message-host';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { LISTEN, RESPONSE } from '../selectors';
import { RTCConnectionArg } from './rtc.type';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { CHANNEL_CONTROLLER } from './channel-controller';

const CONNECTION = Symbol('RTCMessageHost Connection');
const REQUESTS = Symbol('RTCMessageHost Requests');
const CHANNEL_NAME = Symbol('RTCMessageHost Channel Name');
export const READY = Symbol('RTCMessageHost Ready');

/**
 * Message host for WebRTC DataChannel communication.
 *
 * Listens for incoming messages on a negotiated RTCDataChannel and sends responses
 * back over the same channel. Both peers must create the channel with identical
 * name and negotiated ID (handled automatically via {@link channelId}).
 *
 * @example
 * ```typescript
 * class GameHost extends RTCMessageHost {
 *   @Listen('move')
 *   handleMove({ data }: { data: [number, number] }): Observable<boolean> {
 *     return of(applyMove(data));
 *   }
 * }
 *
 * const host = new GameHost(peerConnection, 'game-events');
 * ```
 */
export class RTCMessageHost extends MessageHost {
  private [REQUESTS] = new Subject<Message>();
  private [CONNECTION] = Promise.resolve([undefined as RTCDataChannel | undefined, noop] as const);
  private [CHANNEL_NAME]: string;

  private get [READY](): Promise<RTCDataChannel> {
    return this[CONNECTION].then(([dataChannel]) => dataChannel ?? NEVER);
  }

  get ready(): Promise<RTCDataChannel> {
    return this[READY];
  }

  /**
   * @param connection - RTCPeerConnection instance, promise, or factory function. Omit to initialize later via {@link initialize}.
   * @param channelName - Name for the negotiated data channel. Determines the channel ID via FNV-1a hash.
   */
  constructor(
    connection?: RTCConnectionArg,
    channelName = DEFAULT_CHANNEL_NAME
  ) {
    super();

    this[CHANNEL_NAME] = channelName;
    RTCMessageHost.prototype.initialize.call(this, connection);
    this[LISTEN](this[REQUESTS]);
  }

  /**
   * (Re)initializes the data channel with a new connection.
   * Cleans up the previous channel before establishing a new one.
   *
   * @param connection - RTCPeerConnection instance, promise, or factory function.
   */
  initialize(connection: RTCConnectionArg): void {
    this[CONNECTION] = Promise.race([
      this[CONNECTION],
      timeout(5000, [null, noop] as const)
    ])
      .then(([_, deinitialize]) => deinitialize())
      .catch(noop)
      .then(() => {
        const _conn = typeof connection === 'function' ? connection() : connection;

        return promisify(_conn);
      })
      .then(conn => {
        if (!conn) return;

        const dataChannel = CHANNEL_CONTROLLER.getChannel(conn, this[CHANNEL_NAME]);

        if (dataChannel.readyState === 'open') return dataChannel;

        return new Promise<RTCDataChannel>((resolve) => {
          dataChannel.addEventListener('open', () => resolve(dataChannel), { once: true });
        });
      })
      .then(dataChannel => {
        if (!dataChannel) return [undefined, noop] as const;

        const handler = (event: MessageEvent) => {
          const data: Message & { type: 'request' } = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

          if (data.type !== 'request') return;

          this[REQUESTS].next(data);
        };

        dataChannel.addEventListener('message', handler);

        return [dataChannel, () => {
          dataChannel.removeEventListener('message', handler);
          CHANNEL_CONTROLLER.close(dataChannel);
        }] as const;
      });
  }

  /** Closes the data channel and removes event listeners. */
  public terminate(): void {
    this[CONNECTION]
      .then(([_, deinitialize]) => deinitialize())
      .catch(noop);
  }

  protected async [RESPONSE](message: MessageResponse) {
    const [dataChannel] = await this[CONNECTION];

    dataChannel?.send(JSON.stringify({...message, type: 'response' }));
  }
}
