import { mixin } from "@thalesrc/js-utils/class/mixin";
import { WorkerMessageClient } from "./message-client";
import { WorkerMessageHost } from "./message-host";

export class WorkerMessageService extends mixin(WorkerMessageHost, WorkerMessageClient) {
  constructor(worker?: Worker) {
    super([worker], [worker]);
  }
}
