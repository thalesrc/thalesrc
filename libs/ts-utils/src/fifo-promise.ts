/* eslint-disable @typescript-eslint/no-explicit-any */

import { SmartMap } from "@thalesrc/js-utils/smart-map";
import { call } from "@thalesrc/js-utils/function/call";
import { timeout as jsTimeout } from "@thalesrc/js-utils/promise/timeout";

const LAST_JOB_MAP = new SmartMap<any, { lastJob: Promise<any> }>();

export class TimeoutError extends Error { }

interface FifoPromiseProps {
  delay?: number;
  group?: any;
  timeout?: number;
}

export function FifoPromise({ delay = 0, group = {}, timeout }: FifoPromiseProps = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    let lastJobObj = LAST_JOB_MAP.get(group);

    if (!lastJobObj) LAST_JOB_MAP.set(group, lastJobObj = { lastJob: Promise.resolve() });

    descriptor.value = async function (...args: any[]) {
      return lastJobObj.lastJob = new Promise((resolve, reject) => {
        lastJobObj.lastJob.finally(() => {
          let timeoutKey: symbol;

          jsTimeout(delay)
            .then(() => {
              const tasks = [() => originalMethod.call(this, ...args)];

              if (timeout != null) {
                timeoutKey = Symbol();
                tasks.push(() => jsTimeout(timeout, undefined, timeoutKey).then(() => {
                  throw new TimeoutError('Fifo Promise timeout');
                }));
              }

              return Promise.race(tasks.map(call));
            })
            .then(value => {
              if (timeoutKey) {
                jsTimeout.cancel(timeoutKey);
              }

              resolve(value);
            })
            .catch(reject);
        });
      });
    };
  };
}
