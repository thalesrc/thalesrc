import { Subject } from "rxjs";
import { MessageClient } from "../message-client";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { GET_NEW_ID, RESPONSES$, SEND } from "../selectors";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";

interface MessageEvent<T> {
  data: T;
}

export class BroadcastMessageClient extends MessageClient {
  protected [RESPONSES$] = new Subject<MessageResponse>();

  #channel: BroadcastChannel;

  constructor(channelName = DEFAULT_CHANNEL_NAME) {
    super();

    this.#channel = new BroadcastChannel(channelName);

    this.#channel.addEventListener('message', this.#handler);
  }

  protected [SEND]<T>(message: Message<T>) {
    this.#channel.postMessage(message);
  }

  #handler = (event: MessageEvent<MessageResponse>) => {
    this[RESPONSES$].next(event.data);
  };

  protected [GET_NEW_ID](): string {
    return crypto.randomUUID();
  }
}