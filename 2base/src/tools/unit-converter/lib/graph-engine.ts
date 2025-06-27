type UnitName = string;
type ConversionFunction = (value: number) => number;
type Dimension = string;

interface ConversionEdge {
  to: UnitName;
  convert: ConversionFunction;
  inverse: ConversionFunction;
}

interface UnitNode {
  name: UnitName;
  dimension: Dimension;
  symbol: string;
  description: string;
  edges: ConversionEdge[];
}

interface ConversionPath {
  path: UnitName[];
  functions: ConversionFunction[];
}

interface UnitConfig {
  units: Array<{
    name: UnitName;
    dimension: Dimension;
    symbol: string;
    description: string;
  }>;
  conversions: Array<{
    from: UnitName;
    to: UnitName;
    forward: string;
    backward: string;
  }>;
}

export class UnitConverter {
  private graph: Map<UnitName, UnitNode> = new Map();
  private dimensionGroups: Map<Dimension, Set<UnitName>> = new Map();

  constructor(config?: UnitConfig) {
    if (config) {
      this.loadFromConfig(config);
    }
  }

  addUnit(
    name: UnitName,
    dimension: Dimension,
    symbol: string,
    description: string
  ): void {
    if (this.graph.has(name)) {
      throw new Error(`Unit ${name} already exists`);
    }

    const node: UnitNode = {
      name,
      dimension,
      symbol,
      description,
      edges: [],
    };

    this.graph.set(name, node);

    if (!this.dimensionGroups.has(dimension)) {
      this.dimensionGroups.set(dimension, new Set());
    }
    this.dimensionGroups.get(dimension)!.add(name);
  }

  addConversion(
    from: UnitName,
    to: UnitName,
    forwardFn: ConversionFunction,
    backwardFn: ConversionFunction
  ): void {
    const fromNode = this.graph.get(from);
    const toNode = this.graph.get(to);

    if (!fromNode || !toNode) {
      throw new Error(`Unit ${!fromNode ? from : to} not found`);
    }

    if (fromNode.dimension !== toNode.dimension) {
      throw new Error(
        `Cannot convert between different dimensions: ${fromNode.dimension} and ${toNode.dimension}`
      );
    }

    fromNode.edges.push({
      to,
      convert: forwardFn,
      inverse: backwardFn,
    });

    toNode.edges.push({
      to: from,
      convert: backwardFn,
      inverse: forwardFn,
    });
  }

  addLinearConversion(
    from: UnitName,
    to: UnitName,
    factor: number,
    offset: number = 0
  ): void {
    const forward = (value: number) => value * factor + offset;
    const backward = (value: number) => (value - offset) / factor;
    this.addConversion(from, to, forward, backward);
  }

  findConversionPath(from: UnitName, to: UnitName): ConversionPath | null {
    if (!this.graph.has(from) || !this.graph.has(to)) {
      return null;
    }

    if (from === to) {
      return { path: [from], functions: [] };
    }

    const fromDimension = this.graph.get(from)!.dimension;
    const toDimension = this.graph.get(to)!.dimension;

    if (fromDimension !== toDimension) {
      return null;
    }

    const visited = new Set<UnitName>();
    const queue: Array<{
      unit: UnitName;
      path: UnitName[];
      functions: ConversionFunction[];
    }> = [{ unit: from, path: [from], functions: [] }];

    while (queue.length > 0) {
      const { unit, path, functions } = queue.shift()!;

      if (unit === to) {
        return { path, functions };
      }

      if (visited.has(unit)) {
        continue;
      }

      visited.add(unit);

      const node = this.graph.get(unit)!;
      for (const edge of node.edges) {
        if (!visited.has(edge.to)) {
          queue.push({
            unit: edge.to,
            path: [...path, edge.to],
            functions: [...functions, edge.convert],
          });
        }
      }
    }

    return null;
  }

  convert(value: number, from: UnitName, to: UnitName): number {
    const path = this.findConversionPath(from, to);

    if (!path) {
      throw new Error(`No conversion path found from ${from} to ${to}`);
    }

    let result = value;
    for (const fn of path.functions) {
      result = fn(result);
    }

    return result;
  }

  convertToAll(
    value: number,
    from: UnitName
  ): Array<{
    unit: UnitName;
    value: number;
    symbol: string;
    description: string;
  }> {
    const fromNode = this.graph.get(from);
    if (!fromNode) {
      throw new Error(`Unit ${from} not found`);
    }

    const dimension = fromNode.dimension;
    const unitsInDimension = this.dimensionGroups.get(dimension) || new Set();
    const results: Array<{
      unit: UnitName;
      value: number;
      symbol: string;
      description: string;
    }> = [];

    for (const unitName of unitsInDimension) {
      if (unitName === from) continue;

      try {
        const convertedValue = this.convert(value, from, unitName);
        const unitNode = this.graph.get(unitName)!;
        results.push({
          unit: unitName,
          value: convertedValue,
          symbol: unitNode.symbol,
          description: unitNode.description,
        });
      } catch {
        // Skip units that cannot be converted
      }
    }

    return results;
  }

