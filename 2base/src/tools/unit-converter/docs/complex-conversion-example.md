# 复杂转换公式示例 - 分贝转换

## 概述
本示例演示如何在单位转换器中添加复杂的非线性转换关系，以分贝（dB）转换为例。

## 分贝转换的复杂性

分贝是对数单位，不能使用简单的线性转换系数。需要特殊的转换逻辑：

### 功率比转换
- **功率分贝**: dB = 10 × log₁₀(P₁/P₀)
- **电压分贝**: dB = 20 × log₁₀(V₁/V₀)

## 实现步骤

### 1. 添加分贝单位到数据定义

```typescript
// 在 data.ts 中添加新的声学分类
{
  id: "acoustic",
  name: "Acoustic",
  icon: "A",
  description: "Sound and acoustic measurements",
  groups: [
    {
      id: "sound_level",
      name: "Sound Level",
      units: [
        {
          id: "decibel_spl",
          name: "Decibel (SPL)",
          symbol: "dB SPL",
          baseRatio: 1, // 不使用标准转换
          isBaseUnit: true,
          precision: 1,
          description: "Sound pressure level in decibels",
          context: "Audio and noise measurements",
        },
        {
          id: "bel",
          name: "Bel",
          symbol: "B",
          baseRatio: 10, // 1 B = 10 dB (简单线性关系)
          isBaseUnit: false,
          precision: 2,
          description: "10 decibels",
          context: "Scientific acoustic measurements",
        },
        {
          id: "neper",
          name: "Neper",
          symbol: "Np",
          baseRatio: 8.686, // 1 Np ≈ 8.686 dB
          isBaseUnit: false,
          precision: 3,
          description: "Natural logarithmic unit",
          context: "Engineering and physics",
        },
      ],
    },
    {
      id: "power_ratio",
      name: "Power Ratio",
      units: [
        {
          id: "power_ratio",
          name: "Power Ratio",
          symbol: "ratio",
          baseRatio: 1, // 特殊处理
          isBaseUnit: false,
          precision: 6,
          description: "Linear power ratio",
          context: "Engineering power calculations",
        },
        {
          id: "voltage_ratio",
          name: "Voltage Ratio", 
          symbol: "V ratio",
          baseRatio: 1, // 特殊处理
          isBaseUnit: false,
          precision: 6,
          description: "Linear voltage ratio",
          context: "Electronic circuit analysis",
        },
      ],
    },
  ],
}
```

### 2. 在引擎中添加特殊转换逻辑

```typescript
// 在 engine.ts 中添加
export class UnitConverterEngine {
  // ... 现有代码 ...

  convert(value: number, fromUnitId: string, toUnitId: string): number {
    const fromUnit = this.units.get(fromUnitId);
    const toUnit = this.units.get(toUnitId);

    if (!fromUnit || !toUnit) {
      throw new Error("Invalid unit IDs");
    }

    // 特殊处理：分贝转换
    if (this.isAcousticUnit(fromUnit) || this.isAcousticUnit(toUnit)) {
      return this.convertAcoustic(value, fromUnit, toUnit);
    }

    // 特殊处理：温度转换
    if (this.isTemperatureUnit(fromUnit)) {
      return this.convertTemperature(value, fromUnit, toUnit);
    }

    // 标准线性转换
    const baseValue = value * fromUnit.baseRatio;
    return baseValue / toUnit.baseRatio;
  }

  private isAcousticUnit(unit: Unit): boolean {
    return [
      "decibel_spl", "bel", "neper", 
      "power_ratio", "voltage_ratio"
    ].includes(unit.id);
  }

  /**
   * 声学单位转换（包含对数转换）
   */
  private convertAcoustic(
    value: number,
    fromUnit: Unit,
    toUnit: Unit
  ): number {
    // 先转换到 dB SPL 作为基准单位
    let dbSpl: number;

    // 从源单位转换到 dB SPL
    switch (fromUnit.id) {
      case "decibel_spl":
        dbSpl = value;
        break;
      case "bel":
        dbSpl = value * 10;
        break;
      case "neper":
        dbSpl = value * 8.686;
        break;
      case "power_ratio":
        // 功率比转换：dB = 10 * log10(ratio)
        if (value <= 0) throw new Error("Power ratio must be positive");
        dbSpl = 10 * Math.log10(value);
        break;
      case "voltage_ratio":
        // 电压比转换：dB = 20 * log10(ratio)
        if (value <= 0) throw new Error("Voltage ratio must be positive");
        dbSpl = 20 * Math.log10(value);
        break;
      default:
        throw new Error(`Unsupported acoustic unit: ${fromUnit.id}`);
    }

    // 从 dB SPL 转换到目标单位
    switch (toUnit.id) {
      case "decibel_spl":
        return dbSpl;
      case "bel":
        return dbSpl / 10;
      case "neper":
        return dbSpl / 8.686;
      case "power_ratio":
        // dB 转功率比：ratio = 10^(dB/10)
        return Math.pow(10, dbSpl / 10);
      case "voltage_ratio":
        // dB 转电压比：ratio = 10^(dB/20)
        return Math.pow(10, dbSpl / 20);
      default:
        throw new Error(`Unsupported acoustic unit: ${toUnit.id}`);
    }
  }

  /**
   * 更新近似转换标记
   */
  private isApproximateConversion(
    fromUnitId: string,
    toUnitId: string
  ): boolean {
    const approximateConversions = [
      // ... 现有转换 ...
      ["decibel_spl", "neper"],
      ["power_ratio", "voltage_ratio"],
    ];

    return approximateConversions.some(
      ([a, b]) =>
        (fromUnitId === a && toUnitId === b) ||
        (fromUnitId === b && toUnitId === a)
    );
  }
}
```

