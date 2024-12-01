import { useEffect } from "react";
import type { Observable, Observer } from "rxjs";

export function useSubscribe<T>(observable: Observable<T>, observer: Partial<Observer<T>> | Observer<T>['next'], deps: any[] = []) {
  useEffect(() => {
    const subscription = observable.subscribe(observer);

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
