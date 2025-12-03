import { mixin } from "@thalesrc/js-utils/class/mixin";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";
import { BroadcastMessageClient } from "./message-client";
import { BroadcastMessageHost } from "./message-host";

export class BroadcastMessageService extends mixin(BroadcastMessageHost, BroadcastMessageClient) {
  constructor(channelName = DEFAULT_CHANNEL_NAME) {
    super([channelName], [channelName]);
  }
}
