const DEFAULT_MAX_CHANNELS = 1024;

/**
 * Generates a deterministic integer in [0, 1023] from a channel name string.
 * Used as the negotiated data channel ID for RTCDataChannel.
 *
 * Uses FNV-1a hash algorithm truncated to 10 bits.
 *
 * @param name - The channel name to hash
 * @param max - Optional maximum value for the channel ID. Defaults to 1024.
 * @returns A deterministic channel ID in [0, max-1]
 */
export function channelId(name: string, max: number | null = DEFAULT_MAX_CHANNELS): number {
  let hash = 0x811c9dc5; // FNV offset basis (32-bit)

  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, keep as unsigned 32-bit
  }

  // Truncate to specified range [0, max-1]
  return hash % (max ?? DEFAULT_MAX_CHANNELS);
}
