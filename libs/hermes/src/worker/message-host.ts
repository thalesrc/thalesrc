import { Subject } from "rxjs";
import { MessageHost } from "../message-host";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";

interface MessageEvent<T> {
  data: T;
}

const REQUESTS$ = Symbol('Requests');
const HANDLER = Symbol('Handler');
const WORKER = Symbol('Worker');

export class WorkerMessageHost extends MessageHost {
  private [REQUESTS$] = new Subject<Message>();
  private [WORKER]: Worker | undefined;

  constructor(worker?: Worker) {
    super();

    if (worker) {
      this[WORKER] = worker;
      worker.addEventListener('message', this[HANDLER]);
    } else {
      addEventListener('message', this[HANDLER]);
    }

    this.listen(this[REQUESTS$]);
  }

  protected response(message: MessageResponse) {
    if (this[WORKER]) {
      this[WORKER].postMessage(message);
    } else {
      (postMessage as any)(message);
    }
  }

  public terminate() {
    if (this[WORKER]) {
      this[WORKER].removeEventListener('message', this[HANDLER]);
    } else {
      removeEventListener('message', this[HANDLER]);
    }
  }

  private [HANDLER] = (event: MessageEvent<Message>) => {
    this[REQUESTS$].next(event.data);
  }
}
