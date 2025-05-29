// Core types for unit conversion
export interface UnitCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  groups: UnitGroup[];
}

export interface UnitGroup {
  id: string;
  name: string;
  units: Unit[];
  isCollapsed?: boolean;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  baseRatio: number; // Conversion ratio to base unit
  baseOffset?: number; // For temperature conversions
  isBaseUnit: boolean;
  precision: number; // Decimal places to show
  scientificNotation?: boolean; // Use sci notation for large/small numbers
  description: string;
  context: string; // When/why to use this unit
}

export interface ConversionResult {
  unit: Unit;
  value: number;
  formattedValue: string;
  scientificValue?: string;
  isApproximate: boolean;
}

export interface ConversionInfo {
  formula: string;
  explanation: string;
  precision: string;
  historicalNote?: string;
}

export interface ConverterState {
  selectedCategory: string;
  inputValue: number;
  inputUnit: string;
  results: ConversionResult[];
  conversionInfo: ConversionInfo;
  favorites: string[]; // Unit IDs
  showAllUnits: boolean;
  compactMode: boolean;
}

// Unit Categories Configuration
export const unitCategories: UnitCategory[] = [
  {
    id: "length",
    name: "Length",
    icon: "L",
    description: "Linear measurements from nanometers to light-years",
    groups: [
      {
        id: "metric",
        name: "Metric Units",
        units: [
          {
            id: "meter",
            name: "Meter",
            symbol: "m",
            baseRatio: 1,
            isBaseUnit: true,
            precision: 6,
            description: "SI base unit of length",
            context: "Standard metric measurement for everyday distances",
          },
          {
            id: "centimeter",
            name: "Centimeter",
            symbol: "cm",
            baseRatio: 0.01,
            isBaseUnit: false,
            precision: 2,
            description: "1/100 of a meter",
            context: "Ideal for measuring small objects and body measurements",
          },
          {
            id: "millimeter",
            name: "Millimeter",
            symbol: "mm",
            baseRatio: 0.001,
            isBaseUnit: false,
            precision: 2,
            description: "1/1000 of a meter",
            context: "Precision measurements and engineering",
          },
          {
            id: "kilometer",
            name: "Kilometer",
            symbol: "km",
            baseRatio: 1000,
            isBaseUnit: false,
            precision: 6,
            description: "1000 meters",
            context: "Measuring long distances and geographical scales",
          },
        ],
      },
      {
        id: "imperial",
        name: "Imperial Units",
        units: [
          {
            id: "inch",
            name: "Inch",
            symbol: "in",
            baseRatio: 0.0254,
            isBaseUnit: false,
            precision: 3,
            description: "Imperial unit, 1/12 of a foot",
            context: "Common in US for construction and manufacturing",
          },
          {
            id: "foot",
            name: "Foot",
            symbol: "ft",
            baseRatio: 0.3048,
            isBaseUnit: false,
            precision: 3,
            description: "12 inches",
            context: "Height measurements and construction",
          },
          {
            id: "yard",
            name: "Yard",
            symbol: "yd",
            baseRatio: 0.9144,
            isBaseUnit: false,
            precision: 3,
            description: "3 feet",
            context: "Sports fields and fabric measurements",
          },
          {
            id: "mile",
            name: "Mile",
            symbol: "mi",
            baseRatio: 1609.344,
            isBaseUnit: false,
            precision: 6,
            description: "5280 feet",
            context: "Long distances and road measurements",
          },
        ],
      },
      {
        id: "scientific",
        name: "Scientific Units",
        units: [
          {
            id: "micrometer",
            name: "Micrometer",
            symbol: "μm",
            baseRatio: 1e-6,
            isBaseUnit: false,
            precision: 2,
            scientificNotation: true,
            description: "One millionth of a meter",
            context: "Microscopy and cell measurements",
          },
          {
            id: "nanometer",
            name: "Nanometer",
            symbol: "nm",
            baseRatio: 1e-9,
            isBaseUnit: false,
            precision: 2,
            scientificNotation: true,
            description: "One billionth of a meter",
            context: "Nanotechnology and atomic measurements",
          },
        ],
      },
    ],
  },
  {
    id: "weight",
    name: "Weight",
    icon: "W",
    description: "Mass and weight measurements",
    groups: [
      {
        id: "metric",
        name: "Metric Units",
        units: [
          {
            id: "gram",
            name: "Gram",
            symbol: "g",
            baseRatio: 1,
            isBaseUnit: true,
            precision: 6,
            description: "Base unit of mass in metric system",
            context: "Small mass measurements and cooking",
          },
          {
            id: "kilogram",
            name: "Kilogram",
            symbol: "kg",
            baseRatio: 1000,
            isBaseUnit: false,
            precision: 6,
            description: "1000 grams",
            context: "SI base unit for mass, body weight",
          },
          {
            id: "milligram",
            name: "Milligram",
            symbol: "mg",
            baseRatio: 0.001,
            isBaseUnit: false,
            precision: 3,
            description: "1/1000 of a gram",
            context: "Medicine dosage and precision measurements",
          },
          {
            id: "tonne",
            name: "Tonne",
            symbol: "t",
            baseRatio: 1000000,
            isBaseUnit: false,
            precision: 6,
            description: "1000 kilograms",
            context: "Large mass measurements, industrial use",
          },
        ],
      },
      {
        id: "imperial",
        name: "Imperial Units",
        units: [
          {
            id: "ounce",
            name: "Ounce",
            symbol: "oz",
            baseRatio: 28.3495,
            isBaseUnit: false,
            precision: 3,
            description: "1/16 of a pound",
            context: "Small weight measurements, precious metals",
          },
          {
            id: "pound",
            name: "Pound",
            symbol: "lb",
            baseRatio: 453.592,
            isBaseUnit: false,
            precision: 3,
            description: "16 ounces",
            context: "Body weight and general measurements in US",
          },
          {
            id: "stone",
            name: "Stone",
            symbol: "st",
            baseRatio: 6350.29,
            isBaseUnit: false,
            precision: 3,
            description: "14 pounds",
            context: "Body weight measurements in UK",
          },
        ],
      },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    icon: "T",
    description: "Temperature measurements in different scales",
    groups: [
      {
        id: "common",
        name: "Common Scales",
        units: [
          {
            id: "celsius",
            name: "Celsius",
            symbol: "°C",
            baseRatio: 1,
            baseOffset: 273.15,
            isBaseUnit: false,
            precision: 2,
            description: "Water freezes at 0°C, boils at 100°C",
            context: "Standard temperature scale in most countries",
          },
          {
            id: "fahrenheit",
            name: "Fahrenheit",
            symbol: "°F",
            baseRatio: 5 / 9,
            baseOffset: 459.67,
            isBaseUnit: false,
            precision: 2,
            description: "Water freezes at 32°F, boils at 212°F",
            context: "Primary temperature scale in the United States",
          },
          {
            id: "kelvin",
            name: "Kelvin",
            symbol: "K",
            baseRatio: 1,
            baseOffset: 0,
            isBaseUnit: true,
            precision: 2,
            description: "Absolute temperature scale starting at absolute zero",
            context: "SI base unit, used in scientific calculations",
          },
        ],
      },
    ],
  },
  {
    id: "volume",
    name: "Volume",
    icon: "V",
    description: "Liquid and volume measurements",
    groups: [
      {
        id: "metric",
        name: "Metric Units",
        units: [
          {
            id: "liter",
            name: "Liter",
            symbol: "L",
            baseRatio: 1,
            isBaseUnit: true,
            precision: 6,
            description: "Base unit for liquid volume",
            context: "Standard liquid measurements",
          },
          {
            id: "milliliter",
            name: "Milliliter",
            symbol: "mL",
            baseRatio: 0.001,
            isBaseUnit: false,
            precision: 2,
            description: "1/1000 of a liter",
            context: "Small liquid amounts, medicine",
          },
          {
            id: "cubic_meter",
            name: "Cubic Meter",
            symbol: "m³",
            baseRatio: 1000,
            isBaseUnit: false,
            precision: 6,
            description: "1000 liters",
            context: "Large volume measurements, construction",
          },
        ],
      },
      {
        id: "imperial",
        name: "Imperial Units",
        units: [
          {
            id: "fluid_ounce",
            name: "Fluid Ounce",
            symbol: "fl oz",
            baseRatio: 0.0295735,
            isBaseUnit: false,
            precision: 3,
            description: "US fluid ounce",
            context: "Small liquid measurements in recipes",
          },
          {
            id: "cup",
            name: "Cup",
            symbol: "cup",
            baseRatio: 0.236588,
            isBaseUnit: false,
            precision: 3,
            description: "8 fluid ounces",
            context: "Cooking and baking measurements",
          },
          {
            id: "gallon",
            name: "Gallon",
            symbol: "gal",
            baseRatio: 3.78541,
            isBaseUnit: false,
            precision: 3,
            description: "US gallon, 128 fluid ounces",
            context: "Large liquid volumes, fuel measurements",
          },
        ],
      },
    ],
  },
  {
    id: "area",
    name: "Area",
    icon: "A",
    description: "Surface area measurements",
    groups: [
      {
        id: "metric",
        name: "Metric Units",
        units: [
          {
            id: "square_meter",
            name: "Square Meter",
            symbol: "m²",
            baseRatio: 1,
            isBaseUnit: true,
            precision: 6,
            description: "SI unit of area",
            context: "Room sizes, land measurements",
          },
          {
            id: "square_centimeter",
            name: "Square Centimeter",
            symbol: "cm²",
            baseRatio: 0.0001,
            isBaseUnit: false,
            precision: 2,
            description: "Small area measurements",
            context: "Small surfaces, cross-sections",
          },
          {
            id: "hectare",
            name: "Hectare",
            symbol: "ha",
            baseRatio: 10000,
            isBaseUnit: false,
            precision: 6,
            description: "10,000 square meters",
            context: "Agricultural land, large areas",
          },
        ],
      },
    ],
  },
  {
    id: "speed",
    name: "Speed",
    icon: "S",
    description: "Velocity and speed measurements",
    groups: [
      {
        id: "common",
        name: "Common Units",
        units: [
          {
            id: "meters_per_second",
            name: "Meters per Second",
            symbol: "m/s",
            baseRatio: 1,
            isBaseUnit: true,
            precision: 3,
            description: "SI unit of speed",
            context: "Scientific calculations, physics",
          },
          {
            id: "kilometers_per_hour",
            name: "Kilometers per Hour",
            symbol: "km/h",
            baseRatio: 0.277778,
            isBaseUnit: false,
            precision: 3,
            description: "Common speed unit",
            context: "Vehicle speeds, everyday use",
          },
          {
            id: "miles_per_hour",
            name: "Miles per Hour",
            symbol: "mph",
            baseRatio: 0.44704,
            isBaseUnit: false,
            precision: 3,
            description: "Imperial speed unit",
            context: "Vehicle speeds in US and UK",
          },
          {
            id: "knots",
            name: "Knots",
            symbol: "kt",
            baseRatio: 0.514444,
            isBaseUnit: false,
            precision: 3,
            description: "Nautical miles per hour",
            context: "Maritime and aviation speeds",
          },
        ],
      },
    ],
  },
];

// Unit Converter Engine
export class UnitConverter {
  private categories: Map<string, UnitCategory> = new Map();
  private units: Map<string, Unit> = new Map();

  constructor(categories: UnitCategory[]) {
    this.loadCategories(categories);
  }

  private loadCategories(categories: UnitCategory[]): void {
    for (const category of categories) {
      this.categories.set(category.id, category);
      for (const group of category.groups) {
        for (const unit of group.units) {
          this.units.set(unit.id, unit);
        }
      }
    }
  }

  // Convert between any two units in the same category
  convert(value: number, fromUnitId: string, toUnitId: string): number {
    const fromUnit = this.units.get(fromUnitId);
    const toUnit = this.units.get(toUnitId);

    if (!fromUnit || !toUnit) {
      throw new Error("Invalid unit IDs");
    }

    // Special handling for temperature
    if (this.isTemperatureUnit(fromUnit)) {
      return this.convertTemperature(value, fromUnit, toUnit);
    }

    // Standard linear conversion
    const baseValue = value * fromUnit.baseRatio;
    return baseValue / toUnit.baseRatio;
  }

  private isTemperatureUnit(unit: Unit): boolean {
    return ["celsius", "fahrenheit", "kelvin"].includes(unit.id);
  }

  // Convert temperature with offset handling
  private convertTemperature(
    value: number,
    fromUnit: Unit,
    toUnit: Unit
  ): number {
    // Convert to Kelvin first (base unit)
    let kelvin: number;

    if (fromUnit.id === "celsius") {
      kelvin = value + 273.15;
    } else if (fromUnit.id === "fahrenheit") {
      kelvin = (value + 459.67) * (5 / 9);
    } else if (fromUnit.id === "kelvin") {
      kelvin = value;
    } else {
      throw new Error("Unsupported temperature unit");
    }

    // Convert from Kelvin to target unit
    if (toUnit.id === "celsius") {
      return kelvin - 273.15;
    } else if (toUnit.id === "fahrenheit") {
      return kelvin * (9 / 5) - 459.67;
    } else if (toUnit.id === "kelvin") {
      return kelvin;
    } else {
      throw new Error("Unsupported temperature unit");
    }
  }

  // Convert input to all units in category
  convertToAll(
    value: number,
    inputUnitId: string,
    categoryId: string
  ): ConversionResult[] {
    const category = this.categories.get(categoryId);
    if (!category) return [];

    const results: ConversionResult[] = [];

    for (const group of category.groups) {
      for (const unit of group.units) {
        if (unit.id === inputUnitId) continue;

        try {
          const convertedValue = this.convert(value, inputUnitId, unit.id);
          const formattedValue = this.formatValue(convertedValue, unit);

          results.push({
            unit,
            value: convertedValue,
            formattedValue,
            scientificValue: unit.scientificNotation
              ? this.toScientificNotation(convertedValue)
              : undefined,
            isApproximate: this.isApproximateConversion(inputUnitId, unit.id),
          });
        } catch (error) {
          console.warn(`Conversion failed for ${unit.id}:`, error);
        }
      }
    }

    return results.sort((a, b) => this.sortUnits(a.unit, b.unit));
  }

  // Format value based on unit specifications
  private formatValue(value: number, unit: Unit): string {
    const absValue = Math.abs(value);

    // Use scientific notation for very large or small numbers
    if (
      unit.scientificNotation ||
      absValue >= 1e6 ||
      (absValue < 0.001 && absValue > 0)
    ) {
      return value.toExponential(unit.precision);
    }

    // Use regular formatting with appropriate precision
    if (absValue >= 1000) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: unit.precision,
      });
    }

    return value.toFixed(unit.precision);
  }

  private toScientificNotation(value: number): string {
    return value.toExponential(2);
  }

  private isApproximateConversion(
    fromUnitId: string,
    toUnitId: string
  ): boolean {
    // Some conversions are approximate (e.g., metric to imperial)
    const approximateConversions = [
      ["meter", "inch"],
      ["meter", "foot"],
      ["meter", "yard"],
      ["kilogram", "pound"],
      ["liter", "gallon"],
    ];

    return approximateConversions.some(
      ([a, b]) =>
        (fromUnitId === a && toUnitId === b) ||
        (fromUnitId === b && toUnitId === a)
    );
  }

  private sortUnits(a: Unit, b: Unit): number {
    // Sort by base ratio (smaller units first)
    return a.baseRatio - b.baseRatio;
  }

  // Generate conversion information
  getConversionInfo(inputUnitId: string, outputUnitId: string): ConversionInfo {
    const inputUnit = this.units.get(inputUnitId);
    const outputUnit = this.units.get(outputUnitId);

    if (!inputUnit || !outputUnit) {
      return {
        formula: "Invalid units",
        explanation: "Unable to generate conversion information",
        precision: "N/A",
      };
    }

    const ratio = outputUnit.baseRatio / inputUnit.baseRatio;

    return {
      formula: `1 ${inputUnit.symbol} = ${ratio.toLocaleString()} ${
        outputUnit.symbol
      }`,
      explanation: `${inputUnit.description} converted to ${outputUnit.description}`,
      precision: `Results shown to ${outputUnit.precision} decimal places`,
      historicalNote: this.getHistoricalNote(inputUnit, outputUnit),
    };
  }

  private getHistoricalNote(
    inputUnit: Unit,
    outputUnit: Unit
  ): string | undefined {
    // Add interesting historical context for certain conversions
    if (inputUnit.id === "meter" && outputUnit.id === "foot") {
      return "The meter was originally defined as 1/10,000,000 of the distance from the equator to the North Pole";
    }
    if (inputUnit.id === "celsius" && outputUnit.id === "fahrenheit") {
      return "Fahrenheit scale was developed by Daniel Gabriel Fahrenheit in 1724";
    }
    return undefined;
  }

  getCategory(categoryId: string): UnitCategory | undefined {
    return this.categories.get(categoryId);
  }

  getUnit(unitId: string): Unit | undefined {
    return this.units.get(unitId);
  }
}

// Utility function to debounce input
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
