export interface TimestampFormat {
  seconds: number;
  milliseconds: number;
  microseconds: number;
}

export interface FormattedDate {
  iso8601: string;
  rfc2822: string;
  locale: string;
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
  inputType: "timestamp" | "datetime";
  selectedFormat: "seconds" | "milliseconds" | "microseconds";
  selectedTimezone: string;
  outputFormat: string;
  showTimezones: boolean;
  showRelative: boolean;
  batchInput: string;
  batchResults: ConversionResult[];
  history: ConversionHistory[];
  isProcessing: boolean;
  error: string | null;
}

export interface ConversionHistory {
  id: string;
  timestamp: Date;
  input: string;
  inputType: "timestamp" | "datetime";
  result: ConversionResult;
}

export type TimestampInputFormat = "seconds" | "milliseconds" | "microseconds";
export type InputType = "timestamp" | "datetime";
export type OutputFormat = "iso8601" | "rfc2822" | "locale" | "custom";