### 3. 添加转换验证和测试

```typescript
// 在测试文件中添加
describe('Acoustic Unit Conversions', () => {
  const engine = new UnitConverterEngine(unitCategories);

  test('decibel to bel conversion', () => {
    const result = engine.convert(20, 'decibel_spl', 'bel');
    expect(result).toBeCloseTo(2, 1);
  });

  test('power ratio to decibel conversion', () => {
    // 功率比为 10 应该等于 10 dB
    const result = engine.convert(10, 'power_ratio', 'decibel_spl');
    expect(result).toBeCloseTo(10, 1);
  });

  test('voltage ratio to decibel conversion', () => {
    // 电压比为 10 应该等于 20 dB
    const result = engine.convert(10, 'voltage_ratio', 'decibel_spl');
    expect(result).toBeCloseTo(20, 1);
  });

  test('round trip conversion accuracy', () => {
    const originalValue = 50;
    const toRatio = engine.convert(originalValue, 'decibel_spl', 'power_ratio');
    const backToDb = engine.convert(toRatio, 'power_ratio', 'decibel_spl');
    expect(backToDb).toBeCloseTo(originalValue, 3);
  });

  test('edge cases', () => {
    // 测试 0 dB = 1 的功率比
    const result = engine.convert(0, 'decibel_spl', 'power_ratio');
    expect(result).toBeCloseTo(1, 6);

    // 测试负分贝值
    const negativeDb = engine.convert(0.1, 'power_ratio', 'decibel_spl');
    expect(negativeDb).toBeCloseTo(-10, 1);
  });
});
```

### 4. 错误处理和边界情况

```typescript
// 在转换函数中添加错误处理
private convertAcoustic(
  value: number,
  fromUnit: Unit,
  toUnit: Unit
): number {
  // 验证输入值
  if (!isFinite(value)) {
    throw new Error("Input value must be finite");
  }

  // 对于比值转换，确保值为正数
  if ((fromUnit.id === "power_ratio" || fromUnit.id === "voltage_ratio") && value <= 0) {
    throw new Error(`${fromUnit.name} must be positive`);
  }

  // ... 转换逻辑 ...

  // 验证输出值
  const result = /* 转换结果 */;
  if (!isFinite(result)) {
    throw new Error("Conversion resulted in invalid value");
  }

  return result;
}
```

## 使用场景示例

### 音频工程
```typescript
// 放大器增益计算
const inputPower = 1; // 1瓦输入功率
const outputPower = 100; // 100瓦输出功率
const powerRatio = outputPower / inputPower; // 100
const gainInDb = engine.convert(powerRatio, 'power_ratio', 'decibel_spl');
// 结果：20 dB 增益
```

### 噪音测量
```typescript
// 环境噪音级别比较
const quietRoom = 30; // 30 dB SPL
const busyStreet = 70; // 70 dB SPL
const powerDifference = engine.convert(busyStreet - quietRoom, 'decibel_spl', 'power_ratio');
// 结果：街道比安静房间的声功率大 10000 倍
```

## 扩展到其他对数单位

### pH值转换
```typescript
// pH 值转换示例
{
  id: "ph_value",
  name: "pH Value",
  symbol: "pH",
  // 需要特殊转换逻辑
}

private convertChemical(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit.id === "ph_value" && toUnit.id === "hydrogen_concentration") {
    // pH 转氢离子浓度：[H+] = 10^(-pH)
    return Math.pow(10, -value);
  }
  if (fromUnit.id === "hydrogen_concentration" && toUnit.id === "ph_value") {
    // 氢离子浓度转 pH：pH = -log10([H+])
    return -Math.log10(value);
  }
  // ... 其他转换
}
```

### 地震震级
```typescript
// 里氏震级转换
{
  id: "richter_scale",
  name: "Richter Scale",
  symbol: "M",
  // 每增加1级，能量增加约31.6倍
}

private convertSeismic(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit.id === "richter_scale" && toUnit.id === "energy_joules") {
    // 里氏震级转能量（简化公式）
    return Math.pow(10, 1.5 * value + 4.8);
  }
  // ... 其他转换
}
```

## 总结

复杂转换公式的关键要点：

1. **识别转换类型**：线性、对数、指数、多项式等
2. **选择基准单位**：选择数学上最简单的单位作为中间转换点
3. **分步转换**：复杂转换先转到基准单位，再转到目标单位
4. **错误处理**：验证输入输出值的有效性
5. **精度控制**：对数转换可能导致精度损失，需要适当的舍入
6. **测试验证**：确保双向转换的一致性和边界情况的正确处理

通过这种方式，您可以在单位转换器中添加任何复杂的转换关系，从简单的线性转换到复杂的数学函数转换。 