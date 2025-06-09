import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { Base, BitWidth, Operation } from "../types";
import { parseValue, formatForBase } from "../lib/base-converter";
import { toggleBit } from "../lib/bitwise";
import { performCalculation } from "../lib/calculator";

interface AdvancedBitwiseVisualizationProps {
  currentValue: string;
  previousValue: string;
  operation: Operation;
  base: Base;
  bitWidth: BitWidth;
  onValueChange: (value: string) => void;
}

export function AdvancedBitwiseVisualization({
  currentValue,
  previousValue,
  operation,
  base,
  bitWidth,
  onValueChange,
}: AdvancedBitwiseVisualizationProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // 解析数值
  const parseValueSafe = (value: string, fallback: number = 0): number => {
    try {
      return parseValue(value || "0", base, bitWidth);
    } catch {
      return fallback;
    }
  };

  const currentDecimal = parseValueSafe(currentValue);
  const previousDecimal = parseValueSafe(previousValue);

  // 计算结果
  const getCalculationResult = (): number => {
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
  };

  const resultDecimal = getCalculationResult();

  // 格式化不同进制的值
  const formatValue = (value: number, targetBase: Base): string => {
    try {
      return formatForBase(value.toString(), targetBase).toUpperCase();
    } catch {
      return "0";
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${format}: ${text}`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  // 位点击处理
  const handleBitClick = (value: number, rowType: "current" | "previous") => {
    return (position: number) => {
      const newValue = toggleBit(value, position, bitWidth);
      const formattedValue = formatForBase(newValue.toString(), base);

      if (rowType === "current") {
        onValueChange(formattedValue);
      }
      // 对于 previous 值，我们需要其他方式来更新，这里暂时只处理 current
    };
  };

  // 渲染单行位表示
  const renderBitRow = (
    label: string,
    value: number,
    color: string = "default",
    clickable: boolean = false,
    rowType?: "current" | "previous"
  ) => {
    const binary = formatValue(value, 2).padStart(bitWidth, "0");
    const hex = formatValue(value, 16);
    const isSigned = value < 0 || value >= Math.pow(2, bitWidth - 1);

    return (
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded ${
          hoveredRow === label ? "bg-muted/50" : ""
        }`}
        onMouseEnter={() => setHoveredRow(label)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        {/* 十进制值 */}
        <div className="w-16 text-right font-mono text-sm mr-5">{value}</div>

        {/* 位表示 */}
        <div className="flex gap-1">
          {binary.split("").map((bit, index) => {
            const position = bitWidth - 1 - index;

            return (
              <span
                key={position}
                className={`w-3 h-3 flex items-center justify-center text-xs font-mono ${
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
                } ${index % 4 === 0 && index > 0 ? "ml-1" : ""}`}
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

        <div className="flex items-center gap-2 ml-4">
          <span className="font-mono text-sm">0x{hex}</span>
          <Badge variant="outline" className="text-xs">
            {bitWidth}-bit {isSigned ? "signed" : "unsigned"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(`0x${hex}`, "Hexadecimal")}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
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

            {/* 操作符行 */}
            {operation && (
              <div className="flex items-center gap-2 py-1 px-3">
                <div className="w-12 text-right font-mono text-sm font-bold text-primary">
                  {getOperationDisplay()}
                </div>
                <div className="w-16"></div>
                <div className="text-sm text-muted-foreground">
                  {operation === "~"
                    ? "Bitwise NOT"
                    : operation === "&"
                    ? "Bitwise AND"
                    : operation === "|"
                    ? "Bitwise OR"
                    : operation === "^"
                    ? "Bitwise XOR"
                    : operation === "<<"
                    ? "Left Shift"
                    : operation === ">>"
                    ? "Right Shift"
                    : `${operation} operation`}
                </div>
              </div>
            )}

            {/* 操作数2 (current value) */}
            {currentValue &&
              renderBitRow(
                currentDecimal.toString(),
                currentDecimal,
                "primary",
                true,
                "current"
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
