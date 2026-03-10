import { Subject } from "rxjs";
import { MessageHost } from "../message-host";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { DEFAULT_CHANNEL_NAME } from "./default-channel-name";
import { LISTEN, RESPONSE } from "../selectors";

interface MessageEvent<T> {
  data: T;
}

export class BroadcastMessageHost extends MessageHost {
  #requests$ = new Subject<Message>();
  #channel: BroadcastChannel;

  constructor(channelName = DEFAULT_CHANNEL_NAME) {
    super();

    this.#channel = new BroadcastChannel(channelName);

    this.#channel.addEventListener('message', this.#handler);
    this[LISTEN](this.#requests$);
  }

  protected [RESPONSE](message: MessageResponse) {
    this.#channel.postMessage(message);
  }

  terminate() {
    this.#channel.removeEventListener('message', this.#handler);
    this.#channel.close();
  }

  #handler = (event: MessageEvent<Message>) => {
    this.#requests$.next(event.data);
  };
}
