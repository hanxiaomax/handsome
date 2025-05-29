import type {
  TimestampFormat,
  FormattedDate,
  TimezoneInfo,
  ConversionResult,
  TimestampInputFormat,
} from "./types";

export class UnixTimestampEngine {
  private timezones: TimezoneInfo[] = [
    {
      id: "UTC",
      name: "Coordinated Universal Time",
      abbreviation: "UTC",
      offset: "+00:00",
    },
    {
      id: "EST",
      name: "Eastern Standard Time",
      abbreviation: "EST",
      offset: "-05:00",
    },
    {
      id: "PST",
      name: "Pacific Standard Time",
      abbreviation: "PST",
      offset: "-08:00",
    },
    {
      id: "GMT",
      name: "Greenwich Mean Time",
      abbreviation: "GMT",
      offset: "+00:00",
    },
    {
      id: "JST",
      name: "Japan Standard Time",
      abbreviation: "JST",
      offset: "+09:00",
    },
    {
      id: "CET",
      name: "Central European Time",
      abbreviation: "CET",
      offset: "+01:00",
    },
    {
      id: "IST",
      name: "India Standard Time",
      abbreviation: "IST",
      offset: "+05:30",
    },
    {
      id: "CST",
      name: "China Standard Time",
      abbreviation: "CST",
      offset: "+08:00",
    },
  ];

  /**
   * Get current Unix timestamp in all formats
   */
  getCurrentTimestamp(): TimestampFormat {
    const now = Date.now();
    return {
      seconds: Math.floor(now / 1000),
      milliseconds: now,
      microseconds: now * 1000,
    };
  }

  /**
   * Get available timezones
   */
  getTimezones(): TimezoneInfo[] {
    return this.timezones;
  }

  /**
   * Validate input based on type
   */
  validateInput(input: string, type: "timestamp" | "datetime"): boolean {
    if (!input || input.trim() === "") return false;

    if (type === "timestamp") {
      // Validate numeric timestamp
      const num = Number(input.trim());
      return !isNaN(num) && isFinite(num) && num > 0;
    } else {
      // Validate date string
      const date = new Date(input.trim());
      return !isNaN(date.getTime());
    }
  }

  /**
   * Convert Unix timestamp to human-readable date
   */
  convertSingleTimestamp(
    input: string,
    format: TimestampInputFormat
  ): ConversionResult | null {
    if (!this.validateInput(input, "timestamp")) {
      return null;
    }

    const inputNum = Number(input.trim());
    let timestampMs: number;

    // Convert to milliseconds based on input format
    switch (format) {
      case "seconds":
        timestampMs = inputNum * 1000;
        break;
      case "milliseconds":
        timestampMs = inputNum;
        break;
      case "microseconds":
        timestampMs = inputNum / 1000;
        break;
      default:
        return null;
    }

    // Validate timestamp range (reasonable limits)
    if (timestampMs < 0 || timestampMs > 4102444800000) {
      // Year 2100
      return null;
    }

    const date = new Date(timestampMs);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Generate all timestamp formats
    const timestamp: TimestampFormat = {
      seconds: Math.floor(timestampMs / 1000),
      milliseconds: timestampMs,
      microseconds: timestampMs * 1000,
    };

    // Generate formatted dates
    const formatted: FormattedDate = {
      iso8601: date.toISOString(),
      rfc2822: date.toUTCString(),
      locale: date.toLocaleString(),
    };

    // Generate timezone-specific times
    const timezones = this.timezones.slice(0, 6).map((tz) => ({
      timezone: tz,
      formatted: this.formatDateInTimezone(date, tz.id),
    }));

    // Generate relative time
    const relative = this.formatRelativeTime(timestamp.seconds);

    return {
      input: input.trim(),
      timestamp,
      formatted,
      timezones,
      relative,
    };
  }