  getUnit(name: UnitName): UnitNode | undefined {
    return this.graph.get(name);
  }

  getUnitsInDimension(dimension: Dimension): UnitName[] {
    return Array.from(this.dimensionGroups.get(dimension) || []);
  }

  getAllDimensions(): Dimension[] {
    return Array.from(this.dimensionGroups.keys());
  }

  loadFromConfig(config: UnitConfig): void {
    this.graph.clear();
    this.dimensionGroups.clear();

    for (const unit of config.units) {
      this.addUnit(unit.name, unit.dimension, unit.symbol, unit.description);
    }

    for (const conversion of config.conversions) {
      const forwardFn = new Function(
        "value",
        `return ${conversion.forward}`
      ) as ConversionFunction;
      const backwardFn = new Function(
        "value",
        `return ${conversion.backward}`
      ) as ConversionFunction;
      this.addConversion(conversion.from, conversion.to, forwardFn, backwardFn);
    }
  }

  exportConfig(): UnitConfig {
    const units = Array.from(this.graph.values()).map((node) => ({
      name: node.name,
      dimension: node.dimension,
      symbol: node.symbol,
      description: node.description,
    }));

    const conversions: Array<{
      from: UnitName;
      to: UnitName;
      forward: string;
      backward: string;
    }> = [];

    const processed = new Set<string>();

    for (const [unitName, node] of this.graph) {
      for (const edge of node.edges) {
        const key = `${unitName}-${edge.to}`;
        const reverseKey = `${edge.to}-${unitName}`;

        if (!processed.has(key) && !processed.has(reverseKey)) {
          processed.add(key);
          processed.add(reverseKey);

          conversions.push({
            from: unitName,
            to: edge.to,
            forward: edge.convert.toString(),
            backward: edge.inverse.toString(),
          });
        }
      }
    }

    return { units, conversions };
  }

  addNumberBaseConversions(): void {
    const bases = [
      { name: "binary", symbol: "bin", base: 2 },
      { name: "octal", symbol: "oct", base: 8 },
      { name: "decimal", symbol: "dec", base: 10 },
      { name: "hexadecimal", symbol: "hex", base: 16 },
    ];

    for (const base of bases) {
      this.addUnit(
        base.name,
        "number_base",
        base.symbol,
        `Base ${base.base} number system`
      );
    }

    for (let i = 0; i < bases.length; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        const from = bases[i];
        const to = bases[j];

        this.addConversion(
          from.name,
          to.name,
          (value: number) => {
            const decimal =
              from.base === 10 ? value : parseInt(value.toString(), from.base);
            return to.base === 10
              ? decimal
              : parseInt(decimal.toString(to.base));
          },
          (value: number) => {
            const decimal =
              to.base === 10 ? value : parseInt(value.toString(), to.base);
            return from.base === 10
              ? decimal
              : parseInt(decimal.toString(from.base));
          }
        );
      }
    }
  }

  buildNormalizedGraph(baseUnits: Map<Dimension, UnitName>): void {
    const newGraph = new Map<UnitName, UnitNode>();
    const newDimensionGroups = new Map<Dimension, Set<UnitName>>();

    for (const [dimension, baseUnit] of baseUnits) {
      const unitsInDimension = this.getUnitsInDimension(dimension);

      for (const unitName of unitsInDimension) {
        const originalNode = this.graph.get(unitName)!;
        const newNode: UnitNode = {
          name: unitName,
          dimension,
          symbol: originalNode.symbol,
          description: originalNode.description,
          edges: [],
        };

        newGraph.set(unitName, newNode);

        if (!newDimensionGroups.has(dimension)) {
          newDimensionGroups.set(dimension, new Set());
        }
        newDimensionGroups.get(dimension)!.add(unitName);

        if (unitName !== baseUnit) {
          const conversionPath = this.findConversionPath(unitName, baseUnit);
          if (conversionPath) {
            const toBaseFn = (value: number) => {
              let result = value;
              for (const fn of conversionPath.functions) {
                result = fn(result);
              }
              return result;
            };

            const fromBaseFn = (value: number) => {
              const reversePath = this.findConversionPath(baseUnit, unitName);
              if (reversePath) {
                let result = value;
                for (const fn of reversePath.functions) {
                  result = fn(result);
                }
                return result;
              }
              throw new Error(
                `Cannot find reverse path from ${baseUnit} to ${unitName}`
              );
            };

            const baseNode = newGraph.get(baseUnit)!;

            newNode.edges.push({
              to: baseUnit,
              convert: toBaseFn,
              inverse: fromBaseFn,
            });

            baseNode.edges.push({
              to: unitName,
              convert: fromBaseFn,
              inverse: toBaseFn,
            });
          }
        }
      }
    }

    this.graph = newGraph;
    this.dimensionGroups = newDimensionGroups;
  }
}
