"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { ProgrammerCal } from "@/components/common/programmer-cal";
import { AdvancedBitwiseVisualization } from "./components/AdvancedBitwiseVisualization";
import { toolInfo } from "./toolInfo";
import type { Base, BitWidth, Operation } from "./types";

export default function ProgrammerCalculator() {
  // Bitwise Boost 模式状态
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // 共享的计算器状态
  const [sharedState, setSharedState] = useState({
    currentValue: "0",
    previousValue: "",
    operation: null as Operation | null,
    base: 10 as Base,
    bitWidth: 32 as BitWidth,
  });

  // Bitwise Boost 切换处理
  const handleBitwiseBoostToggle = (checked: boolean) => {
    setIsAdvancedMode(checked);
  };

  // 处理值变化（从计算器组件）
  const handleValueChange = (value: string, base: Base) => {
    setSharedState((prev) => ({
      ...prev,
      currentValue: value,
      base: base,
    }));
  };

  // 处理进制变化
  const handleBaseChange = (base: Base) => {
    setSharedState((prev) => ({
      ...prev,
      base: base,
    }));
  };

  // 处理位宽变化
  const handleBitWidthChange = (bitWidth: BitWidth) => {
    setSharedState((prev) => ({
      ...prev,
      bitWidth: bitWidth,
    }));
  };

  // 处理完整状态变化（从计算器组件）
  const handleStateChange = (state: {
    currentValue: string;
    previousValue: string;
    operation: Operation | null;
    base: Base;
    bitWidth: BitWidth;
  }) => {
    // 只有当状态实际发生变化时才更新，避免无限循环
    setSharedState((prev) => {
      if (
        prev.currentValue === state.currentValue &&
        prev.previousValue === state.previousValue &&
        prev.operation === state.operation &&
        prev.base === state.base &&
        prev.bitWidth === state.bitWidth
      ) {
        return prev; // 状态相同，不更新
      }
      return state; // 状态不同，执行更新
    });
  };

  // 处理来自高级可视化的值变化
  const handleVisualizationValueChange = (value: string) => {
    setSharedState((prev) => ({
      ...prev,
      currentValue: value,
    }));
  };

  // Bitwise Boost 控制组件
  const bitwiseBoostControl = (
    <div className="flex items-center space-x-2">
      <Zap className="h-4 w-4 text-primary" />
      <Label htmlFor="bitwise-boost-switch" className="text-sm font-medium">
        Bitwise Boost
      </Label>
      <Switch
        id="bitwise-boost-switch"
        checked={isAdvancedMode}
        onCheckedChange={handleBitwiseBoostToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );

  if (isAdvancedMode) {
    // 高级模式：双面板布局，通过状态回调同步
    return (
      <ToolWrapper
        toolInfo={toolInfo}
        maxWidth="full"
        customControls={bitwiseBoostControl}
      >
        <div className="mt-5 flex gap-4">
          {/* 左面板：计算器（非受控，仅通过回调同步状态） */}
          <div className="w-96 flex-shrink-0">
            <ProgrammerCal
              controlled={false}
              onStateChange={handleStateChange}
            />
          </div>

          {/* 右面板：高级位运算可视化，同步状态 */}
          <div className="flex-1 min-w-0">
            <AdvancedBitwiseVisualization
              currentValue={sharedState.currentValue}
              previousValue={sharedState.previousValue}
              operation={sharedState.operation}
              base={sharedState.base}
              bitWidth={sharedState.bitWidth}
              onValueChange={handleVisualizationValueChange}
            />
          </div>
        </div>
      </ToolWrapper>
    );
  }

  // 普通模式：非受控计算器
  return (
    <ToolWrapper
      toolInfo={toolInfo}
      maxWidth="full"
      customControls={bitwiseBoostControl}
    >
      <ProgrammerCal
        controlled={false}
        initialBase={sharedState.base}
        initialBitWidth={sharedState.bitWidth}
        initialValue={sharedState.currentValue}
        maxWidth="full"
        showToaster={true}
        onValueChange={handleValueChange}
        onBaseChange={handleBaseChange}
        onBitWidthChange={handleBitWidthChange}
      />
    </ToolWrapper>
  );
}
