// Core data structures
export interface TimeZone {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: string; // IANA timezone identifier
  customLabel?: string;
  isFavorite: boolean;
  order: number;
  isLocal?: boolean;
}

export interface TimeDisplay {
  timezone: TimeZone;
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  utcOffset: string;
  isDST: boolean;
  dayPeriod: "dawn" | "morning" | "afternoon" | "evening" | "night";
  isBusinessHours: boolean;
  isWeekend: boolean;
  relativeTime: string;
}

export interface MeetingTime {
  baseTime: Date;
  baseTimezone: string;
  participants: TimeDisplay[];
  score: number;
  businessHoursCount: number;
  afterHoursCount: number;
  nightTimeCount: number;
}

export interface WorldClockState {
  timeZones: TimeZone[];
  currentTime: Date;
  selectedTimezone: string;
  baseTimezone: string;
  displayFormat: "12h" | "24h";
  showSeconds: boolean;
  showRelativeTime: boolean;
  compactMode: boolean;
  workingHours: { start: number; end: number };
  meetingMode: boolean;
  customTime: Date | null;
  meetingScheduler: {
    isOpen: boolean;
    selectedDate: Date;
    selectedTime: string;
    selectedTimezone: string;
  };
}

// Popular time zones for quick access
export const POPULAR_TIMEZONES: Omit<
  TimeZone,
  "id" | "order" | "isFavorite"
