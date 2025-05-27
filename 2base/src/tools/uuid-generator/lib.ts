export interface UUIDConfig {
  version: 1 | 4 | 7;
  quantity: number;
  format: UUIDFormat;
}

export interface GeneratedUUID {
  id: string;
  uuid: string;
  version: number;
  format: UUIDFormat;
  timestamp: Date;
}

export interface UUIDGeneratorState {
  config: UUIDConfig;
  generatedUUIDs: GeneratedUUID[];
  isGenerating: boolean;
}

export type UUIDFormat =
  | "standard" // 550e8400-e29b-41d4-a716-446655440000
  | "uppercase" // 550E8400-E29B-41D4-A716-446655440000
  | "no-hyphens" // 550e8400e29b41d4a716446655440000
  | "braces"; // {550e8400-e29b-41d4-a716-446655440000}

export class UUIDGenerator {
  private crypto: Crypto;

  constructor() {
    this.crypto = window.crypto;
  }

  // UUID v4: Random (most common)
  generateV4(): string {
    const bytes = new Uint8Array(16);
    this.crypto.getRandomValues(bytes);

    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

    return this.bytesToUUID(bytes);
  }

  // UUID v1: Time-based (simplified)
  generateV1(): string {
    const timestamp = BigInt(Date.now()) * 10000n + 122192928000000000n;
    const randomBytes = new Uint8Array(10);
    this.crypto.getRandomValues(randomBytes);

    const bytes = new Uint8Array(16);

    // Timestamp (simplified)
    const timestampHex = timestamp.toString(16).padStart(16, "0");
    for (let i = 0; i < 8; i++) {
      bytes[i] = parseInt(timestampHex.slice(i * 2, i * 2 + 2), 16);
    }

    // Version and variant
    bytes[6] = (bytes[6] & 0x0f) | 0x10; // Version 1
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

    // Random node and clock sequence
    for (let i = 8; i < 16; i++) {
      bytes[i] = randomBytes[i - 8];
    }

    return this.bytesToUUID(bytes);
  }

  // UUID v7: Unix timestamp-based
  generateV7(): string {
    const timestamp = BigInt(Date.now());
    const randomBytes = new Uint8Array(10);
    this.crypto.getRandomValues(randomBytes);

    const bytes = new Uint8Array(16);

    // 48-bit timestamp
    bytes[0] = Number((timestamp >> 40n) & 0xffn);
    bytes[1] = Number((timestamp >> 32n) & 0xffn);
    bytes[2] = Number((timestamp >> 24n) & 0xffn);
    bytes[3] = Number((timestamp >> 16n) & 0xffn);
    bytes[4] = Number((timestamp >> 8n) & 0xffn);
    bytes[5] = Number(timestamp & 0xffn);

    // Version and random data
    bytes[6] = (randomBytes[0] & 0x0f) | 0x70; // Version 7
    bytes[7] = randomBytes[1];
    bytes[8] = (randomBytes[2] & 0x3f) | 0x80; // Variant 10

    // Remaining random bytes
    for (let i = 9; i < 16; i++) {
      bytes[i] = randomBytes[i - 6];
    }

    return this.bytesToUUID(bytes);
  }

  // Generate multiple UUIDs
  generateBatch(config: UUIDConfig): GeneratedUUID[] {
    const results: GeneratedUUID[] = [];

    for (let i = 0; i < config.quantity; i++) {
      let uuid: string;

      switch (config.version) {
        case 1:
          uuid = this.generateV1();
          break;
        case 7:
          uuid = this.generateV7();
          break;
        default:
          uuid = this.generateV4();
      }

      const formattedUUID = this.formatUUID(uuid, config.format);

      results.push({
        id: `uuid-${i}`,
        uuid: formattedUUID,
        version: config.version,
        format: config.format,
        timestamp: new Date(),
      });
    }

    return results;
  }

  // Format conversion
  formatUUID(uuid: string, format: UUIDFormat): string {
    const clean = uuid.replace(/[^0-9a-f]/gi, "").toLowerCase();
    const formatted = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(
      12,
      16
    )}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;

    switch (format) {
      case "standard":
        return formatted;
      case "uppercase":
        return formatted.toUpperCase();
      case "no-hyphens":
        return clean;
      case "braces":
        return `{${formatted}}`;
      default:
        return formatted;
    }
  }

  // Helper method
  private bytesToUUID(bytes: Uint8Array): string {
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
}
