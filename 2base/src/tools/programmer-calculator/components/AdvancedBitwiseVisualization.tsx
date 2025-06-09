import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { Base, BitWidth } from "../types";
import { parseValue, formatForBase } from "../lib/base-converter";
import { toggleBit } from "../lib/bitwise";

interface AdvancedBitwiseVisualizationProps {
  currentValue: string;
  base: Base;
  bitWidth: BitWidth;
  onValueChange: (value: string) => void;
}

export function AdvancedBitwiseVisualization({
  currentValue,
  base,
  bitWidth,
  onValueChange,
}: AdvancedBitwiseVisualizationProps) {
  const [hoveredBit, setHoveredBit] = useState<number | null>(null);

  // 解析当前值
  const parseCurrentValue = () => {
    try {
      return parseValue(currentValue || "0", base, bitWidth);
    } catch {
      return 0;
    }
  };

  const decimal = parseCurrentValue();

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
  const handleBitClick = (position: number) => {
    const newValue = toggleBit(decimal, position, bitWidth);
    const formattedValue = formatForBase(newValue.toString(), base);
    onValueChange(formattedValue);
  };

  // 渲染位组（4位一组）
  const renderBitGroups = () => {
    const bits = [];
    for (let i = 0; i < bitWidth; i++) {
      const position = bitWidth - 1 - i;
      const bitValue = (decimal >> position) & 1;
      bits.push({ position, value: bitValue });
    }

    const groups = [];
    for (let i = 0; i < bits.length; i += 4) {
      groups.push(bits.slice(i, i + 4));
    }

    return (
      <div className="space-y-2">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-1">
            <div className="w-8 text-xs text-muted-foreground text-right">
              {group[0].position}
            </div>
            <div className="flex gap-1">
              {group.map((bit) => (
                <Button
                  key={bit.position}
                  variant={bit.value ? "default" : "outline"}
                  size="sm"
                  className={`w-8 h-8 p-0 text-xs font-mono transition-all ${
                    hoveredBit === bit.position ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleBitClick(bit.position)}
                  onMouseEnter={() => setHoveredBit(bit.position)}
                  onMouseLeave={() => setHoveredBit(null)}
                >
                  {bit.value}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground ml-2">
              0x{group[0].position.toString(16).toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 数值概览 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            Value Overview
            <Badge variant="outline">{bitWidth}-bit</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 多进制显示 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">DEC:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">{decimal}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(decimal.toString(), "Decimal")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">HEX:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">
                  0x{formatValue(decimal, 16)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `0x${formatValue(decimal, 16)}`,
                      "Hexadecimal"
                    )
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">BIN:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">0b{formatValue(decimal, 2)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(`0b${formatValue(decimal, 2)}`, "Binary")
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">OCT:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">0o{formatValue(decimal, 8)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(`0o${formatValue(decimal, 8)}`, "Octal")
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 位可视化 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Interactive Bit Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 位信息提示 */}
            {hoveredBit !== null && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-sm">
                  <strong>Bit {hoveredBit}</strong>: Weight = 2^{hoveredBit} ={" "}
                  {Math.pow(2, hoveredBit).toLocaleString()}
                </div>
              </div>
            )}

            {/* 位组显示 */}
            {renderBitGroups()}

            {/* 操作说明 */}
            <div className="text-xs text-muted-foreground">
              Click any bit to toggle its value. Hover for weight information.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
