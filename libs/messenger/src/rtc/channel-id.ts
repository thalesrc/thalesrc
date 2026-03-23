/**
 * Generates a deterministic integer in [0, 1023] from a channel name string.
 * Used as the negotiated data channel ID for RTCDataChannel.
 *
 * Uses FNV-1a hash algorithm truncated to 10 bits.
 *
 * @param name - The channel name to hash
 * @returns A deterministic channel ID in [0, 1023]
 */
export function channelId(name: string): number {
  let hash = 0x811c9dc5; // FNV offset basis (32-bit)

  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, keep as unsigned 32-bit
  }

  // Truncate to 10-bit range [0, 1023]
  return hash % 1024;
}
