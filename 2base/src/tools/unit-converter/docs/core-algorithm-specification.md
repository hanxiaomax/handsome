# Unit Converter Core Algorithm and Data Structure Specification

## Overview

本文档详细说明单位转换器工具的核心算法和数据结构设计。该工具采用图论算法实现灵活、高效的单位转换系统，支持线性和非线性转换，能够自动发现转换路径并处理复杂的单位关系网络。

## Core Data Structures

### 1. 基础类型定义

```typescript
type UnitName = string;          // 单位名称标识符
type ConversionFunction = (value: number) => number;  // 转换函数类型
type Dimension = string;         // 量纲标识符（如"length", "weight"等）
```

### 2. ConversionEdge (转换边)

```typescript
interface ConversionEdge {
  to: UnitName;                  // 目标单位
  convert: ConversionFunction;   // 正向转换函数
  inverse: ConversionFunction;   // 反向转换函数
}
```

**设计理念**:
- 每条边代表两个单位之间的双向转换关系
- 正向和反向函数确保转换的可逆性
- 支持线性和非线性转换函数

### 3. UnitNode (单位节点)

```typescript
interface UnitNode {
  name: UnitName;               // 单位名称
  dimension: Dimension;         // 所属量纲
  symbol: string;               // 单位符号（如"m", "kg"）
  description: string;          // 单位描述
  edges: ConversionEdge[];      // 与其他单位的转换关系
}
```

**设计特点**:
- 每个节点代表一个具体单位
- 量纲约束确保只能在同一量纲内转换
- 邻接表结构存储转换关系

### 4. ConversionPath (转换路径)

```typescript
interface ConversionPath {
  path: UnitName[];                    // 转换路径上的单位序列
  functions: ConversionFunction[];     // 对应的转换函数序列
}
```

**用途**:
- 存储从源单位到目标单位的完整转换路径
- 支持多级转换（A→B→C→D）

### 5. UnitConfig (配置结构)

```typescript
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
    forward: string;      // 正向转换函数的字符串表示
    backward: string;     // 反向转换函数的字符串表示
  }>;
}
```

## Core Algorithm: Graph-Based Unit Conversion

### 1. 图结构设计

单位转换系统采用**无向加权图**结构：

- **节点 (Vertices)**: 代表具体单位（如meter, kilogram, celsius）
- **边 (Edges)**: 代表两个单位之间的转换关系
- **权重**: 转换函数（支持线性和非线性）

#### 图的特性
- **连通性**: 同一量纲内的所有单位形成连通分量
- **双向性**: 每条边都有正向和反向转换函数
- **量纲隔离**: 不同量纲之间不存在直接连接

### 2. 路径查找算法 (BFS)

使用**广度优先搜索 (Breadth-First Search)** 算法查找最短转换路径：

```typescript
findConversionPath(from: UnitName, to: UnitName): ConversionPath | null {
  // 1. 验证输入单位存在性
  if (!this.graph.has(from) || !this.graph.has(to)) {
    return null;
  }

  // 2. 处理同一单位的情况
  if (from === to) {
    return { path: [from], functions: [] };
  }

  // 3. 验证量纲一致性
  const fromDimension = this.graph.get(from)!.dimension;
  const toDimension = this.graph.get(to)!.dimension;
  if (fromDimension !== toDimension) {
    return null;
  }

  // 4. BFS 路径搜索
  const visited = new Set<UnitName>();
  const queue = [{ unit: from, path: [from], functions: [] }];

  while (queue.length > 0) {
    const { unit, path, functions } = queue.shift()!;

    if (unit === to) {
      return { path, functions };
    }

    if (visited.has(unit)) continue;
    visited.add(unit);

    // 探索相邻节点
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
```

#### 算法复杂度
- **时间复杂度**: O(V + E)，其中V是单位数量，E是转换关系数量
- **空间复杂度**: O(V)，用于存储访问状态和队列

#### 算法优势
- **最短路径**: BFS保证找到最少转换步数的路径
- **完备性**: 如果路径存在，算法必定能找到
- **效率**: 对于稀疏图具有良好的性能

### 3. 数值转换算法

```typescript
convert(value: number, from: UnitName, to: UnitName): number {
  const path = this.findConversionPath(from, to);
  
  if (!path) {
    throw new Error(`No conversion path found from ${from} to ${to}`);
  }

  // 链式函数组合
  let result = value;
  for (const fn of path.functions) {
    result = fn(result);
  }

  return result;
}
```

