import { Subject } from "rxjs";
import { MessageHost } from "../message-host";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { LISTEN, RESPONSE } from "../selectors";

interface MessageEvent<T> {
  data: T;
}

export class WorkerMessageHost extends MessageHost {
  #requests$ = new Subject<Message>();
  #worker: Worker | undefined;

  constructor(worker?: Worker) {
    super();

    if (worker) {
      this.#worker = worker;
      worker.addEventListener('message', this.#handler);
    } else {
      addEventListener('message', this.#handler);
    }

    this[LISTEN](this.#requests$);
  }

  protected [RESPONSE](message: MessageResponse) {
    if (this.#worker) {
      this.#worker.postMessage(message);
    } else {
      (postMessage as any)(message);
    }
  }

  public terminate() {
    if (this.#worker) {
      this.#worker.removeEventListener('message', this.#handler);
    } else {
      removeEventListener('message', this.#handler);
    }
  }

  #handler = (event: MessageEvent<Message>) => {
    this.#requests$.next(event.data);
  }
}
