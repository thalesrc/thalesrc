import { mixin } from "@telperion/js-utils/class/mixin";
import { RTCMessageClient } from "./message-client";
import { RTCMessageHost } from "./message-host";
import { RTCConnectionArg } from "./rtc.type";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";

/**
 * Bidirectional message service for WebRTC DataChannel communication.
 *
 * Combines {@link RTCMessageHost} and {@link RTCMessageClient} via mixin,
 * enabling both `@Listen` and `@Request` decorators on the same class.
 *
 * @example
 * ```typescript
 * class GamePeer extends RTCMessageService {
 *   @Request('move')
 *   sendMove(pos: [number, number]): Observable<boolean> { return null!; }
 *
 *   @Listen('move')
 *   handleMove({ data }: { data: [number, number] }): Observable<boolean> {
 *     return of(applyMove(data));
 *   }
 * }
 *
 * const peer = new GamePeer(peerConnection, 'game-events');
 * ```
 */
export class RTCMessageService extends mixin(RTCMessageHost, RTCMessageClient) {
  /**
   * @param connection - RTCPeerConnection instance, promise, or factory function.
   * @param channelName - Name for the negotiated data channel.
   */
  constructor(connection?: RTCConnectionArg, channelName = DEFAULT_CHANNEL_NAME) {
    super([connection, `${channelName}H`], [connection, `${channelName}C`]);
  }

  public override initialize = (connection: RTCConnectionArg, channelName?: string): void => {
    RTCMessageHost.prototype.initialize.call(this, connection, channelName);
    RTCMessageClient.prototype.initialize.call(this, connection, channelName);
  };
}
