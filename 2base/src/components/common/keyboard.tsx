import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export type KeyboardVariant =
  | "programmer" // Programmer keyboard with bitwise operations (grid layout)
  | "simple" // Simple calculator keyboard with basic operations (grid layout)
  | "custom" // Custom layout
  | "grid"; // Grid layout

export type BaseType = 2 | 8 | 10 | 16;

// Grid button configuration interface
export interface GridButtonConfig {
  id: string; // Unique button identifier
  label: string; // Button display text
  value: string; // Button value (passed when clicked)
  row: number; // Starting row position (1-based)
  col: number; // Starting column position (1-based)
  rowSpan?: number; // Number of rows to span, default is 1
  colSpan?: number; // Number of columns to span, default is 1
  color?: string; // Button color class name or color value
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean; // Whether the button is disabled
  className?: string; // Custom style class name
}

// Grid configuration interface
export interface GridConfig {
  rows: number; // Number of grid rows
  cols: number; // Number of grid columns
  buttons: GridButtonConfig[]; // Array of button configurations
}

export interface KeyboardProps {
  variant: KeyboardVariant;
  onKeyPress: (key: string, button?: GridButtonConfig) => void;
  layout?: string[][];
  gridConfig?: GridConfig;
  className?: string;
  gap?: "none" | "sm" | "md" | "lg";
  buttonHeight?: "sm" | "md" | "lg" | "xl";
  // Programmer keyboard specific props
  base?: BaseType; // Current base for programmer keyboard
  onBaseChange?: (base: BaseType) => void; // Base change callback
  onClose?: () => void; // Close keyboard callback
}

