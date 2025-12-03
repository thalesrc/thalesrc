import { Observable } from 'rxjs';

export type ListenerStorage<T = any> = Map<string, ((message: any) => Observable<T>)[]>;
