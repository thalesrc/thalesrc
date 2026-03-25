import { noop } from "@telperion/js-utils/function/noop";
import { call } from "@telperion/js-utils/function/call";
import { timeout } from "@telperion/js-utils/promise/timeout";
import { promisify } from "@telperion/js-utils/promise/promisify";
import { NEVER } from "@telperion/js-utils/promise/never";

import { CHANNEL_CONTROLLER } from "./channel-controller";
import { RTCConnectionArg } from "./rtc.type";
import { MessageResponse } from "../message-response.type";

interface InitializerConfig {
  context: any;
  selectors: {
    channel: symbol;
    channelOpen: symbol;
    deinit: symbol;
    emitter: symbol;
  };
  connection: RTCConnectionArg;
  channelName: string;
  channelId?: number;
  messageFilterType: 'request' | 'response';
}

const INITIALIZATION_ERROR_TUPLE = [undefined, Promise.resolve(null)] as const;

export function initialize({
  context,
  selectors: { channel, channelOpen, deinit, emitter },
  connection,
  channelName,
  channelId,
  messageFilterType
}: InitializerConfig): void {
  const channelWithOpen = Promise.race([
    context[deinit],
    timeout(5000, noop)
  ])
    .then(call)
    .then(() => {
      const conn = typeof connection === 'function' ? connection() : connection;

      return promisify(conn);
    })
    .then(conn => {
      if (!conn) return INITIALIZATION_ERROR_TUPLE;

      return CHANNEL_CONTROLLER.getChannel(conn, channelName, channelId);
    })
    .catch(error => {
      console.error('Failed to initialize RTCMessageClient:', error);

      return INITIALIZATION_ERROR_TUPLE;
    })

  context[channel] = channelWithOpen.then(([dataChannel]) => dataChannel ?? NEVER);
  context[channelOpen] = channelWithOpen.then(([_, open]) => open).then(channel => channel ?? NEVER);
  context[deinit] = channelWithOpen.then(([channel]) => {
    if (!channel) return noop;

    const listener = (event: MessageEvent) => {
      const data: MessageResponse & { type: 'response' | 'request' } = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      if (data.type !== messageFilterType) return;

      context[emitter].next(data);
    };

    channel.addEventListener('message', listener);

    return () => {
      channel.removeEventListener('message', listener);
      CHANNEL_CONTROLLER.close(channel);
    };
  });
}
