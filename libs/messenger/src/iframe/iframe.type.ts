export type IFrameType = HTMLIFrameElement | undefined;
export type IFramePromise = Promise<IFrameType>;
export type IFrameFactory = () => IFrameType | IFramePromise;
export type IFrameArg = IFrameType | IFramePromise | IFrameFactory;
