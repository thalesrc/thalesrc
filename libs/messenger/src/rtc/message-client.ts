import { uniqueId } from '@telperion/js-utils/unique-id';
import { noop } from '@telperion/js-utils/function/noop';
import { NEVER } from '@telperion/js-utils/promise/never';
import { Subject } from 'rxjs';

import { MessageClient } from '../message-client';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { GET_NEW_ID, RESPONSES$, SEND } from '../selectors';
import { RTCConnectionArg } from './rtc.type';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { initialize } from './initializer';

const CHANNEL_NAME = Symbol('RTCMessageClient Channel Name');
const CHANNEL = Symbol('RTCMessageClient Channel');
const CHANNEL_OPEN = Symbol('RTCMessageClient Channel Open');
const DEINITIALIZE = Symbol('RTCMessageClient Deinitialize');
export const READY = Symbol('RTCMessageClient Ready');
export const CREATED = Symbol('RTCMessageClient Created');

/**
 * WebRTC DataChannel message client that sends request messages and receives
 * responses over a negotiated channel.
 *
 * Both peers must create the channel with an identical name and negotiated ID.
 * The ID is derived automatically from the channel name via an FNV-1a hash
 * unless an explicit `channelId` is supplied.
 *
 * Use `@Request` decorators to define outgoing RPC methods. The client can be
 * constructed without a connection and initialized later via {@link initialize}.
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
  private [CHANNEL_NAME]: string;
  private [CHANNEL]: Promise<RTCDataChannel> = NEVER;
  private [CHANNEL_OPEN]: Promise<RTCDataChannel> = NEVER;
  private [DEINITIALIZE]: Promise<() => void> = Promise.resolve(noop);

  private get [CREATED]() {
    return this[CHANNEL];
  }

  /** Resolves with the `RTCDataChannel` once it has been created (may not yet be open). */
  get created(): Promise<RTCDataChannel> {
    return this[CREATED];
  }

  private get [READY](): Promise<RTCDataChannel> {
    return this[CHANNEL_OPEN];
  }

  /** Resolves with the `RTCDataChannel` once it is open and ready to transmit. */
  get ready(): Promise<RTCDataChannel> {
    return this[READY];
  }

  /**
   * @param connection  - RTCPeerConnection instance, promise, or factory function. Omit to initialize later via {@link initialize}.
   * @param channelName - Name for the negotiated data channel. Determines the channel ID via FNV-1a hash.
   * @param channelId   - Explicit negotiated channel ID. Overrides the hash-derived default.
   */
  constructor(
    connection?: RTCConnectionArg,
    channelName = DEFAULT_CHANNEL_NAME,
    channelId?: number
  ) {
    super();

    this[CHANNEL_NAME] = channelName;
    RTCMessageClient.prototype.initialize.call(this, connection, channelId);
  }

  /**
   * (Re)initializes the data channel with a new connection.
   * Waits for the previous channel to be cleaned up (with a 5 s timeout)
   * before establishing the new one.
   *
   * @param connection - RTCPeerConnection instance, promise, or factory function.
   * @param channelId  - Optional negotiated channel ID. Defaults to the hash-derived ID.
   */
  initialize(connection?: RTCConnectionArg, channelId?: number): void {
    initialize({
      context: this,
      selectors: {
        channel: CHANNEL,
        channelOpen: CHANNEL_OPEN,
        deinit: DEINITIALIZE,
        emitter: RESPONSES$
      },
      connection,
      channelName: this[CHANNEL_NAME],
      channelId,
      messageFilterType: 'response'
    });
  }

  public async [SEND]<T>(message: Message<T>) {
    const dataChannel = await this[CHANNEL_OPEN];

    dataChannel.send(JSON.stringify({...message, type: 'request' }));
  }

  protected [GET_NEW_ID](): string {
    return uniqueId('messenger-rtc-message');
  }
}
