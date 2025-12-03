import { uniqueId } from "@thalesrc/js-utils";
import { Subject } from "rxjs";
import { MessageClient } from "../message-client";
import { MessageResponse } from "../message-response.type";
import { Message } from "../message.interface";
import { GET_NEW_ID, RESPONSES$, SEND } from "../selectors";

interface MessageEvent<T> {
  data: T;
}

const WORKER = Symbol('Worker');
const HANDLER = Symbol('Handler');
const INSTANCE_ID = Symbol('Instance Id');

export class WorkerMessageClient extends MessageClient {
  public [RESPONSES$] = new Subject<MessageResponse>();
  protected [WORKER]: Worker;
  private [INSTANCE_ID] = Date.now();

  constructor(worker?: Worker) {
    super();

    this[WORKER] = worker;

    if (worker) {
      worker.addEventListener('message', this[HANDLER]);
    } else {
      addEventListener('message', this[HANDLER]);
    }
  }

  public [SEND]<T>(message: Message<T>) {
    if (this[WORKER]) {
      this[WORKER].postMessage(message);
    } else {
      (postMessage as any)(message);
    }
  }

  protected [HANDLER] = (event: MessageEvent<MessageResponse>) => {
    this[RESPONSES$].next(event.data);
  }

  protected [GET_NEW_ID](): string {
    return uniqueId('hermes-worker-message-' + this[INSTANCE_ID]) as string;
  }
}