#### 转换过程
1. **路径发现**: 使用BFS找到转换路径
2. **函数组合**: 按路径顺序组合转换函数
3. **数值计算**: 依次应用转换函数

## Conversion Function Types

### 1. 线性转换 (Linear Conversion)

适用于大多数单位转换，形式为: `y = ax + b`

```typescript
addLinearConversion(from: UnitName, to: UnitName, factor: number, offset: number = 0): void {
  const forward = (value: number) => value * factor + offset;
  const backward = (value: number) => (value - offset) / factor;
  this.addConversion(from, to, forward, backward);
}
```

**应用示例**:
- 长度: meter → centimeter (factor=100, offset=0)
- 重量: kilogram → pound (factor=2.20462, offset=0)

### 2. 非线性转换 (Non-linear Conversion)

适用于复杂转换关系，如温度转换：

```typescript
// 摄氏度 ↔ 华氏度
converter.addConversion(
  "celsius", "fahrenheit",
  (c: number) => (c * 9) / 5 + 32,    // C to F
  (f: number) => ((f - 32) * 5) / 9   // F to C
);

// 摄氏度 ↔ 开尔文
converter.addConversion(
  "celsius", "kelvin",
  (c: number) => c + 273.15,          // C to K
  (k: number) => k - 273.15           // K to C
);
```

## Data Organization

### 1. 图存储结构

```typescript
export class UnitConverter {
  private graph: Map<UnitName, UnitNode> = new Map();              // 主图结构
  private dimensionGroups: Map<Dimension, Set<UnitName>> = new Map(); // 量纲分组
}
```

#### 存储优势
- **快速查找**: O(1) 时间复杂度访问任意单位
- **内存效率**: 邻接表结构避免稀疏矩阵的空间浪费
- **量纲隔离**: 快速过滤不同量纲的单位

### 2. 量纲分组管理

```typescript
// 按量纲组织单位
private dimensionGroups: Map<Dimension, Set<UnitName>> = new Map();

// 获取指定量纲的所有单位
getUnitsInDimension(dimension: Dimension): UnitName[] {
  return Array.from(this.dimensionGroups.get(dimension) || new Set());
}
```

#### 分组策略
- **Length**: meter, centimeter, inch, foot, mile, etc.
- **Weight**: kilogram, gram, pound, ounce, etc.
- **Temperature**: celsius, fahrenheit, kelvin
- **Speed**: m/s, km/h, mph, knot, etc.
- **Digital**: byte, kilobyte, megabyte, bit, etc.

## Advanced Features

### 1. 批量转换算法

```typescript
convertToAll(value: number, from: UnitName): Array<{
  unit: UnitName;
  value: number;
  symbol: string;
  description: string;
}> {
  const fromNode = this.graph.get(from);
  const dimension = fromNode.dimension;
  const unitsInDimension = this.dimensionGroups.get(dimension) || new Set();
  
  const results = [];
  for (const unit of unitsInDimension) {
    if (unit !== from) {
      try {
        const convertedValue = this.convert(value, from, unit);
        const unitNode = this.graph.get(unit)!;
        results.push({
          unit,
          value: convertedValue,
          symbol: unitNode.symbol,
          description: unitNode.description,
        });
      } catch {
        // 忽略转换失败的单位
      }
    }
  }
  
  return results;
}
```

### 2. 配置驱动的图构建

```typescript
loadFromConfig(config: UnitConfig): void {
  // 1. 添加所有单位节点
  for (const unit of config.units) {
    this.addUnit(unit.name, unit.dimension, unit.symbol, unit.description);
  }

  // 2. 建立转换关系
  for (const conversion of config.conversions) {
    const forwardFn = new Function('value', `return ${conversion.forward}`) as ConversionFunction;
    const backwardFn = new Function('value', `return ${conversion.backward}`) as ConversionFunction;
    this.addConversion(conversion.from, conversion.to, forwardFn, backwardFn);
  }
}
```

### 3. 数制转换支持

