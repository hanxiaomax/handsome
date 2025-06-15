"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { ProgrammerCal } from "./components/programmer-cal";
import { AdvancedBitwiseVisualization } from "./components/AdvancedBitwiseVisualization";
import { toolInfo } from "./toolInfo";

export default function ProgrammerCalculator() {
  // Bitwise Boost 模式状态
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Bitwise Boost 切换处理
  const handleBitwiseBoostToggle = (checked: boolean) => {
    setIsAdvancedMode(checked);
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
    // 高级模式：双面板布局，使用 Zustand store 管理状态
    return (
      <ToolWrapper
        toolInfo={toolInfo}
        maxWidth="full"
        customControls={bitwiseBoostControl}
      >
        <div className="mt-5 flex gap-4">
          {/* 左面板：计算器（强制使用 store） */}
          <div className="w-96 flex-shrink-0">
            <ProgrammerCal forceStoreState={true} />
          </div>

          {/* 右面板：高级位运算可视化（使用 store） */}
          <div className="flex-1 min-w-0">
            <AdvancedBitwiseVisualization />
          </div>
        </div>
      </ToolWrapper>
    );
  }

  return (
    <ToolWrapper
      toolInfo={toolInfo}
      maxWidth="3xl"
      customControls={bitwiseBoostControl}
    >
      {/* 基础模式：单面板布局，使用本地状态 */}
      <ProgrammerCal
        forceLocalState={true}
        maxWidth="full"
        showToaster={true}
      />
    </ToolWrapper>
  );
}
