import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export type KeyboardType = "simple-cal";
export type CalculatorBase = 2 | 8 | 10 | 16;

interface BaseKeyboardProps {
  type: KeyboardType;
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onClose: () => void;
  className?: string;
}

interface SimpleCalKeyboardProps extends BaseKeyboardProps {
  type: "simple-cal";
  base: CalculatorBase;
  onBaseChange: (base: CalculatorBase) => void;
}

type KeyboardProps = SimpleCalKeyboardProps;

export function Keyboard(props: KeyboardProps) {
  if (props.type === "simple-cal") {
    return <SimpleCalKeyboard {...props} />;
  }

  // 未来可以添加其他键盘类型，例如：
  // if (props.type === 'scientific-cal') {
  //   return <ScientificCalKeyboard {...props} />;
  // }
  // if (props.type === 'text-input') {
  //   return <TextInputKeyboard {...props} />;
  // }

  return null;
}

function SimpleCalKeyboard({
  base,
  onBaseChange,
  onKeyPress,
  onClear,
  onBackspace,
  onCalculate,
  onClose,
  className = "",
}: Omit<SimpleCalKeyboardProps, "type">) {
  // Get available keys for current base
  const getAvailableKeys = useCallback((currentBase: CalculatorBase) => {
    const digits = {
      2: ["0", "1"],
      8: ["0", "1", "2", "3", "4", "5", "6", "7"],
      10: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      16: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
      ],
    };

    const operators = [
      "&",
      "|",
      "^",
      "~",
      "<<",
      ">>",
      "+",
      "-",
      "*",
      "/",
      "%",
      "(",
      ")",
    ];

    return {
      digits: digits[currentBase],
      operators,
    };
  }, []);

  const { digits, operators } = getAvailableKeys(base);

  return (
    <div className={`w-80 p-4 space-y-4 ${className}`}>
      {/* Base selector */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Base</Label>
        <Select
          value={base.toString()}
          onValueChange={(value) =>
            onBaseChange(parseInt(value) as CalculatorBase)
          }
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Bin</SelectItem>
            <SelectItem value="8">Oct</SelectItem>
            <SelectItem value="10">Dec</SelectItem>
            <SelectItem value="16">Hex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Digits */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Digits</Label>
        <div className="grid grid-cols-4 gap-1">
          {digits.map((digit) => (
            <Button
              key={digit}
              variant="outline"
              size="sm"
              className="h-8 font-mono"
              onClick={() => onKeyPress(digit)}
            >
              {digit}
            </Button>
          ))}
        </div>
      </div>

      {/* Operators */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Operators</Label>
        <div className="grid grid-cols-4 gap-1">
          {operators.map((op) => (
            <Button
              key={op}
              variant="outline"
              size="sm"
              className="h-8 font-mono text-xs"
              onClick={() => onKeyPress(op)}
            >
              {op}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Control buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onBackspace}
        >
          ⌫
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onClear}
        >
          Clear
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={onCalculate}
        >
          = Calculate
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onClose}
        >
          Done
        </Button>
      </div>
    </div>
  );
}

// 导出类型以供其他组件使用
export type { SimpleCalKeyboardProps };
