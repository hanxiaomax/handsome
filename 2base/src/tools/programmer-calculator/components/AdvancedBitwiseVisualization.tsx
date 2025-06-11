import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Base } from "../types";
import { parseValue, formatForBase } from "../lib/base-converter";
import { toggleBit } from "../lib/bitwise";
import { performCalculation } from "../lib/calculator";
import { useCalculatorSnapshot, useCalculatorActions } from "../lib/store";

export function AdvancedBitwiseVisualization() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // 从 store 获取状态
  const { currentValue, previousValue, operation, base, bitWidth } =
    useCalculatorSnapshot();
  const actions = useCalculatorActions();

  // 解析数值
  const parseValueSafe = useCallback(
    (value: string, fallback: number = 0): number => {
      try {
        return parseValue(value || "0", base, bitWidth);
      } catch {
        return fallback;
      }
    },
    [base, bitWidth]
  );

  const currentDecimal = parseValueSafe(currentValue);
  const previousDecimal = parseValueSafe(previousValue);

  // 计算结果
  const getCalculationResult = useCallback((): number => {
    if (!operation || !previousValue) {
      return currentDecimal;
    }

    try {
      return performCalculation(
        previousValue,
        currentValue,
        operation,
        base,
        bitWidth
      );
    } catch {
      return 0;
    }
  }, [operation, previousValue, currentValue, currentDecimal, base, bitWidth]);

  const resultDecimal = getCalculationResult();

  // 格式化不同进制的值
  const formatValue = useCallback((value: number, targetBase: Base): string => {
    try {
      return formatForBase(value.toString(), targetBase).toUpperCase();
    } catch {
      return "0";
    }
  }, []);

  // 位点击处理 - 直接更新 store
  const handleBitClick = useCallback(
    (value: number, rowType: "current" | "previous") => {
      return (position: number) => {
        const newValue = toggleBit(value, position, bitWidth);
        const formattedValue = formatForBase(newValue.toString(), base);

        if (rowType === "current") {
          // 通过 store 更新，标记来源为 visualization
          actions.setValue(formattedValue, "visualization");
        }
        // 对于 previous 值，暂时只处理 current
      };
    },
    [bitWidth, base, actions]
  );

  // 渲染单行位表示
  const renderBitRow = (
    label: string,
    value: number,
    color: string = "default",
    clickable: boolean = false,
    rowType?: "current" | "previous",
    prefix?: string
  ) => {
    const binary = formatValue(value, 2).padStart(bitWidth, "0");
    const hex = formatValue(value, 16);
    const isSigned = value < 0 || value >= Math.pow(2, bitWidth - 1);

    return (
      <div
        className={`flex items-center py-2 px-3 rounded ${
          hoveredRow === label ? "bg-muted/50" : ""
        }`}
        onMouseEnter={() => setHoveredRow(label)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        {/* 左侧区域：运算符和数值 */}
        <div className="flex items-center w-[120px] border-r border-border pr-3">
          {/* 操作符前缀（如果有）- 固定8px宽度槽位 */}
          <div className="w-8 text-center font-mono text-sm font-bold text-primary">
            {prefix || ""}
          </div>

          {/* 十进制值 - 固定宽度确保对齐 */}
          <div className="w-20 text-right font-mono text-sm">{value}</div>
        </div>

        {/* 中间区域：位序列 */}
        <div className="flex-1 px-4 border-r border-border">
          <div className="flex gap-1">
            {binary.split("").map((bit, index) => {
              const position = bitWidth - 1 - index;

              return (
                <span
                  key={position}
                  className={`w-4 h-4 flex items-center justify-center text-xs font-mono ${
                    bit === "1"
                      ? color === "primary"
                        ? "text-primary font-bold"
                        : color === "secondary"
                        ? "text-secondary font-bold"
                        : "text-accent-foreground font-bold"
                      : "text-muted-foreground"
                  } ${
                    clickable
                      ? "cursor-pointer hover:bg-accent/20 rounded"
                      : "cursor-default"
                  } ${index % 4 === 0 && index > 0 ? "ml-1" : ""} ${
                    index % 8 === 0 && index > 0 ? "ml-2" : ""
                  }`}
                  onClick={
                    clickable
                      ? () => handleBitClick(value, rowType!)(position)
                      : undefined
                  }
                >
                  {bit}
                </span>
              );
            })}
          </div>
        </div>

        {/* 右侧区域：十六进制和类型信息 */}
        <div className="flex items-center w-[240px] pl-3">
          {/* 十六进制值 - 固定宽度列 */}
          <div className="w-20 text-left font-mono text-sm text-muted-foreground">
            0x{hex}
          </div>

          {/* 类型信息 - 固定宽度列 */}
          <div className="w-28 flex justify-start">
            <Badge variant="outline" className="text-xs">
              {isSigned ? "S" : "U"}
              {bitWidth}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  // 获取操作符显示
  const getOperationDisplay = () => {
    if (!operation) return null;

    const opMap: Record<string, string> = {
      "+": "+",
      "-": "-",
      "*": "*",
      "/": "/",
      "%": "mod",
      "&": "&",
      "|": "|",
      "^": "^",
      "<<": "<<",
      ">>": ">>",
      "~": "~",
    };

    return opMap[operation] || operation;
  };

  return (
    <div className="space-y-6">
      {/* 位运算可视化 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Bitwise Operation Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* 操作数1 (previous value) */}
            {previousValue &&
              operation &&
              renderBitRow(
                previousDecimal.toString(),
                previousDecimal,
                "default",
                false
              )}

            {/* 操作数2 (current value) 带运算符前缀 */}
            {currentValue &&
              renderBitRow(
                currentDecimal.toString(),
                currentDecimal,
                "primary",
                true,
                "current",
                operation ? getOperationDisplay() || undefined : undefined
              )}

            {/* 分隔线 */}
            {operation && <div className="border-t border-dashed my-2"></div>}

            {operation
              ? renderBitRow("=", resultDecimal, "secondary", false)
              : renderBitRow(
                  currentDecimal.toString(),
                  currentDecimal,
                  "primary",
                  true,
                  "current"
                )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