>[] = [
  {
    name: "New York",
    city: "New York",
    country: "United States",
    timezone: "America/New_York",
  },
  {
    name: "Los Angeles",
    city: "Los Angeles",
    country: "United States",
    timezone: "America/Los_Angeles",
  },
  {
    name: "London",
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
  },
  { name: "Paris", city: "Paris", country: "France", timezone: "Europe/Paris" },
  { name: "Tokyo", city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo" },
  {
    name: "Sydney",
    city: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
  },
  {
    name: "Singapore",
    city: "Singapore",
    country: "Singapore",
    timezone: "Asia/Singapore",
  },
  {
    name: "Hong Kong",
    city: "Hong Kong",
    country: "Hong Kong",
    timezone: "Asia/Hong_Kong",
  },
  { name: "Dubai", city: "Dubai", country: "UAE", timezone: "Asia/Dubai" },
  {
    name: "Mumbai",
    city: "Mumbai",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  {
    name: "Beijing",
    city: "Beijing",
    country: "China",
    timezone: "Asia/Shanghai",
  },
  {
    name: "São Paulo",
    city: "São Paulo",
    country: "Brazil",
    timezone: "America/Sao_Paulo",
  },
];

// World Clock Engine
export class WorldClockEngine {
  private timeZones: Map<string, TimeZone> = new Map();
  private localTimezone: string;

  constructor() {
    this.localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.loadFromStorage();
  }

  // Time zone management
  addTimeZone(timezone: Omit<TimeZone, "id" | "order">): TimeZone {
    // Check if timezone already exists
    const existing = Array.from(this.timeZones.values()).find(
      (tz) => tz.timezone === timezone.timezone
    );

    if (existing) {
      return existing;
    }

    const id = `${timezone.timezone}-${Date.now()}`;
    const newTimeZone: TimeZone = {
      ...timezone,
      id,
      order: this.timeZones.size,
      isFavorite: false,
    };

    this.timeZones.set(id, newTimeZone);
    this.saveToStorage();
    return newTimeZone;
  }

  removeTimeZone(id: string): void {
    this.timeZones.delete(id);
    this.saveToStorage();
  }

  updateTimeZone(id: string, updates: Partial<TimeZone>): void {
    const timezone = this.timeZones.get(id);
    if (timezone) {
      this.timeZones.set(id, { ...timezone, ...updates });
      this.saveToStorage();
    }
  }

  reorderTimeZones(fromIndex: number, toIndex: number): void {
    const timeZoneArray = Array.from(this.timeZones.values()).sort(
      (a, b) => a.order - b.order
    );
    const [movedItem] = timeZoneArray.splice(fromIndex, 1);
    timeZoneArray.splice(toIndex, 0, movedItem);

    timeZoneArray.forEach((tz, index) => {
      tz.order = index;
      this.timeZones.set(tz.id, tz);
    });

    this.saveToStorage();
  }

  getTimeZones(): TimeZone[] {
    return Array.from(this.timeZones.values()).sort(
      (a, b) => a.order - b.order
    );
  }

  // Time calculations
  getCurrentTimeInZone(timezone: string): Date {
    const now = new Date();
    const timeString = now.toLocaleString("en-US", { timeZone: timezone });
    return new Date(timeString);
  }

  formatTime(
    date: Date,
    timezone: string,
    format: "12h" | "24h",
    showSeconds = false
  ): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: format === "12h",
    };

    if (showSeconds) {
      options.second = "2-digit";
    }

    return date.toLocaleString("en-US", options);
  }

  formatDate(date: Date, timezone: string): string {
    return date.toLocaleDateString("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  getUTCOffset(timezone: string): string {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const targetTime = new Date(
      utc.toLocaleString("en-US", { timeZone: timezone })
    );
    const offsetMs = targetTime.getTime() - utc.getTime();
    const offsetHours = offsetMs / (1000 * 60 * 60);

    const sign = offsetHours >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offsetHours));
    const minutes = Math.round((Math.abs(offsetHours) - hours) * 60);

    return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  isDST(timezone: string): boolean {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);

    const janOffset = this.getTimezoneOffset(jan, timezone);
    const julOffset = this.getTimezoneOffset(jul, timezone);
    const nowOffset = this.getTimezoneOffset(now, timezone);

    return nowOffset !== Math.max(janOffset, julOffset);
  }

  private getTimezoneOffset(date: Date, timezone: string): number {
    const utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const targetTime = new Date(
      utc.toLocaleString("en-US", { timeZone: timezone })
    );
    return (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
  }

  getRelativeTime(
    targetTimezone: string,
    baseTimezone: string = this.localTimezone
  ): string {
    const now = new Date();
    const targetOffset = this.getTimezoneOffset(now, targetTimezone);
    const baseOffset = this.getTimezoneOffset(now, baseTimezone);
    const diffHours = targetOffset - baseOffset;

    if (Math.abs(diffHours) < 0.5) return "Same time";

    const hours = Math.abs(diffHours);
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    let timeStr = "";
    if (wholeHours > 0) timeStr += `${wholeHours}h`;
    if (minutes > 0) timeStr += `${minutes}m`;

    return diffHours > 0 ? `${timeStr} ahead` : `${timeStr} behind`;
  }

  // Day/Night calculation
  getDayPeriod(
    date: Date,
    timezone: string
  ): "dawn" | "morning" | "afternoon" | "evening" | "night" {
    const timeInZone = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    );
    const hour = timeInZone.getHours();

    if (hour >= 5 && hour < 7) return "dawn";
    if (hour >= 7 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 20) return "evening";
    return "night";
  }

  getDayPeriodIcon(period: string): string {
    switch (period) {
      case "dawn":
        return "🌅";
      case "morning":
        return "🌞";
      case "afternoon":
        return "☀️";
      case "evening":
        return "🌆";
      case "night":
        return "🌙";
      default:
        return "🕐";
    }
  }

  isBusinessHours(
    date: Date,
    timezone: string,
    workingHours = { start: 9, end: 18 }
  ): boolean {
    const timeInZone = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    );
    const hour = timeInZone.getHours();
    const day = timeInZone.getDay();

    // Weekend check (0 = Sunday, 6 = Saturday)
    if (day === 0 || day === 6) return false;

    // Custom working hours
    return hour >= workingHours.start && hour < workingHours.end;
  }

  isWeekend(date: Date, timezone: string): boolean {
    const timeInZone = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    );
    const day = timeInZone.getDay();
    return day === 0 || day === 6;
  }

  // Generate time display data
  generateTimeDisplay(
    timezone: TimeZone,
    currentTime: Date,
    format: "12h" | "24h",
    showSeconds: boolean,
    workingHours = { start: 9, end: 18 }
  ): TimeDisplay {
    return {
      timezone,
      currentTime,
      formattedTime: this.formatTime(
        currentTime,
        timezone.timezone,
        format,
        showSeconds
      ),
      formattedDate: this.formatDate(currentTime, timezone.timezone),
      utcOffset: this.getUTCOffset(timezone.timezone),
      isDST: this.isDST(timezone.timezone),
      dayPeriod: this.getDayPeriod(currentTime, timezone.timezone),
      isBusinessHours: this.isBusinessHours(
        currentTime,
        timezone.timezone,
        workingHours
      ),
      isWeekend: this.isWeekend(currentTime, timezone.timezone),
      relativeTime: this.getRelativeTime(timezone.timezone),
    };
  }

  // Meeting scheduler
  findBestMeetingTimes(date: Date, timezones: TimeZone[]): MeetingTime[] {
    const suggestions: MeetingTime[] = [];

    // Check every hour from 6 AM to 10 PM in the local timezone
    for (let hour = 6; hour <= 22; hour++) {
      const meetingTime = new Date(date);
      meetingTime.setHours(hour, 0, 0, 0);

      const participants = timezones.map((tz) =>
        this.generateTimeDisplay(tz, meetingTime, "24h", false)
      );

      const score = this.calculateMeetingScore(participants);
      const businessHoursCount = participants.filter(
        (p) => p.isBusinessHours
      ).length;
      const afterHoursCount = participants.filter(
        (p) => !p.isBusinessHours && p.dayPeriod !== "night"
      ).length;
      const nightTimeCount = participants.filter(
        (p) => p.dayPeriod === "night"
      ).length;

      suggestions.push({
        baseTime: meetingTime,
        baseTimezone: this.localTimezone,
        participants,
        score,
        businessHoursCount,
        afterHoursCount,
        nightTimeCount,
      });
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  private calculateMeetingScore(participants: TimeDisplay[]): number {
    let score = 0;

    participants.forEach((participant) => {
      if (participant.isBusinessHours) {
        score += 30;
      } else if (
        participant.dayPeriod === "morning" ||
        participant.dayPeriod === "afternoon"
      ) {
        score += 20;
      } else if (participant.dayPeriod === "evening") {
        score += 10;
      } else if (participant.dayPeriod === "dawn") {
        score += 5;
      }
      // Night time gets 0 points

      if (!participant.isWeekend) {
        score += 10;
      }
    });

    return Math.min(100, Math.round(score / participants.length));
  }

  // Storage
  private saveToStorage(): void {
    const data = {
      timeZones: Array.from(this.timeZones.values()),
      version: "1.0.0",
    };
    localStorage.setItem("world-clock-data", JSON.stringify(data));
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("world-clock-data");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.timeZones && Array.isArray(data.timeZones)) {
          data.timeZones.forEach((tz: TimeZone) => {
            this.timeZones.set(tz.id, tz);
          });
        }
      }
    } catch (error) {
      console.warn("Failed to load world clock data from storage:", error);
    }
  }

  // Search functionality
  searchTimeZones(
    query: string
  ): Omit<TimeZone, "id" | "order" | "isFavorite">[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return POPULAR_TIMEZONES;

    // First search in popular timezones
    const popularResults = POPULAR_TIMEZONES.filter(
      (tz) =>
        tz.name.toLowerCase().includes(normalizedQuery) ||
        tz.city.toLowerCase().includes(normalizedQuery) ||
        tz.country.toLowerCase().includes(normalizedQuery) ||
        tz.timezone.toLowerCase().includes(normalizedQuery)
    );

    // If we have popular results, return them
    if (popularResults.length > 0) {
      return popularResults;
    }

    // Otherwise, try to match IANA timezone identifiers
    const ianaResults = this.searchIANATimezones(normalizedQuery);
    return ianaResults;
  }

  private searchIANATimezones(
    query: string
  ): Omit<TimeZone, "id" | "order" | "isFavorite">[] {
    // Common IANA timezone identifiers
    const commonTimezones = [
      "Africa/Cairo",
      "Africa/Johannesburg",
      "Africa/Lagos",
      "Africa/Nairobi",
      "America/Argentina/Buenos_Aires",
      "America/Bogota",
      "America/Caracas",
      "America/Chicago",
      "America/Denver",
      "America/Lima",
      "America/Los_Angeles",
      "America/Mexico_City",
      "America/New_York",
      "America/Phoenix",
      "America/Santiago",
      "America/Sao_Paulo",
      "Asia/Bangkok",
      "Asia/Calcutta",
      "Asia/Dubai",
      "Asia/Hong_Kong",
      "Asia/Jakarta",
      "Asia/Karachi",
      "Asia/Manila",
      "Asia/Seoul",
      "Asia/Shanghai",
      "Asia/Singapore",
      "Asia/Taipei",
      "Asia/Tehran",
      "Asia/Tokyo",
      "Australia/Adelaide",
      "Australia/Brisbane",
      "Australia/Melbourne",
      "Australia/Perth",
      "Australia/Sydney",
      "Europe/Amsterdam",
      "Europe/Berlin",
      "Europe/Brussels",
      "Europe/Istanbul",
      "Europe/London",
      "Europe/Madrid",
      "Europe/Moscow",
      "Europe/Paris",
      "Europe/Rome",
      "Europe/Stockholm",
      "Europe/Vienna",
      "Europe/Warsaw",
      "Pacific/Auckland",
      "Pacific/Fiji",
      "Pacific/Honolulu",
      "Pacific/Tahiti",
    ];

    const results: Omit<TimeZone, "id" | "order" | "isFavorite">[] = [];

    for (const timezone of commonTimezones) {
      if (timezone.toLowerCase().includes(query)) {
        // Parse timezone identifier to extract city and region
        const parts = timezone.split("/");
        const city = parts[parts.length - 1].replace(/_/g, " ");
        const region = parts.length > 1 ? parts[0].replace(/_/g, " ") : "";

        results.push({
          name: city,
          city: city,
          country: region,
          timezone: timezone,
        });

        // Limit results to avoid overwhelming the UI
        if (results.length >= 20) break;
      }
    }

    return results;
  }

  // Auto-detect local timezone
  addLocalTimeZone(): TimeZone | null {
    // Check if local timezone already exists
    const existingLocal = Array.from(this.timeZones.values()).find(
      (tz) => tz.timezone === this.localTimezone || tz.isLocal
    );

    if (existingLocal) {
      return existingLocal;
    }

    const localTz = POPULAR_TIMEZONES.find(
      (tz) => tz.timezone === this.localTimezone
    );

    if (localTz) {
      return this.addTimeZone({
        ...localTz,
        customLabel: "Your Local Time",
        isLocal: true,
        isFavorite: false,
      });
    }

    // If not in popular timezones, create a generic local timezone entry
    return this.addTimeZone({
      name: "Local Time",
      city: "Local",
      country: "Local",
      timezone: this.localTimezone,
      customLabel: "Your Local Time",
      isLocal: true,
      isFavorite: false,
    });
  }
}