  /**
   * Convert date string to Unix timestamp
   */
  convertDateToTimestamp(
    input: string,
    timezone?: string
  ): ConversionResult | null {
    if (!this.validateInput(input, "datetime")) {
      return null;
    }

    let date: Date;

    try {
      // Try to parse the date string
      date = new Date(input.trim());

      if (isNaN(date.getTime())) {
        return null;
      }
    } catch {
      return null;
    }

    const timestampMs = date.getTime();

    // Generate all timestamp formats
    const timestamp: TimestampFormat = {
      seconds: Math.floor(timestampMs / 1000),
      milliseconds: timestampMs,
      microseconds: timestampMs * 1000,
    };

    // Generate formatted dates
    const formatted: FormattedDate = {
      iso8601: date.toISOString(),
      rfc2822: date.toUTCString(),
      locale: date.toLocaleString(),
    };

    // Generate timezone-specific times
    const timezones = this.timezones.slice(0, 6).map((tz) => ({
      timezone: tz,
      formatted: this.formatDateInTimezone(date, tz.id),
    }));

    // Generate relative time
    const relative = this.formatRelativeTime(timestamp.seconds);

    return {
      input: input.trim(),
      timestamp,
      formatted,
      timezones,
      relative,
    };
  }

  /**
   * Format date in specific timezone
   */
  private formatDateInTimezone(date: Date, timezoneId: string): string {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone:
          timezoneId === "UTC"
            ? "UTC"
            : timezoneId === "EST"
            ? "America/New_York"
            : timezoneId === "PST"
            ? "America/Los_Angeles"
            : timezoneId === "GMT"
            ? "Europe/London"
            : timezoneId === "JST"
            ? "Asia/Tokyo"
            : timezoneId === "CET"
            ? "Europe/Paris"
            : timezoneId === "IST"
            ? "Asia/Kolkata"
            : timezoneId === "CST"
            ? "Asia/Shanghai"
            : "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      return formatter.format(date);
    } catch {
      return date.toISOString();
    }
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(timestamp: number): { past?: string; future?: string } {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    const absDiff = Math.abs(diff);

    if (absDiff < 60) {
      return diff > 0 ? { past: "just now" } : { future: "just now" };
    } else if (absDiff < 3600) {
      const minutes = Math.floor(absDiff / 60);
      const text = `${minutes} minute${minutes !== 1 ? "s" : ""} ${
        diff > 0 ? "ago" : "from now"
      }`;
      return diff > 0 ? { past: text } : { future: text };
    } else if (absDiff < 86400) {
      const hours = Math.floor(absDiff / 3600);
      const text = `${hours} hour${hours !== 1 ? "s" : ""} ${
        diff > 0 ? "ago" : "from now"
      }`;
      return diff > 0 ? { past: text } : { future: text };
    } else if (absDiff < 2592000) {
      const days = Math.floor(absDiff / 86400);
      const text = `${days} day${days !== 1 ? "s" : ""} ${
        diff > 0 ? "ago" : "from now"
      }`;
      return diff > 0 ? { past: text } : { future: text };
    } else if (absDiff < 31536000) {
      const months = Math.floor(absDiff / 2592000);
      const text = `${months} month${months !== 1 ? "s" : ""} ${
        diff > 0 ? "ago" : "from now"
      }`;
      return diff > 0 ? { past: text } : { future: text };
    } else {
      const years = Math.floor(absDiff / 31536000);
      const text = `${years} year${years !== 1 ? "s" : ""} ${
        diff > 0 ? "ago" : "from now"
      }`;
      return diff > 0 ? { past: text } : { future: text };
    }
  }

  /**
   * Parse batch input into individual timestamps
   */
  parseBatchInput(input: string): string[] {
    if (!input || input.trim() === "") return [];

    return input
      .trim()
      .split(/[\n,\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  /**
   * Process batch conversion
   */
  processBatchConversion(
    inputs: string[],
    format: TimestampInputFormat
  ): ConversionResult[] {
    const results: ConversionResult[] = [];

    for (const input of inputs) {
      const result = this.convertSingleTimestamp(input, format);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Generate CSV content from batch results
   */
  generateCSV(results: ConversionResult[]): string {
    const headers = [
      "Input",
      "Seconds",
      "Milliseconds",
      "Microseconds",
      "ISO 8601",
      "RFC 2822",
      "Locale",
      "Relative",
    ];

    const rows = results.map((result) => [
      result.input,
      result.timestamp.seconds.toString(),
      result.timestamp.milliseconds.toString(),
      result.timestamp.microseconds.toString(),
      result.formatted.iso8601,
      result.formatted.rfc2822,
      result.formatted.locale,
      result.relative.past || result.relative.future || "",
    ]);

    return [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
  }

  /**
   * Download CSV file
   */
  downloadCSV(results: ConversionResult[], filename?: string): void {
    const csvContent = this.generateCSV(results);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        filename || `timestamp-conversions-${Date.now()}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}
