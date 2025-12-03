import { Mixin } from "../mixin";
import { WorkerMessageClient } from "./message-client";
import { WorkerMessageHost } from "./message-host";

export class WorkerMessageService extends Mixin(WorkerMessageHost, WorkerMessageClient) {
  constructor(worker?: Worker) {
    super([worker], [worker]);
  }
}
