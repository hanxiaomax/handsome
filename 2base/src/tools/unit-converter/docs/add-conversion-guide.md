# 单位转换器 - 新增转换关系指南

## 概述
本指南详细介绍如何在单位转换器中添加新的转换关系，包括简单线性转换和复杂非线性转换的处理方法。

## 1. 简单线性转换（推荐方法）

### 适用场景
- 大多数物理单位转换（长度、重量、体积等）
- 转换公式为：`目标值 = 源值 × 转换系数`

### 添加步骤

#### 步骤1：在 `data.ts` 中添加单位定义

```typescript
// 在 src/tools/unit-converter/lib/data.ts 中添加
{
  id: "light_year",
  name: "Light Year",
  symbol: "ly",
  baseRatio: 9.461e15, // 1光年 = 9.461×10^15 米
  isBaseUnit: false,
  precision: 2,
  scientificNotation: true, // 大数值使用科学计数法
  description: "Distance light travels in one year",
  context: "Astronomical distances and space measurements",
}
```

#### 步骤2：确定基准单位和转换系数

每个分类都有一个基准单位（`isBaseUnit: true`），所有其他单位都相对于基准单位定义转换系数：

```typescript
// 长度分类示例
const lengthUnits = [
  {
    id: "meter",
    baseRatio: 1,        // 基准单位
    isBaseUnit: true,
  },
  {
    id: "kilometer", 
    baseRatio: 1000,     // 1km = 1000m
  },
  {
    id: "centimeter",
    baseRatio: 0.01,     // 1cm = 0.01m
  },
  {
    id: "inch",
    baseRatio: 0.0254,   // 1英寸 = 0.0254m
  }
];
```

### 完整示例：添加新的长度单位

```typescript
// 在长度分类的科学单位组中添加
{
  id: "astronomical_unit",
  name: "Astronomical Unit",
  symbol: "AU",
  baseRatio: 149597870700, // 1 AU = 149,597,870,700 米
  isBaseUnit: false,
  precision: 6,
  scientificNotation: true,
  description: "Average distance from Earth to Sun",
  context: "Solar system distances and planetary measurements",
}
```

## 2. 复杂非线性转换

### 适用场景
- 温度转换（有偏移量）
- 对数转换（分贝、pH值等）
- 复杂数学公式转换

### 方法1：使用 baseOffset（温度转换）

```typescript
// 温度单位示例
{
  id: "celsius",
  name: "Celsius",
  symbol: "°C",
  baseRatio: 1,
  baseOffset: 273.15,  // 摄氏度到开尔文的偏移
  isBaseUnit: false,
  precision: 2,
  description: "Temperature scale based on water freezing/boiling",
  context: "Daily weather and cooking temperatures",
}
```

### 方法2：在引擎中添加特殊转换逻辑

对于更复杂的转换，需要在 `engine.ts` 中添加特殊处理：

```typescript
// 在 UnitConverterEngine 类中添加
private convertSpecialUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  // 示例：分贝转换（对数转换）
  if (this.isDecibelUnit(fromUnit) || this.isDecibelUnit(toUnit)) {
    return this.convertDecibel(value, fromUnit, toUnit);
  }
  
  // 示例：pH值转换
  if (this.isPHUnit(fromUnit) || this.isPHUnit(toUnit)) {
    return this.convertPH(value, fromUnit, toUnit);
  }
  
  // 默认线性转换
  return this.standardConvert(value, fromUnit, toUnit);
}

private convertDecibel(value: number, fromUnit: Unit, toUnit: Unit): number {
  // 分贝转换逻辑
  if (fromUnit.id === "decibel" && toUnit.id === "bel") {
    return value / 10;
  }
  if (fromUnit.id === "bel" && toUnit.id === "decibel") {
    return value * 10;
  }
  // 功率比转换：dB = 10 * log10(P1/P0)
  if (fromUnit.id === "power_ratio" && toUnit.id === "decibel") {
    return 10 * Math.log10(value);
  }
  if (fromUnit.id === "decibel" && toUnit.id === "power_ratio") {
    return Math.pow(10, value / 10);
  }
  
  throw new Error("Unsupported decibel conversion");
}
```

