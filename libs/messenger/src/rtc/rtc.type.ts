/** An RTCPeerConnection instance or `undefined` if not yet available. */
export type RTCConnectionType = RTCPeerConnection | undefined;

/** A promise that resolves to an RTCPeerConnection (or `undefined`). */
export type RTCConnectionPromise = Promise<RTCConnectionType>;

/** A factory function that returns an RTCPeerConnection synchronously or asynchronously. */
export type RTCConnectionFactory = () => RTCConnectionType | RTCConnectionPromise;

/**
 * Flexible connection argument accepted by RTC message classes.
 *
 * Supports direct instances, promises, and factory functions for lazy or async initialization.
 */
export type RTCConnectionArg = RTCConnectionType | RTCConnectionPromise | RTCConnectionFactory;
