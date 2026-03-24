import { uniqueId } from '@telperion/js-utils/unique-id';
import { noop } from '@telperion/js-utils/function/noop';
import { promisify } from '@telperion/js-utils/promise/promisify';
import { timeout } from '@telperion/js-utils/promise/timeout';
import { Subject } from 'rxjs';

import { MessageClient } from '../message-client';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { RTCConnectionArg } from './rtc.type';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { CHANNEL_CONTROLLER } from './channel-controller';

const CONNECTION = Symbol('RTCMessageClient Connection');
const CHANNEL_NAME = Symbol('RTCMessageClient Channel Name');

/**
 * Message client for WebRTC DataChannel communication.
 *
 * Sends request messages over a negotiated RTCDataChannel and receives responses
 * on the same channel. Both peers must create the channel with identical
 * name and negotiated ID (handled automatically via {@link channelId}).
 *
 * @example
 * ```typescript
 * class GameClient extends RTCMessageClient {
 *   @Request('move')
 *   sendMove(position: [number, number]): Observable<boolean> {
 *     return null!;
 *   }
 * }
 *
 * const client = new GameClient(peerConnection, 'game-events');
 * client.sendMove([3, 4]).subscribe(ok => console.log('Accepted:', ok));
 * ```
 */
export class RTCMessageClient extends MessageClient {
  public [RESPONSES$] = new Subject<MessageResponse>();
  private [CONNECTION] = Promise.resolve([undefined as RTCDataChannel | undefined, noop] as const);
  private [CHANNEL_NAME]: string;

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
    RTCMessageClient.prototype.initialize.call(this, connection);
  }

  /**
   * (Re)initializes the data channel with a new connection.
   * Cleans up the previous channel before establishing a new one.
   *
   * @param connection - RTCPeerConnection instance, promise, or factory function.
   * @param channelName - Optional new channel name. Defaults to the current channel name.
   */
  initialize(connection?: RTCConnectionArg): void {
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

        const listener = (event: MessageEvent) => {
          const data: MessageResponse & { type: 'response' } = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

          if (data.type !== 'response') return;

          this[RESPONSES$].next(data);
        };

        dataChannel.addEventListener('message', listener);

        return [dataChannel, () => {
          dataChannel.removeEventListener('message', listener);
          CHANNEL_CONTROLLER.close(dataChannel);
        }] as const;
      });
  }

  public async [SEND]<T>(message: Message<T>) {
    const [dataChannel] = await this[CONNECTION];

    if (dataChannel?.readyState !== 'open') return;

    dataChannel.send(JSON.stringify({...message, type: 'request' }));
  }

  protected [GET_NEW_ID](): string {
    return uniqueId('messenger-rtc-message');
  }
}
