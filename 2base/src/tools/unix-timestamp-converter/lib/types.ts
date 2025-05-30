export interface TimestampFormat {
  seconds: number;
  milliseconds: number;
  microseconds: number;
}

export interface FormattedDate {
  iso8601: string;
  iso8601Extended: string;
  rfc2822: string;
  rfc2822Alternative: string;
  rfc3339: string;
  usFormat: string;
  locale: string;
  localeDate: string;
  localeTime: string;
  custom?: string;
}

export interface TimezoneInfo {
  id: string;
  name: string;
  abbreviation: string;
  offset: string;
}

export interface ConversionResult {
  input: string;
  timestamp: TimestampFormat;
  formatted: FormattedDate;
  timezones: Array<{
    timezone: TimezoneInfo;
    formatted: string;
  }>;
  relative: {
    past?: string;
    future?: string;
  };
}

export interface ConverterState {
  currentTimestamp: number;
  inputValue: string;
  inputType: "timestamp" | "datetime" | "datepicker";
  selectedFormat: "seconds" | "milliseconds" | "microseconds";
  selectedDate: Date | undefined;
  selectedTime: { hour: number; minute: number; second: number };
  showCodeExamples: boolean;
  isProcessing: boolean;
  error: string | null;
}

export interface CodeExample {
  language: string;
  name: string;
  code: string;
  description: string;
}

export type TimestampInputFormat = "seconds" | "milliseconds" | "microseconds";
export type InputType = "timestamp" | "datetime" | "datepicker";
export type OutputFormat = "iso8601" | "rfc2822" | "locale" | "custom";
