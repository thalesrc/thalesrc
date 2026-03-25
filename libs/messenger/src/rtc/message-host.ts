import { noop } from '@telperion/js-utils/function/noop';
import { call } from '@telperion/js-utils/function/call';
import { NEVER } from '@telperion/js-utils/promise/never';
import { Subject } from 'rxjs';

import { MessageHost } from '../message-host';
import { MessageResponse } from '../message-response.type';
import { Message } from '../message.interface';
import { LISTEN, RESPONSE } from '../selectors';
import { RTCConnectionArg } from './rtc.type';
import { DEFAULT_CHANNEL_NAME } from './default-channel-name';
import { initialize } from './initializer';

const CHANNEL_NAME = Symbol('RTCMessageHost Channel Name');
const CHANNEL = Symbol('RTCMessageHost Channel');
const CHANNEL_OPEN = Symbol('RTCMessageHost Channel Open');
const DEINITIALIZE = Symbol('RTCMessageHost Deinitialize');
const REQUESTS = Symbol('RTCMessageHost Requests');
export const READY = Symbol('RTCMessageHost Ready');
export const CREATED = Symbol('RTCMessageHost Created');

/**
 * WebRTC DataChannel message host that listens for incoming request messages
 * and dispatches responses over the same negotiated channel.
 *
 * Both peers must create the channel with an identical name and negotiated ID.
 * The ID is derived automatically from the channel name via an FNV-1a hash
 * unless an explicit `channelId` is supplied.
 *
 * Use `@Listen` decorators to register request handlers. The host begins
 * listening as soon as it is constructed; pass a connection later via
 * {@link initialize} if one is not available at construction time.
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
    RTCMessageHost.prototype.initialize.call(this, connection, channelId);
    this[LISTEN](this[REQUESTS]);
  }

  /**
   * (Re)initializes the data channel with a new connection.
   * Cleans up the previous channel before establishing a new one.
   *
   * @param connection - RTCPeerConnection instance, promise, or factory function.
   * @param channelId  - Optional new channel ID. Defaults to the current channel ID.
   */
  initialize(connection?: RTCConnectionArg, channelId?: number): void {
    initialize({
      context: this,
      selectors: {
        channel: CHANNEL,
        channelOpen: CHANNEL_OPEN,
        deinit: DEINITIALIZE,
        emitter: REQUESTS
      },
      connection,
      channelName: this[CHANNEL_NAME],
      channelId,
      messageFilterType: 'request'
    });
  }

  /** Closes the data channel and removes event listeners. */
  public terminate(): void {
    this[DEINITIALIZE].then(call);
  }

  protected async [RESPONSE](message: MessageResponse) {
    const dataChannel = await this[CHANNEL_OPEN];

    dataChannel.send(JSON.stringify({...message, type: 'response' }));
  }
}
