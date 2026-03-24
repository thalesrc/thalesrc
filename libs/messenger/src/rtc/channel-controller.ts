class ChannelController {
  static #DEFAULT_MAX_CHANNELS = 1024;

  #connections = new WeakMap<RTCPeerConnection, Record<number, RTCDataChannel>>();
  #channels = new WeakMap<RTCDataChannel, number>();

  getChannel(connection: RTCPeerConnection, channelName: string): RTCDataChannel {
    const id = this.#getChannelId(channelName);

    let channels = this.#connections.get(connection);

    if (!channels) {
      channels = {};
      this.#connections.set(connection, channels);
    }

    let channel = channels[id];

    if (!channel) {
      channel = connection.createDataChannel(channelName, { negotiated: true, id, ordered: false });
      this.#channels.set(channel, 0);
      channels[id] = channel;
    }

    this.#channels.set(channel, (this.#channels.get(channel) ?? 0) + 1); // Increment reference count

    return channel;
  }

  close(channel: RTCDataChannel): void {
    const count = this.#channels.get(channel);

    if (count === undefined) return;

    if (count <= 1) {
      channel.close();
      this.#channels.delete(channel);
    } else {
      this.#channels.set(channel, count - 1); // Decrement reference count
    }
  }

  #getChannelId(channelName: string): number {
    let hash = 0x811c9dc5; // FNV offset basis (32-bit)

    for (let i = 0; i < channelName.length; i++) {
      hash ^= channelName.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0; // FNV prime, keep as unsigned 32-bit
    }

    // Truncate to specified range [0, max-1]
    return hash % ChannelController.#DEFAULT_MAX_CHANNELS;
  }
}

export const CHANNEL_CONTROLLER = new ChannelController();
