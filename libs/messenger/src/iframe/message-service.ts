import { mixin } from "@telperion/js-utils/class/mixin";
import { IframeMessageClient } from "./message-client";
import { IframeMessageHost } from "./message-host";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";
import { IFrameArg } from "./iframe.type";

export class IframeMessageService extends mixin(IframeMessageHost, IframeMessageClient) {
  constructor(
    channelName = DEFAULT_CHANNEL_NAME,
    targetFrame?: IFrameArg
  ) {
    super([channelName, targetFrame], [channelName, targetFrame]);

    this.initialize(targetFrame);
  }

  public override initialize = (target: IFrameArg): void => {
    IframeMessageHost.prototype.initialize.call(this, target);
    IframeMessageClient.prototype.initialize.call(this, target);
  };
}