export function Keyboard({
  variant,
  onKeyPress,
  layout: customLayout,
  gridConfig,
  className,
  gap = "sm",
  buttonHeight = "md",
  base = 10,
  onBaseChange,
  onClose,
}: KeyboardProps) {
  const getLayout = (variant: KeyboardVariant): string[][] => {
    switch (variant) {
      case "custom":
        if (!customLayout) {
          throw new Error('Custom layout is required when variant is "custom"');
        }
        return customLayout;

      case "programmer":
      case "simple":
      case "grid":
        // These variants use grid layout now
        return [[]];

      default:
        return [[""]];
    }
  };

  const getVariantStyles = (variant: KeyboardVariant) => {
    switch (variant) {
      case "programmer":
        return {
          container: "gap-1",
          button: "h-7 min-w-8 text-xs font-medium px-1",
          row: "gap-1",
        };
      case "simple":
        return {
          container: "gap-1",
          button: "h-8 min-w-10 text-sm font-medium px-2",
          row: "gap-1",
        };
      default:
        // custom, grid
        return {
          container: "gap-1",
          button: "h-7 min-w-8 text-xs font-normal px-1",
          row: "gap-1",
        };
    }
  };

  // Check if a key is available in current base
  const isKeyAvailable = (key: string, currentBase: BaseType): boolean => {
    // Hex digits A-F only available in base 16
    if (["A", "B", "C", "D", "E", "F"].includes(key)) {
      return currentBase === 16;
    }
    // Digits 8-9 not available in base 8
    if (["8", "9"].includes(key)) {
      return currentBase >= 10;
    }
    // Digits 2-7 not available in base 2
    if (["2", "3", "4", "5", "6", "7"].includes(key)) {
      return currentBase >= 8;
    }
    // All other keys (operators, parentheses, etc.) are always available
    return true;
  };

  const layout = getLayout(variant);
  const styles = getVariantStyles(variant);

  // Handle special key presses
  const handleKeyPress = (key: string, button?: GridButtonConfig) => {
    switch (key) {
      case "⌫":
        onKeyPress("Backspace", button);
        break;
      case "Clear":
        onKeyPress("Clear", button);
        break;
      case "=":
        onKeyPress("Calculate", button);
        break;
      default:
        onKeyPress(key, button);
        break;
    }
  };

  // Grid keyboard utility functions
  const getGapClass = (gap: string) => {
    switch (gap) {
      case "none":
        return "gap-0";
      case "sm":
        return "gap-1";
      case "md":
        return "gap-2";
      case "lg":
        return "gap-3";
      default:
        return "gap-1";
    }
  };

  const getButtonHeightClass = (height: string) => {
    switch (height) {
      case "sm":
        return "h-8";
      case "md":
        return "h-10";
      case "lg":
        return "h-12";
      case "xl":
        return "h-14";
      default:
        return "h-10";
    }
  };

  const createGridLayout = (config?: GridConfig) => {
    const activeConfig = config || gridConfig || getBuiltinGridConfig(variant);
    if (!activeConfig) return [];

    const { rows, cols, buttons } = activeConfig;
    // Initialize grid with null values for each cell
    const grid: (GridButtonConfig | null)[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null));

    // Place buttons in the grid
    buttons.forEach((button) => {
      const startRow = button.row - 1; // Convert to 0-based index
      const startCol = button.col - 1;
      const rowSpan = button.rowSpan || 1;
      const colSpan = button.colSpan || 1;

      // Check boundaries
      if (
        startRow >= 0 &&
        startRow + rowSpan <= rows &&
        startCol >= 0 &&
        startCol + colSpan <= cols
      ) {
        // Mark all positions occupied by the button
        for (let r = startRow; r < startRow + rowSpan; r++) {
          for (let c = startCol; c < startCol + colSpan; c++) {
            grid[r][c] = button;
          }
        }
      }
    });

    return grid;
  };

  const isButtonStart = (
    button: GridButtonConfig,
    row: number,
    col: number
  ) => {
    return button.row - 1 === row && button.col - 1 === col;
  };

  const getButtonCustomStyles = (button: GridButtonConfig) => {
    const styles: React.CSSProperties = {};

    if (button.color) {
      // If it's a CSS color value
      if (
        button.color.startsWith("#") ||
        button.color.startsWith("rgb") ||
        button.color.startsWith("hsl")
      ) {
        styles.backgroundColor = button.color;
        styles.borderColor = button.color;
        styles.color = getContrastColor(button.color);
      }
    }

    return styles;
  };

  const getContrastColor = (backgroundColor: string): string => {
    // Simplified contrast color calculation
    if (
      backgroundColor.includes("light") ||
      backgroundColor.includes("white") ||
      backgroundColor.startsWith("#f")
    ) {
      return "hsl(var(--foreground))";
    }
    return "hsl(var(--background))";
  };

  // Get built-in grid configuration
  const getBuiltinGridConfig = (
    variant: KeyboardVariant
  ): GridConfig | null => {
    switch (variant) {
      case "programmer":
        return {
          rows: 6,
          cols: 6,
          buttons: [
            { id: "lpar", label: "(", value: "(", row: 1, col: 1 },
            { id: "rpar", label: ")", value: ")", row: 1, col: 2 },
            { id: "lshift", label: "<<", value: "<<", row: 1, col: 3 },
            { id: "rshift", label: ">>", value: ">>", row: 1, col: 4 },
            { id: "not", label: "~", value: "~", row: 1, col: 5 },
            {
              id: "backspace",
              label: "⌫",
              value: "⌫",
              row: 1,
              col: 6,
              variant: "destructive" as const,
            },
            {
              id: "A",
              label: "A",
              value: "A",
              row: 2,
              col: 1,
              color: "bg-accent",
            },
            {
              id: "B",
              label: "B",
              value: "B",
              row: 2,
              col: 2,
              color: "bg-accent",
            },
            {
              id: "C",
              label: "C",
              value: "C",
              row: 2,
              col: 3,
              color: "bg-accent",
            },
            {
              id: "D",
              label: "D",
              value: "D",
              row: 2,
              col: 4,
              color: "bg-accent",
            },
            {
              id: "E",
              label: "E",
              value: "E",
              row: 2,
              col: 5,
              color: "bg-accent",
            },
            {
              id: "F",
              label: "F",
              value: "F",
              row: 2,
              col: 6,
              color: "bg-accent",
            },
            { id: "7", label: "7", value: "7", row: 3, col: 1 },
            { id: "8", label: "8", value: "8", row: 3, col: 2 },
            { id: "9", label: "9", value: "9", row: 3, col: 3 },
            {
              id: "and",
              label: "&",
              value: "&",
              row: 3,
              col: 4,
              variant: "secondary" as const,
            },
            {
              id: "or",
              label: "|",
              value: "|",
              row: 3,
              col: 5,
              variant: "secondary" as const,
            },
            {
              id: "xor",
              label: "^",
              value: "^",
              row: 3,
              col: 6,
              variant: "secondary" as const,
            },
            { id: "4", label: "4", value: "4", row: 4, col: 1 },
            { id: "5", label: "5", value: "5", row: 4, col: 2 },
            { id: "6", label: "6", value: "6", row: 4, col: 3 },
            {
              id: "add",
              label: "+",
              value: "+",
              row: 4,
              col: 4,
              variant: "secondary" as const,
            },
            {
              id: "subtract",
              label: "-",
              value: "-",
              row: 4,
              col: 5,
              variant: "secondary" as const,
            },
            {
              id: "multiply",
              label: "*",
              value: "*",
              row: 4,
              col: 6,
              variant: "secondary" as const,
            },
            { id: "1", label: "1", value: "1", row: 5, col: 1 },
            { id: "2", label: "2", value: "2", row: 5, col: 2 },
            { id: "3", label: "3", value: "3", row: 5, col: 3 },
            {
              id: "divide",
              label: "/",
              value: "/",
              row: 5,
              col: 4,
              variant: "secondary" as const,
            },
            {
              id: "modulo",
              label: "%",
              value: "%",
              row: 5,
              col: 5,
              variant: "secondary" as const,
            },
            {
              id: "clear",
              label: "Clear",
              value: "Clear",
              row: 5,
              col: 6,
              variant: "destructive" as const,
            },
            { id: "0", label: "0", value: "0", row: 6, col: 1 },
            { id: "decimal", label: ".", value: ".", row: 6, col: 2 },
            {
              id: "equals",
              label: "=",
              value: "=",
              row: 6,
              col: 3,
              variant: "default" as const,
              color: "bg-primary text-primary-foreground",
            },
            { id: "x", label: "x", value: "x", row: 6, col: 4 },
            { id: "y", label: "y", value: "y", row: 6, col: 5 },
            { id: "z", label: "z", value: "z", row: 6, col: 6 },
          ],
        };

      case "simple":
        return {
          rows: 5,
          cols: 4,
          buttons: [
            {
              id: "clear",
              label: "C",
              value: "Clear",
              row: 1,
              col: 1,
              colSpan: 2,
              variant: "destructive" as const,
            },
            { id: "backspace", label: "⌫", value: "⌫", row: 1, col: 3 },
            {
              id: "divide",
              label: "÷",
              value: "/",
              row: 1,
              col: 4,
              variant: "secondary" as const,
            },
            { id: "7", label: "7", value: "7", row: 2, col: 1 },
            { id: "8", label: "8", value: "8", row: 2, col: 2 },
            { id: "9", label: "9", value: "9", row: 2, col: 3 },
            {
              id: "multiply",
              label: "×",
              value: "*",
              row: 2,
              col: 4,
              variant: "secondary" as const,
            },
            { id: "4", label: "4", value: "4", row: 3, col: 1 },
            { id: "5", label: "5", value: "5", row: 3, col: 2 },
            { id: "6", label: "6", value: "6", row: 3, col: 3 },
            {
              id: "subtract",
              label: "−",
              value: "-",
              row: 3,
              col: 4,
              variant: "secondary" as const,
            },
            { id: "1", label: "1", value: "1", row: 4, col: 1 },
            { id: "2", label: "2", value: "2", row: 4, col: 2 },
            { id: "3", label: "3", value: "3", row: 4, col: 3 },
            {
              id: "add",
              label: "+",
              value: "+",
              row: 4,
              col: 4,
              rowSpan: 2,
              variant: "secondary" as const,
            },
            { id: "0", label: "0", value: "0", row: 5, col: 1, colSpan: 2 },
            { id: "decimal", label: ".", value: ".", row: 5, col: 3 },
            {
              id: "equals",
              label: "=",
              value: "=",
              row: 5,
              col: 4,
              variant: "default" as const,
              color: "bg-primary text-primary-foreground",
            },
          ],
        };

      default:
        return null;
    }
  };

  // Render top control bar
  const renderTopControls = () => {
    return (
      <div className="flex justify-between items-center mb-2 p-2 bg-muted/20 rounded">
        {/* Base controls for programmer variant */}
        {variant === "programmer" && onBaseChange && (
          <div className="flex gap-1">
            {[
              { value: 2 as BaseType, label: "BIN" },
              { value: 8 as BaseType, label: "OCT" },
              { value: 10 as BaseType, label: "DEC" },
              { value: 16 as BaseType, label: "HEX" },
            ].map(({ value, label }) => (
              <Toggle
                key={value}
                pressed={base === value}
                onPressedChange={() => onBaseChange(value)}
                size="sm"
                className="text-xs font-mono"
              >
                {label}
              </Toggle>
            ))}
          </div>
        )}

        {/* Spacer for non-programmer variants */}
        {variant !== "programmer" && <div />}

        {/* Close button */}
        {onClose && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs px-3"
          >
            Done
          </Button>
        )}
      </div>
    );
  };

  // Render grid keyboard
  const renderGridKeyboard = () => {
    // Use provided config or built-in config
    const config = gridConfig || getBuiltinGridConfig(variant);
    if (!config) return null;

    const gridLayout = createGridLayout(config);
    const gapClass = getGapClass(gap);
    const buttonHeightClass = getButtonHeightClass(buttonHeight);

    return (
      <div
        className={cn("grid w-full", gapClass)}
        style={{
          gridTemplateRows: `repeat(${config.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        }}
      >
        {gridLayout.map((row, rowIndex) =>
          row.map((button, colIndex) => {
            // If no button at current position, render empty placeholder
            if (!button) {
              return (
                <div key={`empty-${rowIndex}-${colIndex}`} className="w-full" />
              );
            }

            // Only render button component at its starting position
            if (!isButtonStart(button, rowIndex, colIndex)) {
              return (
                <div key={`span-${rowIndex}-${colIndex}`} className="w-full" />
              );
            }

            const rowSpan = button.rowSpan || 1;
            const colSpan = button.colSpan || 1;

            // Check if key is available in current base
            const isAvailable =
              variant === "programmer"
                ? isKeyAvailable(button.value, base)
                : true;

            return (
              <Button
                key={`${button.id}-${rowIndex}-${colIndex}`}
                variant={button.variant || "outline"}
                disabled={button.disabled || !isAvailable}
                className={cn(
                  "font-mono text-sm font-medium flex-shrink-0",
                  "transition-all duration-150 active:scale-95",
                  !isAvailable && "opacity-30 cursor-not-allowed",
                  buttonHeightClass,
                  button.className,
                  // If custom color and not CSS color value, treat as class name
                  button.color &&
                    !button.color.startsWith("#") &&
                    !button.color.startsWith("rgb") &&
                    !button.color.startsWith("hsl")
                    ? button.color
                    : ""
                )}
                style={{
                  gridRowStart: rowIndex + 1,
                  gridRowEnd: rowIndex + 1 + rowSpan,
                  gridColumnStart: colIndex + 1,
                  gridColumnEnd: colIndex + 1 + colSpan,
                  ...getButtonCustomStyles(button),
                }}
                onClick={() =>
                  isAvailable && handleKeyPress(button.value, button)
                }
              >
                {button.label}
              </Button>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col", styles.container, className)}>
      {renderTopControls()}

      {variant === "programmer" || variant === "simple" || variant === "grid"
        ? renderGridKeyboard()
        : layout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={cn("flex justify-center", styles.row)}
            >
              {row.map((key, keyIndex) => {
                const isAvailable = true; // Custom layout keys are always available

                return (
                  <Button
                    key={`${rowIndex}-${keyIndex}`}
                    variant="outline"
                    disabled={!isAvailable}
                    className={cn(
                      "font-mono flex-shrink-0 border-muted-foreground/20 hover:border-muted-foreground/40",
                      "transition-colors duration-150 active:scale-95",
                      !isAvailable && "opacity-30 cursor-not-allowed",
                      styles.button
                    )}
                    onClick={() => isAvailable && handleKeyPress(key)}
                  >
                    {key}
                  </Button>
                );
              })}
            </div>
          ))}
    </div>
  );
}

// Preset grid configurations
export const sampleGridConfigs = {
  // Simple calculator layout
  simpleCalculator: {
    rows: 5,
    cols: 4,
    buttons: [
      {
        id: "clear",
        label: "C",
        value: "clear",
        row: 1,
        col: 1,
        colSpan: 2,
        variant: "destructive" as const,
      },
      { id: "backspace", label: "⌫", value: "backspace", row: 1, col: 3 },
      {
        id: "divide",
        label: "÷",
        value: "/",
        row: 1,
        col: 4,
        variant: "secondary" as const,
      },
      { id: "7", label: "7", value: "7", row: 2, col: 1 },
      { id: "8", label: "8", value: "8", row: 2, col: 2 },
      { id: "9", label: "9", value: "9", row: 2, col: 3 },
      {
        id: "multiply",
        label: "×",
        value: "*",
        row: 2,
        col: 4,
        variant: "secondary" as const,
      },
      { id: "4", label: "4", value: "4", row: 3, col: 1 },
      { id: "5", label: "5", value: "5", row: 3, col: 2 },
      { id: "6", label: "6", value: "6", row: 3, col: 3 },
      {
        id: "subtract",
        label: "−",
        value: "-",
        row: 3,
        col: 4,
        variant: "secondary" as const,
      },
      { id: "1", label: "1", value: "1", row: 4, col: 1 },
      { id: "2", label: "2", value: "2", row: 4, col: 2 },
      { id: "3", label: "3", value: "3", row: 4, col: 3 },
      {
        id: "add",
        label: "+",
        value: "+",
        row: 4,
        col: 4,
        rowSpan: 2,
        variant: "secondary" as const,
      },
      { id: "0", label: "0", value: "0", row: 5, col: 1, colSpan: 2 },
      { id: "decimal", label: ".", value: ".", row: 5, col: 3 },
    ],
  } as GridConfig,

  // Programmer keyboard layout
  programmerKeyboard: {
    rows: 6,
    cols: 6,
    buttons: [
      { id: "lpar", label: "(", value: "(", row: 1, col: 1 },
      { id: "rpar", label: ")", value: ")", row: 1, col: 2 },
      { id: "lshift", label: "<<", value: "<<", row: 1, col: 3 },
      { id: "rshift", label: ">>", value: ">>", row: 1, col: 4 },
      { id: "not", label: "~", value: "~", row: 1, col: 5 },
      {
        id: "backspace",
        label: "",
        value: "backspace",
        row: 1,
        col: 6,
        variant: "destructive" as const,
      },
      { id: "A", label: "A", value: "A", row: 2, col: 1, color: "bg-accent" },
      { id: "B", label: "B", value: "B", row: 2, col: 2, color: "bg-accent" },
      { id: "C", label: "C", value: "C", row: 2, col: 3, color: "bg-accent" },
      { id: "D", label: "D", value: "D", row: 2, col: 4, color: "bg-accent" },
      { id: "E", label: "E", value: "E", row: 2, col: 5, color: "bg-accent" },
      { id: "F", label: "F", value: "F", row: 2, col: 6, color: "bg-accent" },
      { id: "7", label: "7", value: "7", row: 3, col: 1 },
      { id: "8", label: "8", value: "8", row: 3, col: 2 },
      { id: "9", label: "9", value: "9", row: 3, col: 3 },
      {
        id: "and",
        label: "&",
        value: "&",
        row: 3,
        col: 4,
        variant: "secondary" as const,
      },
      {
        id: "or",
        label: "|",
        value: "|",
        row: 3,
        col: 5,
        variant: "secondary" as const,
      },
      {
        id: "xor",
        label: "^",
        value: "^",
        row: 3,
        col: 6,
        variant: "secondary" as const,
      },
      { id: "4", label: "4", value: "4", row: 4, col: 1 },
      { id: "5", label: "5", value: "5", row: 4, col: 2 },
      { id: "6", label: "6", value: "6", row: 4, col: 3 },
      {
        id: "add",
        label: "+",
        value: "+",
        row: 4,
        col: 4,
        variant: "secondary" as const,
      },
      {
        id: "subtract",
        label: "-",
        value: "-",
        row: 4,
        col: 5,
        variant: "secondary" as const,
      },
      {
        id: "multiply",
        label: "*",
        value: "*",
        row: 4,
        col: 6,
        variant: "secondary" as const,
      },
      { id: "1", label: "1", value: "1", row: 5, col: 1 },
      { id: "2", label: "2", value: "2", row: 5, col: 2 },
      { id: "3", label: "3", value: "3", row: 5, col: 3 },
      {
        id: "divide",
        label: "/",
        value: "/",
        row: 5,
        col: 4,
        variant: "secondary" as const,
      },
      {
        id: "modulo",
        label: "%",
        value: "%",
        row: 5,
        col: 5,
        variant: "secondary" as const,
      },
      {
        id: "clear",
        label: "Clear",
        value: "clear",
        row: 5,
        col: 6,
        variant: "destructive" as const,
      },
      { id: "0", label: "0", value: "0", row: 6, col: 1 },
      { id: "decimal", label: ".", value: ".", row: 6, col: 2 },
      {
        id: "equals",
        label: "=",
        value: "=",
        row: 6,
        col: 3,
        variant: "default" as const,
        color: "bg-primary text-primary-foreground",
      },
      { id: "x", label: "x", value: "x", row: 6, col: 4 },
      { id: "y", label: "y", value: "y", row: 6, col: 5 },
      { id: "z", label: "z", value: "z", row: 6, col: 6 },
    ],
  } as GridConfig,
};
