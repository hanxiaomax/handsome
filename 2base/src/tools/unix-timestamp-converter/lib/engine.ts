import type {
  TimestampFormat,
  FormattedDate,
  TimezoneInfo,
  ConversionResult,
  CodeExample,
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
   * Generate enhanced formatted dates with all supported formats
   */
  private generateFormattedDates(date: Date): FormattedDate {
    // US Format: 05/29/2025 @ 3:28pm UTC
    const usFormat = this.formatUSStyle(date);

    // RFC 2822 Alternative: Thursday, 29-May-25 15:28:02 UTC
    const rfc2822Alternative = this.formatRFC2822Alternative(date);

    return {
      iso8601: date.toISOString(),
      iso8601Extended: date
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d{3}Z$/, " UTC"),
      rfc2822: date.toUTCString(),
      rfc2822Alternative,
      rfc3339: date.toISOString(),
      usFormat,
      locale: date.toLocaleString(),
      localeDate: date.toLocaleDateString(),
      localeTime: date.toLocaleTimeString(),
    };
  }

  /**
   * Format date in US style: 05/29/2025 @ 3:28pm UTC
   */
  private formatUSStyle(date: Date): string {
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();

    let hour = date.getUTCHours();
    const minute = String(date.getUTCMinutes()).padStart(2, "0");
    const ampm = hour >= 12 ? "pm" : "am";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${month}/${day}/${year} @ ${hour}:${minute}${ampm} UTC`;
  }

  /**
   * Format date in RFC 2822 alternative style: Thursday, 29-May-25 15:28:02 UTC
   */
  private formatRFC2822Alternative(date: Date): string {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const weekday = weekdays[date.getUTCDay()];
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = months[date.getUTCMonth()];
    const year = String(date.getUTCFullYear()).slice(-2);
    const hour = String(date.getUTCHours()).padStart(2, "0");
    const minute = String(date.getUTCMinutes()).padStart(2, "0");
    const second = String(date.getUTCSeconds()).padStart(2, "0");

    return `${weekday}, ${day}-${month}-${year} ${hour}:${minute}:${second} UTC`;
  }

  /**
   * Convert Unix timestamp to human-readable date with enhanced formatting
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

    // Generate enhanced formatted dates
    const formatted: FormattedDate = this.generateFormattedDates(date);

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
  convertDateToTimestamp(input: string): ConversionResult | null {
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

    // Generate enhanced formatted dates
    const formatted: FormattedDate = this.generateFormattedDates(date);

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
   * Convert Date with time to Unix timestamp
   */
  convertDatePickerToTimestamp(
    date: Date,
    time: { hour: number; minute: number; second: number }
  ): ConversionResult | null {
    try {
      // Create new date with the selected time
      const combinedDate = new Date(date);
      combinedDate.setHours(time.hour, time.minute, time.second, 0);

      if (isNaN(combinedDate.getTime())) {
        return null;
      }

      const timestampMs = combinedDate.getTime();

      // Generate all timestamp formats
      const timestamp: TimestampFormat = {
        seconds: Math.floor(timestampMs / 1000),
        milliseconds: timestampMs,
        microseconds: timestampMs * 1000,
      };

      // Generate enhanced formatted dates
      const formatted: FormattedDate =
        this.generateFormattedDates(combinedDate);

      // Generate timezone-specific times
      const timezones = this.timezones.slice(0, 6).map((tz) => ({
        timezone: tz,
        formatted: this.formatDateInTimezone(combinedDate, tz.id),
      }));

      // Generate relative time
      const relative = this.formatRelativeTime(timestamp.seconds);

      const inputString = `${combinedDate.toLocaleDateString()} ${String(
        time.hour
      ).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}:${String(
        time.second
      ).padStart(2, "0")}`;

      return {
        input: inputString,
        timestamp,
        formatted,
        timezones,
        relative,
      };
    } catch {
      return null;
    }
  }

  /**
   * Convert timestamp to Date and time
   */
  convertTimestampToDatePicker(
    timestamp: number,
    format: TimestampInputFormat
  ): {
    date: Date;
    time: { hour: number; minute: number; second: number };
  } | null {
    try {
      let timestampMs: number;

      // Convert to milliseconds based on input format
      switch (format) {
        case "seconds":
          timestampMs = timestamp * 1000;
          break;
        case "milliseconds":
          timestampMs = timestamp;
          break;
        case "microseconds":
          timestampMs = timestamp / 1000;
          break;
        default:
          return null;
      }

      const date = new Date(timestampMs);
      if (isNaN(date.getTime())) {
        return null;
      }

      return {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        time: {
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds(),
        },
      };
    } catch {
      return null;
    }
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
   * Get code examples for creating timestamps
   */
  getCodeExamples(timestamp: number): CodeExample[] {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return [
      {
        language: "javascript",
        name: "JavaScript",
        description: "Create timestamp using Date object",
        code: `// Current timestamp
Math.floor(Date.now() / 1000)

// Specific date
Math.floor(new Date(${year}, ${
          month - 1
        }, ${day}, ${hour}, ${minute}, ${second}).getTime() / 1000)

// From ISO string
Math.floor(new Date("${date.toISOString()}").getTime() / 1000)`,
      },
      {
        language: "python",
        name: "Python",
        description: "Create timestamp using datetime and time modules",
        code: `import time
import datetime

# Current timestamp
int(time.time())

# From datetime object
datetime.datetime(${year}, ${month}, ${day}, ${hour}, ${minute}, ${second}).timestamp()

# From ISO string
datetime.datetime.fromisoformat("${date
          .toISOString()
          .replace("Z", "+00:00")}").timestamp()`,
      },
    ];
  }
}