```typescript
addNumberBaseConversions(): void {
  // 添加进制转换单位
  const bases = [
    { name: "binary", symbol: "bin", base: 2 },
    { name: "octal", symbol: "oct", base: 8 },
    { name: "decimal", symbol: "dec", base: 10 },
    { name: "hexadecimal", symbol: "hex", base: 16 }
  ];

  for (const base of bases) {
    this.addUnit(base.name, "number_base", base.symbol, `Base ${base.base}`);
  }

  // 建立进制转换关系
  for (let i = 0; i < bases.length; i++) {
    for (let j = i + 1; j < bases.length; j++) {
      const from = bases[i];
      const to = bases[j];
      
      this.addConversion(
        from.name, to.name,
        (value: number) => parseInt(value.toString(), from.base),
        (value: number) => parseInt(value.toString(), to.base)
      );
    }
  }
}
```

## Performance Optimizations

### 1. 路径缓存机制

```typescript
private pathCache: Map<string, ConversionPath | null> = new Map();

findConversionPath(from: UnitName, to: UnitName): ConversionPath | null {
  const cacheKey = `${from}->${to}`;
  
  if (this.pathCache.has(cacheKey)) {
    return this.pathCache.get(cacheKey)!;
  }

  const path = this.computeConversionPath(from, to);
  this.pathCache.set(cacheKey, path);
  
  return path;
}
```

### 2. 懒加载策略

```typescript
// 只在需要时构建特定量纲的转换关系
private buildDimensionGraph(dimension: Dimension): void {
  if (this.dimensionBuilt.has(dimension)) return;
  
  const units = this.getUnitsInDimension(dimension);
  // 构建该量纲内的完整转换网络
  
  this.dimensionBuilt.add(dimension);
}
```

### 3. 内存管理

```typescript
// 定期清理缓存
clearCache(): void {
  this.pathCache.clear();
}

// 限制缓存大小
private static readonly MAX_CACHE_SIZE = 1000;

private addToCache(key: string, value: ConversionPath | null): void {
  if (this.pathCache.size >= UnitConverter.MAX_CACHE_SIZE) {
    const firstKey = this.pathCache.keys().next().value;
    this.pathCache.delete(firstKey);
  }
  this.pathCache.set(key, value);
}
```

## Error Handling and Validation

### 1. 输入验证

```typescript
// 单位存在性验证
private validateUnit(unit: UnitName): void {
  if (!this.graph.has(unit)) {
    throw new Error(`Unit '${unit}' not found`);
  }
}

// 量纲一致性验证
private validateDimension(from: UnitName, to: UnitName): void {
  const fromDimension = this.graph.get(from)!.dimension;
  const toDimension = this.graph.get(to)!.dimension;
  
  if (fromDimension !== toDimension) {
    throw new Error(
      `Cannot convert between different dimensions: ${fromDimension} and ${toDimension}`
    );
  }
}
```

### 2. 数值范围检查

```typescript
// 防止数值溢出
private validateNumericResult(value: number): number {
  if (!isFinite(value)) {
    throw new Error('Conversion resulted in infinite or NaN value');
  }
  
  if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    throw new Error('Conversion result exceeds safe integer range');
  }
  
  return value;
}
```

### 3. 循环检测

```typescript
// 检测图中的循环依赖
private detectCycles(): boolean {
  const visited = new Set<UnitName>();
  const recursionStack = new Set<UnitName>();

  for (const unit of this.graph.keys()) {
    if (this.hasCycleDFS(unit, visited, recursionStack)) {
      return true;
    }
  }
  
  return false;
}
```

## Testing and Validation

### 1. 单元测试覆盖

- **基础功能**: 单位添加、转换关系建立
- **路径查找**: BFS算法正确性
- **数值转换**: 精度和准确性
- **错误处理**: 异常情况处理
- **性能测试**: 大规模数据处理

### 2. 转换精度验证

```typescript
// 往返转换精度测试
function testRoundTripAccuracy(converter: UnitConverter, from: string, to: string, value: number): boolean {
  const converted = converter.convert(value, from, to);
  const backConverted = converter.convert(converted, to, from);
  const tolerance = Math.abs(value) * 1e-10; // 相对误差容忍度
  
  return Math.abs(value - backConverted) <= tolerance;
}
```

## Conclusion

本单位转换器采用图论算法设计，具有以下核心优势：

1. **灵活性**: 支持任意单位间的转换路径发现
2. **可扩展性**: 易于添加新单位和转换关系
3. **高效性**: BFS算法确保最短路径查找
4. **准确性**: 支持高精度数值计算
5. **健壮性**: 完善的错误处理和验证机制

该设计为用户提供了强大、可靠的单位转换功能，支持13个量纲、90+个单位、200+种转换关系，满足各种应用场景的需求。 