import { UnitConverter } from "./graph-engine";

export function createUnitConverter(): UnitConverter {
  const converter = new UnitConverter();

  // Length units
  converter.addUnit("meter", "length", "m", "Meter");
  converter.addUnit("centimeter", "length", "cm", "Centimeter");
  converter.addUnit("millimeter", "length", "mm", "Millimeter");
  converter.addUnit("kilometer", "length", "km", "Kilometer");
  converter.addUnit("inch", "length", "in", "Inch");
  converter.addUnit("foot", "length", "ft", "Foot");
  converter.addUnit("yard", "length", "yd", "Yard");
  converter.addUnit("mile", "length", "mi", "Mile");

  // Length conversions
  converter.addLinearConversion("meter", "centimeter", 100);
  converter.addLinearConversion("meter", "millimeter", 1000);
  converter.addLinearConversion("meter", "kilometer", 0.001);
  converter.addLinearConversion("meter", "inch", 39.3701);
  converter.addLinearConversion("meter", "foot", 3.28084);
  converter.addLinearConversion("meter", "yard", 1.09361);
  converter.addLinearConversion("meter", "mile", 0.000621371);

  // Weight units
  converter.addUnit("kilogram", "weight", "kg", "Kilogram");
  converter.addUnit("gram", "weight", "g", "Gram");
  converter.addUnit("pound", "weight", "lb", "Pound");
  converter.addUnit("ounce", "weight", "oz", "Ounce");
  converter.addUnit("ton", "weight", "t", "Metric Ton");

  // Weight conversions
  converter.addLinearConversion("kilogram", "gram", 1000);
  converter.addLinearConversion("kilogram", "pound", 2.20462);
  converter.addLinearConversion("kilogram", "ounce", 35.274);
  converter.addLinearConversion("kilogram", "ton", 0.001);

  // Temperature units
  converter.addUnit("celsius", "temperature", "°C", "Celsius");
  converter.addUnit("fahrenheit", "temperature", "°F", "Fahrenheit");
  converter.addUnit("kelvin", "temperature", "K", "Kelvin");

  // Temperature conversions (non-linear)
  converter.addConversion(
    "celsius",
    "fahrenheit",
    (c: number) => (c * 9) / 5 + 32,
    (f: number) => ((f - 32) * 5) / 9
  );
  converter.addConversion(
    "celsius",
    "kelvin",
    (c: number) => c + 273.15,
    (k: number) => k - 273.15
  );

  // Speed units
  converter.addUnit("meter_per_second", "speed", "m/s", "Meter per second");
  converter.addUnit(
    "kilometer_per_hour",
    "speed",
    "km/h",
    "Kilometer per hour"
  );
  converter.addUnit("mile_per_hour", "speed", "mph", "Mile per hour");
  converter.addUnit("foot_per_second", "speed", "ft/s", "Foot per second");
  converter.addUnit("knot", "speed", "kn", "Knot");
  converter.addUnit("mach", "speed", "Ma", "Mach");

  // Speed conversions
  converter.addLinearConversion("meter_per_second", "kilometer_per_hour", 3.6);
  converter.addLinearConversion("meter_per_second", "mile_per_hour", 2.23694);
  converter.addLinearConversion("meter_per_second", "foot_per_second", 3.28084);
  converter.addLinearConversion("meter_per_second", "knot", 1.94384);
  converter.addLinearConversion("meter_per_second", "mach", 0.00293866);

  // Data storage units
  converter.addUnit("byte", "digital", "B", "Byte");
  converter.addUnit("kilobyte", "digital", "KB", "Kilobyte");
  converter.addUnit("megabyte", "digital", "MB", "Megabyte");
  converter.addUnit("gigabyte", "digital", "GB", "Gigabyte");
  converter.addUnit("terabyte", "digital", "TB", "Terabyte");
  converter.addUnit("petabyte", "digital", "PB", "Petabyte");
  converter.addUnit("kibibyte", "digital", "KiB", "Kibibyte");
  converter.addUnit("mebibyte", "digital", "MiB", "Mebibyte");
  converter.addUnit("gibibyte", "digital", "GiB", "Gibibyte");
  converter.addUnit("tebibyte", "digital", "TiB", "Tebibyte");
  converter.addUnit("pebibyte", "digital", "PiB", "Pebibyte");
  converter.addUnit("bit", "digital", "bit", "Bit");
  converter.addUnit("kilobit", "digital", "Kbit", "Kilobit");

  // Data storage conversions (decimal)
  converter.addLinearConversion("byte", "kilobyte", 0.001);
  converter.addLinearConversion("byte", "megabyte", 0.000001);
  converter.addLinearConversion("byte", "gigabyte", 0.000000001);
  converter.addLinearConversion("byte", "terabyte", 0.000000000001);
  converter.addLinearConversion("byte", "petabyte", 0.000000000000001);

  // Data storage conversions (binary)
  converter.addLinearConversion("byte", "kibibyte", 1 / 1024);
  converter.addLinearConversion("byte", "mebibyte", 1 / (1024 * 1024));
  converter.addLinearConversion("byte", "gibibyte", 1 / (1024 * 1024 * 1024));
  converter.addLinearConversion(
    "byte",
    "tebibyte",
    1 / (1024 * 1024 * 1024 * 1024)
  );
  converter.addLinearConversion(
    "byte",
    "pebibyte",
    1 / (1024 * 1024 * 1024 * 1024 * 1024)
  );

  // Bit conversions
  converter.addLinearConversion("byte", "bit", 8);
  converter.addLinearConversion("bit", "kilobit", 0.001);

  // Area units
  converter.addUnit("square_meter", "area", "m²", "Square meter");
  converter.addUnit("square_centimeter", "area", "cm²", "Square centimeter");
  converter.addUnit("square_kilometer", "area", "km²", "Square kilometer");
  converter.addUnit("square_inch", "area", "in²", "Square inch");
  converter.addUnit("square_foot", "area", "ft²", "Square foot");
  converter.addUnit("acre", "area", "ac", "Acre");
  converter.addUnit("hectare", "area", "ha", "Hectare");

  // Area conversions
  converter.addLinearConversion("square_meter", "square_centimeter", 10000);
  converter.addLinearConversion("square_meter", "square_kilometer", 0.000001);
  converter.addLinearConversion("square_meter", "square_inch", 1550.0031);
  converter.addLinearConversion("square_meter", "square_foot", 10.7639);
  converter.addLinearConversion("square_meter", "acre", 0.000247105);
  converter.addLinearConversion("square_meter", "hectare", 0.0001);

  // Volume units
  converter.addUnit("cubic_meter", "volume", "m³", "Cubic meter");
  converter.addUnit("liter", "volume", "L", "Liter");
  converter.addUnit("milliliter", "volume", "mL", "Milliliter");
  converter.addUnit("gallon", "volume", "gal", "Gallon (US)");
  converter.addUnit("quart", "volume", "qt", "Quart (US)");
  converter.addUnit("pint", "volume", "pt", "Pint (US)");
  converter.addUnit("cup", "volume", "cup", "Cup (US)");
  converter.addUnit("fluid_ounce", "volume", "fl oz", "Fluid ounce (US)");

  // Volume conversions
  converter.addLinearConversion("cubic_meter", "liter", 1000);
  converter.addLinearConversion("liter", "milliliter", 1000);
  converter.addLinearConversion("liter", "gallon", 0.264172);
  converter.addLinearConversion("liter", "quart", 1.05669);
  converter.addLinearConversion("liter", "pint", 2.11338);
  converter.addLinearConversion("liter", "cup", 4.22675);
  converter.addLinearConversion("liter", "fluid_ounce", 33.814);

  // Time units
  converter.addUnit("second", "time", "s", "Second");
  converter.addUnit("minute", "time", "min", "Minute");
  converter.addUnit("hour", "time", "h", "Hour");
  converter.addUnit("day", "time", "d", "Day");
  converter.addUnit("week", "time", "wk", "Week");
  converter.addUnit("month", "time", "mo", "Month");
  converter.addUnit("year", "time", "yr", "Year");

  // Time conversions
  converter.addLinearConversion("second", "minute", 1 / 60);
  converter.addLinearConversion("second", "hour", 1 / 3600);
  converter.addLinearConversion("second", "day", 1 / 86400);
  converter.addLinearConversion("second", "week", 1 / 604800);
  converter.addLinearConversion("second", "month", 1 / 2629746);
  converter.addLinearConversion("second", "year", 1 / 31556952);

  // Energy units
  converter.addUnit("joule", "energy", "J", "Joule");
  converter.addUnit("kilojoule", "energy", "kJ", "Kilojoule");
  converter.addUnit("calorie", "energy", "cal", "Calorie");
  converter.addUnit("kilocalorie", "energy", "kcal", "Kilocalorie");
  converter.addUnit("watt_hour", "energy", "Wh", "Watt hour");
  converter.addUnit("kilowatt_hour", "energy", "kWh", "Kilowatt hour");

  // Energy conversions
  converter.addLinearConversion("joule", "kilojoule", 0.001);
  converter.addLinearConversion("joule", "calorie", 0.239006);
  converter.addLinearConversion("joule", "kilocalorie", 0.000239006);
  converter.addLinearConversion("joule", "watt_hour", 0.000277778);
  converter.addLinearConversion("joule", "kilowatt_hour", 0.000000277778);

  // Power units
  converter.addUnit("watt", "power", "W", "Watt");
  converter.addUnit("kilowatt", "power", "kW", "Kilowatt");
  converter.addUnit("megawatt", "power", "MW", "Megawatt");
  converter.addUnit("horsepower", "power", "hp", "Horsepower");

  // Power conversions
  converter.addLinearConversion("watt", "kilowatt", 0.001);
  converter.addLinearConversion("watt", "megawatt", 0.000001);
  converter.addLinearConversion("watt", "horsepower", 0.00134102);

  return converter;
}

export const categoryMapping = {
  length: "Length",
  weight: "Weight",
  temperature: "Temperature",
  speed: "Speed",
  digital: "Data Storage",
  area: "Area",
  volume: "Volume",
  time: "Time",
  energy: "Energy",
  power: "Power",
} as const;

export type CategoryId = keyof typeof categoryMapping;
