import { mixin } from "@telperion/js-utils/class/mixin";

import { READY as CLIENT_READY, RTCMessageClient } from "./message-client";
import { READY as HOST_READY, RTCMessageHost } from "./message-host";
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
    super([connection, channelName], [connection, channelName]);

    Reflect.defineProperty(this, 'ready', {
      get: () => {
        return Promise.race([
          this[CLIENT_READY],
          (this as any)[HOST_READY]
        ]);
      },
      configurable: false
    })
  }

  public override initialize = (connection: RTCConnectionArg): void => {
    RTCMessageHost.prototype.initialize.call(this, connection);
    RTCMessageClient.prototype.initialize.call(this, connection);
  };
}
