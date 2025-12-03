import { Mixin } from "../mixin";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";
import { BroadcastMessageClient } from "./message-client";
import { BroadcastMessageHost } from "./message-host";

export class BroadcastMessageService extends Mixin(BroadcastMessageHost, BroadcastMessageClient) {
  constructor(channelName = DEFAULT_CHANNEL_NAME) {
    super([channelName], [channelName]);
  }
}
