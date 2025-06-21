import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type KeyboardVariant =
  | "numeric" // 数字键盘 (3x4)
  | "calculator" // 计算器键盘 (4x4)
  | "qwerty" // QWERTY字母键盘
  | "qwerty-compact" // 紧凑QWERTY键盘
  | "operators" // 操作符键盘
  | "hex" // 十六进制键盘
  | "binary" // 二进制键盘
  | "custom"; // 自定义布局

export interface KeyboardProps {
  variant: KeyboardVariant;
  onKeyPress: (key: string) => void;
  layout?: string[][]; // 仅在 variant='custom' 时需要
  className?: string;
}

export function Keyboard({
  variant,
  onKeyPress,
  layout: customLayout,
  className,
}: KeyboardProps) {
  const getLayout = (variant: KeyboardVariant): string[][] => {
    switch (variant) {
      case "numeric":
        return [
          ["7", "8", "9"],
          ["4", "5", "6"],
          ["1", "2", "3"],
          ["0", ".", "="],
        ];

      case "calculator":
        return [
          ["7", "8", "9", "/"],
          ["4", "5", "6", "*"],
          ["1", "2", "3", "-"],
          ["0", ".", "=", "+"],
        ];

      case "qwerty":
        return [
          ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
          ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
          ["Z", "X", "C", "V", "B", "N", "M"],
        ];

      case "qwerty-compact":
        return [
          ["Q", "W", "E", "R", "T"],
          ["A", "S", "D", "F", "G"],
          ["Z", "X", "C", "V", "B"],
        ];

      case "operators":
        return [
          ["&", "|", "^"],
          ["<<", ">>", "~"],
          ["(", ")", "="],
        ];

      case "hex":
        return [
          ["0", "1", "2", "3"],
          ["4", "5", "6", "7"],
          ["8", "9", "A", "B"],
          ["C", "D", "E", "F"],
        ];

      case "binary":
        return [["0", "1"]];

      case "custom":
        if (!customLayout) {
          throw new Error('Custom layout is required when variant is "custom"');
        }
        return customLayout;

      default:
        return [[""]];
    }
  };

  const getVariantStyles = (variant: KeyboardVariant) => {
    switch (variant) {
      case "binary":
      case "operators":
        return {
          container: "gap-2",
          button: "h-12 min-w-16 text-base font-semibold",
          row: "gap-2",
        };
      case "qwerty-compact":
      case "hex":
        return {
          container: "gap-1",
          button: "h-8 min-w-8 text-xs",
          row: "gap-1",
        };
      case "qwerty":
        return {
          container: "gap-2",
          button: "h-10 min-w-10 text-sm",
          row: "gap-2",
        };
      default:
        // numeric, calculator, custom
        return {
          container: "gap-2",
          button: "h-10 min-w-10 text-sm",
          row: "gap-2",
        };
    }
  };

  const layout = getLayout(variant);
  const styles = getVariantStyles(variant);

  return (
    <div className={cn("flex flex-col", styles.container, className)}>
      {layout.map((row, rowIndex) => (
        <div key={rowIndex} className={cn("flex justify-center", styles.row)}>
          {row.map((key, keyIndex) => (
            <Button
              key={`${rowIndex}-${keyIndex}`}
              variant="outline"
              className={cn("font-mono flex-shrink-0", styles.button)}
              onClick={() => onKeyPress(key)}
            >
              {key}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
