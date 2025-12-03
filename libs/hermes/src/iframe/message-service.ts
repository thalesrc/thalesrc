import { mixin } from "@thalesrc/js-utils/class/mixin";
import { IframeMessageClient } from "./message-client";
import { IframeMessageHost } from "./message-host";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";
import { IFrame } from "./iframe.type";

export class IframeMessageService extends mixin(IframeMessageHost, IframeMessageClient) {
  constructor(
    channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrame
  ) {
    super([channelName, targetFrame], [channelName, targetFrame]);
  }
}