### 方法3：自定义转换函数

```typescript
// 为特殊单位添加自定义转换函数
interface AdvancedUnit extends Unit {
  customConverter?: {
    toBase: (value: number) => number;
    fromBase: (value: number) => number;
  };
}

// 示例：添加对数单位
{
  id: "ph_value",
  name: "pH Value",
  symbol: "pH",
  baseRatio: 1, // 不使用标准转换
  isBaseUnit: false,
  precision: 2,
  description: "Measure of acidity/alkalinity",
  context: "Chemistry and water quality testing",
  customConverter: {
    toBase: (ph: number) => Math.pow(10, -ph), // pH to H+ concentration
    fromBase: (concentration: number) => -Math.log10(concentration), // H+ to pH
  }
}
```

## 3. 添加新的转换分类

### 创建全新的分类

```typescript
// 在 data.ts 中添加新分类
{
  id: "energy",
  name: "Energy",
  icon: "E",
  description: "Energy and work measurements",
  groups: [
    {
      id: "metric",
      name: "Metric Units",
      units: [
        {
          id: "joule",
          name: "Joule",
          symbol: "J",
          baseRatio: 1,
          isBaseUnit: true,
          precision: 6,
          description: "SI unit of energy",
          context: "Physics and engineering calculations",
        },
        {
          id: "kilojoule",
          name: "Kilojoule",
          symbol: "kJ",
          baseRatio: 1000,
          isBaseUnit: false,
          precision: 3,
          description: "1000 joules",
          context: "Food energy and larger energy measurements",
        },
        {
          id: "calorie",
          name: "Calorie",
          symbol: "cal",
          baseRatio: 4.184, // 1 cal = 4.184 J
          isBaseUnit: false,
          precision: 3,
          description: "Energy to heat 1g water by 1°C",
          context: "Food energy and nutrition",
        },
      ],
    },
    {
      id: "electrical",
      name: "Electrical Units",
      units: [
        {
          id: "watt_hour",
          name: "Watt Hour",
          symbol: "Wh",
          baseRatio: 3600, // 1 Wh = 3600 J
          isBaseUnit: false,
          precision: 3,
          description: "Energy consumed by 1W in 1 hour",
          context: "Electrical energy consumption",
        },
        {
          id: "kilowatt_hour",
          name: "Kilowatt Hour",
          symbol: "kWh",
          baseRatio: 3600000, // 1 kWh = 3,600,000 J
          isBaseUnit: false,
          precision: 3,
          description: "1000 watt hours",
          context: "Household electricity billing",
        },
      ],
    },
  ],
}
```

## 4. 处理复杂转换公式的最佳实践

### 实践1：分步转换

对于复杂转换，先转换到中间单位：

```typescript
// 示例：华氏度 → 摄氏度 → 开尔文
private convertComplexTemperature(value: number, fromUnit: Unit, toUnit: Unit): number {
  // Step 1: Convert to Celsius (intermediate unit)
  let celsius: number;
  if (fromUnit.id === "fahrenheit") {
    celsius = (value - 32) * 5/9;
  } else if (fromUnit.id === "kelvin") {
    celsius = value - 273.15;
  } else {
    celsius = value; // Already Celsius
  }
  
  // Step 2: Convert from Celsius to target
  if (toUnit.id === "fahrenheit") {
    return celsius * 9/5 + 32;
  } else if (toUnit.id === "kelvin") {
    return celsius + 273.15;
  } else {
    return celsius; // Target is Celsius
  }
}
```

### 实践2：使用查找表

对于离散转换关系：

