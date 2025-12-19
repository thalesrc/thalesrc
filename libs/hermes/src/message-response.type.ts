import { Message } from './message.interface';

type Omit<ObjectType, KeysType extends keyof ObjectType> = Pick<ObjectType, Exclude<keyof ObjectType, KeysType>>;

export type UncompletedMessageResponse<T = any> = Omit<Message<T>, 'path'> & { completed: false; };
type CompletedMessageResponse = Omit<Message, 'body' | 'path'> & { completed: true; };

export type ErrorMessageResponse = {error: any; id: string; completed: true; };
export type SuccessfulMessageResponse<T = any> = UncompletedMessageResponse<T> | CompletedMessageResponse;

export type MessageResponse<T = any> = SuccessfulMessageResponse<T> | ErrorMessageResponse;
