import { useCallback } from "react";
import { ProgrammerCal } from "@/tools/programmer-calculator/components/programmer-cal";
import { useCalculatorSnapshot, useCalculatorActions } from "../lib/store";
import type { Base, BitWidth, Operation } from "../types";

interface ProgrammerCalWithStoreProps {
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  showToaster?: boolean;
  compact?: boolean;
  borderless?: boolean;
}

export function ProgrammerCalWithStore({
  className = "",
  maxWidth = "full",
  showToaster = true,
  compact = false,
  borderless = false,
}: ProgrammerCalWithStoreProps) {
  // 订阅 store 状态
  const snapshot = useCalculatorSnapshot();
  const actions = useCalculatorActions();

  // 处理值变化
  const handleValueChange = useCallback(
    (value: string, base: Base) => {
      actions.setValue(value, "calculator");
      if (base !== snapshot.base) {
        actions.setBase(base, "calculator");
      }
    },
    [actions, snapshot.base]
  );

  // 处理进制变化
  const handleBaseChange = useCallback(
    (base: Base) => {
      actions.setBase(base, "calculator");
    },
    [actions]
  );

  // 处理位宽变化
  const handleBitWidthChange = useCallback(
    (bitWidth: BitWidth) => {
      actions.setBitWidth(bitWidth, "calculator");
    },
    [actions]
  );

  // 处理按钮点击（这是受控模式需要的关键处理器）
  const handleButtonClick = useCallback(
    (value: string, type: "number" | "operation" | "function" | "special") => {
      // 简化的按钮处理逻辑，这里可以根据需要扩展
      if (type === "number") {
        const newValue =
          snapshot.currentValue === "0" ? value : snapshot.currentValue + value;
        actions.setValue(newValue, "calculator");
      } else if (type === "operation") {
        if (value === "=") {
          // 简单的等号处理
          console.log("Equals pressed - implement calculation logic here");
        } else {
          // 其他操作符
          actions.setOperation(value as Operation, "calculator");
          actions.setPreviousValue(snapshot.currentValue, "calculator");
          actions.setValue("0", "calculator");
        }
      } else if (type === "function") {
        // 处理清除等功能
        if (value === "C" || value === "AC") {
          actions.setValue("0", "calculator");
          actions.setPreviousValue("", "calculator");
          actions.setOperation(null, "calculator");
        }
      }
    },
    [actions, snapshot.currentValue]
  );

  // 处理状态变化（复合操作）
  const handleStateChange = useCallback(
    (state: {
      currentValue: string;
      previousValue: string;
      operation: Operation | null;
      base: Base;
      bitWidth: BitWidth;
    }) => {
      // 使用批量更新避免多次渲染
      actions.batchUpdate(
        {
          currentValue: state.currentValue,
          previousValue: state.previousValue,
          operation: state.operation,
          base: state.base,
          bitWidth: state.bitWidth,
        },
        "calculator"
      );
    },
    [actions]
  );

  // 检查是否有必要的数据
  if (!snapshot || !actions) {
    return <div className="p-4 text-red-500">Store not initialized</div>;
  }

  return (
    <ProgrammerCal
      className={className}
      maxWidth={maxWidth}
      showToaster={showToaster}
      compact={compact}
      borderless={borderless}
      // 受控模式，使用 store 状态
      controlled={true}
      value={snapshot.currentValue}
      base={snapshot.base}
      bitWidth={snapshot.bitWidth}
      previousValue={snapshot.previousValue}
      operation={snapshot.operation}
      // 事件处理
      onValueChange={handleValueChange}
      onBaseChange={handleBaseChange}
      onBitWidthChange={handleBitWidthChange}
      onButtonClick={handleButtonClick}
      onStateChange={handleStateChange}
    />
  );
}