```typescript
// 示例：服装尺码转换
const sizeMappings = {
  "us_to_eu": {
    "XS": "32",
    "S": "34",
    "M": "36",
    "L": "38",
    "XL": "40",
  },
  "eu_to_us": {
    "32": "XS",
    "34": "S", 
    "36": "M",
    "38": "L",
    "40": "XL",
  }
};

private convertClothingSize(value: string, fromUnit: Unit, toUnit: Unit): string {
  const mappingKey = `${fromUnit.id}_to_${toUnit.id}`;
  const mapping = sizeMappings[mappingKey];
  return mapping?.[value] || "N/A";
}
```

### 实践3：JavaScript表达式转换

对于用户自定义转换：

```typescript
// 在 CustomConversion 中使用
{
  id: "custom_pressure",
  name: "Custom Pressure Formula",
  symbol: "cP",
  description: "Pressure with altitude correction",
  formula: "value * Math.exp(-altitude / 8400)", // JavaScript表达式
  isJavaScript: true,
  createdAt: new Date(),
}

// 在引擎中评估
private evaluateCustomFormula(formula: string, value: number, context: any = {}): number {
  try {
    // 创建安全的执行环境
    const safeContext = {
      value,
      Math,
      ...context
    };
    
    // 使用Function构造器而不是eval（更安全）
    const func = new Function('value', 'Math', 'altitude', `return ${formula}`);
    return func(value, Math, context.altitude || 0);
  } catch (error) {
    throw new Error(`Formula evaluation failed: ${error.message}`);
  }
}
```

## 5. 验证和测试

### 添加单元测试

```typescript
// 在测试文件中添加
describe('New Unit Conversions', () => {
  test('light year to meter conversion', () => {
    const engine = new UnitConverterEngine(unitCategories);
    const result = engine.convert(1, 'light_year', 'meter');
    expect(result).toBeCloseTo(9.461e15, 10);
  });
  
  test('complex temperature conversion', () => {
    const engine = new UnitConverterEngine(unitCategories);
    const result = engine.convert(100, 'celsius', 'fahrenheit');
    expect(result).toBeCloseTo(212, 2);
  });
});
```

### 验证转换精度

```typescript
// 检查转换的双向一致性
private validateConversion(value: number, unit1: string, unit2: string): boolean {
  const forward = this.convert(value, unit1, unit2);
  const backward = this.convert(forward, unit2, unit1);
  const tolerance = 1e-10;
  return Math.abs(value - backward) < tolerance;
}
```

## 6. 性能优化建议

### 缓存转换结果

```typescript
private conversionCache = new Map<string, number>();

convert(value: number, fromUnit: string, toUnit: string): number {
  const cacheKey = `${value}_${fromUnit}_${toUnit}`;
  
  if (this.conversionCache.has(cacheKey)) {
    return this.conversionCache.get(cacheKey)!;
  }
  
  const result = this.performConversion(value, fromUnit, toUnit);
  this.conversionCache.set(cacheKey, result);
  
  return result;
}
```

### 预计算转换系数

```typescript
// 在初始化时预计算所有转换系数
private precomputeConversionMatrix(): void {
  for (const category of this.categories.values()) {
    const units = this.getUnitsInCategory(category.id);
    for (const from of units) {
      for (const to of units) {
        if (from.id !== to.id) {
          const ratio = from.baseRatio / to.baseRatio;
          this.conversionMatrix.set(`${from.id}_${to.id}`, ratio);
        }
      }
    }
  }
}
```

## 总结

1. **简单转换**：使用 `baseRatio` 系数，适用于90%的转换需求
2. **温度转换**：使用 `baseOffset` 处理偏移量
3. **复杂转换**：在引擎中添加特殊处理逻辑
4. **自定义转换**：支持JavaScript表达式和查找表
5. **验证测试**：确保转换的准确性和双向一致性
6. **性能优化**：使用缓存和预计算提高转换速度

通过这些方法，您可以轻松添加各种类型的单位转换关系，从简单的线性转换到复杂的非线性转换公式。 