import { describe, it, expect, beforeEach } from "vitest";
import { createUnitConverter } from "../lib/config";
import { UnitConverter } from "../lib/graph-engine";

describe("Unit Converter - Conversion Relationships", () => {
  let converter: UnitConverter;

  beforeEach(() => {
    converter = createUnitConverter();
  });

  describe("Length Conversions", () => {
    it("should convert basic length units correctly", () => {
      // Meter to other units
      expect(converter.convert(1, "meter", "centimeter")).toBe(100);
      expect(converter.convert(1, "meter", "millimeter")).toBe(1000);
      expect(converter.convert(1, "meter", "kilometer")).toBe(0.001);
      expect(converter.convert(1, "meter", "nanometer")).toBe(1e9);
      expect(converter.convert(1, "meter", "micrometer")).toBe(1e6);

      // Imperial units
      expect(converter.convert(1, "meter", "inch")).toBeCloseTo(39.3701, 4);
      expect(converter.convert(1, "meter", "foot")).toBeCloseTo(3.28084, 4);
      expect(converter.convert(1, "meter", "yard")).toBeCloseTo(1.09361, 4);
      expect(converter.convert(1, "meter", "mile")).toBeCloseTo(0.000621371, 6);
    });

    it("should convert between imperial units", () => {
      // Foot to inch
      expect(converter.convert(1, "foot", "inch")).toBeCloseTo(12, 1);
      // Mile to foot
      expect(converter.convert(1, "mile", "foot")).toBeCloseTo(5280, 0);
    });

    it("should handle bidirectional conversions", () => {
      // Test reversibility
      const original = 100;
      const converted = converter.convert(original, "meter", "foot");
      const backConverted = converter.convert(converted, "foot", "meter");
      expect(backConverted).toBeCloseTo(original, 6);
    });
  });

  describe("Weight Conversions", () => {
    it("should convert weight units correctly", () => {
      // Kilogram to other units
      expect(converter.convert(1, "kilogram", "gram")).toBe(1000);
      expect(converter.convert(1, "kilogram", "pound")).toBeCloseTo(2.20462, 4);
      expect(converter.convert(1, "kilogram", "ounce")).toBeCloseTo(35.274, 3);
      expect(converter.convert(1, "kilogram", "ton")).toBe(0.001);
    });

    it("should convert between imperial weight units", () => {
      // Pound to ounce
      expect(converter.convert(1, "pound", "ounce")).toBeCloseTo(16, 1);
    });
  });

  describe("Temperature Conversions", () => {
    it("should convert temperature units correctly", () => {
      // Celsius conversions
      expect(converter.convert(0, "celsius", "fahrenheit")).toBe(32);
      expect(converter.convert(100, "celsius", "fahrenheit")).toBe(212);
      expect(converter.convert(0, "celsius", "kelvin")).toBe(273.15);
      expect(converter.convert(100, "celsius", "kelvin")).toBe(373.15);

      // Fahrenheit to Celsius
      expect(converter.convert(32, "fahrenheit", "celsius")).toBe(0);
      expect(converter.convert(212, "fahrenheit", "celsius")).toBe(100);

      // Kelvin to Celsius
      expect(converter.convert(273.15, "kelvin", "celsius")).toBe(0);
      expect(converter.convert(373.15, "kelvin", "celsius")).toBe(100);
    });

    it("should handle temperature edge cases", () => {
      // Absolute zero
      expect(converter.convert(-273.15, "celsius", "kelvin")).toBe(0);
      expect(converter.convert(-459.67, "fahrenheit", "kelvin")).toBeCloseTo(
        0,
        1
      );
    });
  });

  describe("Speed Conversions", () => {
    it("should convert speed units correctly", () => {
      // m/s to other units
      expect(
        converter.convert(1, "meter_per_second", "kilometer_per_hour")
      ).toBe(3.6);
      expect(
        converter.convert(1, "meter_per_second", "mile_per_hour")
      ).toBeCloseTo(2.23694, 4);
      expect(
        converter.convert(1, "meter_per_second", "foot_per_second")
      ).toBeCloseTo(3.28084, 4);
      expect(converter.convert(1, "meter_per_second", "knot")).toBeCloseTo(
        1.94384,
        4
      );
      expect(converter.convert(1, "meter_per_second", "mach")).toBeCloseTo(
        0.00293866,
        6
      );
    });

    it("should convert common speed values", () => {
      // 60 mph to km/h
      expect(
        converter.convert(60, "mile_per_hour", "kilometer_per_hour")
      ).toBeCloseTo(96.56, 1);
      // 100 km/h to mph
      expect(
        converter.convert(100, "kilometer_per_hour", "mile_per_hour")
      ).toBeCloseTo(62.14, 1);
    });
  });

  describe("Digital Storage Conversions", () => {
    it("should convert decimal storage units", () => {
      // Byte to decimal units
      expect(converter.convert(1000, "byte", "kilobyte")).toBe(1);
      expect(converter.convert(1000000, "byte", "megabyte")).toBe(1);
      expect(converter.convert(1000000000, "byte", "gigabyte")).toBe(1);
      expect(converter.convert(1000000000000, "byte", "terabyte")).toBe(1);
    });

    it("should convert binary storage units", () => {
      // Byte to binary units
      expect(converter.convert(1024, "byte", "kibibyte")).toBe(1);
      expect(converter.convert(1024 * 1024, "byte", "mebibyte")).toBe(1);
      expect(converter.convert(1024 * 1024 * 1024, "byte", "gibibyte")).toBe(1);
    });

    it("should convert bits and bytes", () => {
      expect(converter.convert(1, "byte", "bit")).toBe(8);
      expect(converter.convert(8, "bit", "byte")).toBe(1);
      expect(converter.convert(1000, "bit", "kilobit")).toBe(1);
    });
  });

  describe("Area Conversions", () => {
    it("should convert area units correctly", () => {
      // Square meter to other units
      expect(converter.convert(1, "square_meter", "square_centimeter")).toBe(
        10000
      );
      expect(
        converter.convert(1000000, "square_meter", "square_kilometer")
      ).toBe(1);
      expect(converter.convert(1, "square_meter", "square_inch")).toBeCloseTo(
        1550.0031,
        3
      );
      expect(converter.convert(1, "square_meter", "square_foot")).toBeCloseTo(
        10.7639,
        3
      );
      expect(converter.convert(4047, "square_meter", "acre")).toBeCloseTo(1, 2);
      expect(converter.convert(10000, "square_meter", "hectare")).toBe(1);
    });
  });

  describe("Volume Conversions", () => {
    it("should convert volume units correctly", () => {
      // Cubic meter and liter
      expect(converter.convert(1, "cubic_meter", "liter")).toBe(1000);
      expect(converter.convert(1, "liter", "milliliter")).toBe(1000);

      // US liquid units
      expect(converter.convert(1, "liter", "gallon")).toBeCloseTo(0.264172, 5);
      expect(converter.convert(1, "liter", "quart")).toBeCloseTo(1.05669, 4);
      expect(converter.convert(1, "liter", "pint")).toBeCloseTo(2.11338, 4);
      expect(converter.convert(1, "liter", "cup")).toBeCloseTo(4.22675, 4);
      expect(converter.convert(1, "liter", "fluid_ounce")).toBeCloseTo(
        33.814,
        2
      );
    });
  });

  describe("Time Conversions", () => {
    it("should convert time units correctly", () => {
      // Second to other units
      expect(converter.convert(60, "second", "minute")).toBe(1);
      expect(converter.convert(3600, "second", "hour")).toBe(1);
      expect(converter.convert(86400, "second", "day")).toBe(1);
      expect(converter.convert(604800, "second", "week")).toBe(1);

      // Common time conversions
      expect(converter.convert(1, "hour", "minute")).toBe(60);
      expect(converter.convert(1, "day", "hour")).toBe(24);
      expect(converter.convert(1, "week", "day")).toBe(7);
    });
  });

  describe("Energy Conversions", () => {
    it("should convert energy units correctly", () => {
      // Joule to other units
      expect(converter.convert(1000, "joule", "kilojoule")).toBe(1);
      expect(converter.convert(1, "joule", "calorie")).toBeCloseTo(0.239006, 5);
      expect(converter.convert(1, "joule", "kilocalorie")).toBeCloseTo(
        0.000239006,
        8
      );
      expect(converter.convert(3600, "joule", "watt_hour")).toBeCloseTo(1, 5);
      expect(converter.convert(3600000, "joule", "kilowatt_hour")).toBeCloseTo(
        1,
        5
      );
    });
  });

  describe("Power Conversions", () => {
    it("should convert power units correctly", () => {
      // Watt to other units
      expect(converter.convert(1000, "watt", "kilowatt")).toBe(1);
      expect(converter.convert(1000000, "watt", "megawatt")).toBe(1);
      expect(converter.convert(1, "watt", "horsepower")).toBeCloseTo(
        0.00134102,
        7
      );

      // Horsepower to watt
      expect(converter.convert(1, "horsepower", "watt")).toBeCloseTo(745.7, 1);
    });
  });

  describe("Pressure Conversions", () => {
    it("should convert pressure units correctly", () => {
      // Pascal to other units
      expect(converter.convert(1000, "pascal", "kilopascal")).toBe(1);
      expect(converter.convert(1000000, "pascal", "megapascal")).toBe(1);
      expect(converter.convert(100000, "pascal", "bar")).toBe(1);
      expect(converter.convert(100, "pascal", "millibar")).toBe(1);
      expect(converter.convert(101325, "pascal", "atmosphere")).toBeCloseTo(
        1,
        5
      );
      expect(converter.convert(6895, "pascal", "psi")).toBeCloseTo(1, 2);
      expect(converter.convert(133.322, "pascal", "torr")).toBeCloseTo(1, 2);
      expect(converter.convert(133.322, "pascal", "mmhg")).toBeCloseTo(1, 2);
    });
  });

  describe("Angle Conversions", () => {
    it("should convert angle units correctly", () => {
      // Degree to other units
      expect(converter.convert(180, "degree", "radian")).toBeCloseTo(
        Math.PI,
        6
      );
      expect(converter.convert(90, "degree", "gradian")).toBe(100);
      expect(converter.convert(360, "degree", "turn")).toBe(1);
      expect(converter.convert(1, "degree", "arcminute")).toBe(60);
      expect(converter.convert(1, "degree", "arcsecond")).toBe(3600);

      // Radian to degree
      expect(converter.convert(Math.PI, "radian", "degree")).toBeCloseTo(
        180,
        6
      );
      expect(converter.convert(Math.PI / 2, "radian", "degree")).toBeCloseTo(
        90,
        6
      );
    });
  });

  describe("Frequency Conversions", () => {
    it("should convert frequency units correctly", () => {
      // Hertz to other units
      expect(converter.convert(1000, "hertz", "kilohertz")).toBe(1);
      expect(converter.convert(1000000, "hertz", "megahertz")).toBe(1);
      expect(converter.convert(1000000000, "hertz", "gigahertz")).toBe(1);
      expect(converter.convert(1000000000000, "hertz", "terahertz")).toBe(1);
      expect(converter.convert(1, "hertz", "rpm")).toBe(60);

      // RPM to Hz
      expect(converter.convert(60, "rpm", "hertz")).toBe(1);
    });
  });

  describe("Cross-Category Conversion Prevention", () => {
    it("should not allow conversions between different categories", () => {
      // Length to weight should fail
      expect(() => converter.convert(1, "meter", "kilogram")).toThrow();

      // Temperature to pressure should fail
      expect(() => converter.convert(1, "celsius", "pascal")).toThrow();

      // Speed to time should fail
      expect(() =>
        converter.convert(1, "meter_per_second", "second")
      ).toThrow();
    });
  });

  describe("Unit Existence Validation", () => {
    it("should handle non-existent units", () => {
      // Non-existent source unit
      expect(() => converter.convert(1, "nonexistent", "meter")).toThrow();

      // Non-existent target unit
      expect(() => converter.convert(1, "meter", "nonexistent")).toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero values", () => {
      expect(converter.convert(0, "meter", "foot")).toBe(0);
      expect(converter.convert(0, "celsius", "fahrenheit")).toBe(32);
      expect(converter.convert(0, "fahrenheit", "celsius")).toBeCloseTo(
        -17.78,
        2
      );
    });

    it("should handle negative values", () => {
      expect(converter.convert(-10, "meter", "foot")).toBeCloseTo(-32.8084, 3);
      expect(converter.convert(-40, "celsius", "fahrenheit")).toBe(-40);
      expect(converter.convert(-273.15, "celsius", "kelvin")).toBe(0);
    });

    it("should handle very large values", () => {
      const largeValue = 1e12;
      const result = converter.convert(largeValue, "meter", "kilometer");
      expect(result).toBe(largeValue * 0.001);
    });

    it("should handle very small values", () => {
      const smallValue = 1e-12;
      const result = converter.convert(smallValue, "meter", "nanometer");
      expect(result).toBe(smallValue * 1e9);
    });
  });

  describe("Precision Tests", () => {
    it("should maintain precision in conversions", () => {
      // Test precision with multiple conversions
      const original = 1.23456789;
      const intermediate = converter.convert(original, "meter", "inch");
      const final = converter.convert(intermediate, "inch", "meter");
      expect(final).toBeCloseTo(original, 8);
    });

    it("should handle floating point precision", () => {
      // Test known precision issues
      const result = converter.convert(0.1, "meter", "centimeter");
      expect(result).toBeCloseTo(10, 10);
    });
  });
});
