# ToolLayout Button System Documentation

## 概述

ToolLayout 组件提供了一个统一的按钮系统架构，确保所有工具都有一致的用户界面和交互体验。系统分为两个层次：**标准系统按钮**（通用逻辑）和**自定义工具按钮**（工具特定逻辑）。

## 系统架构

### 架构设计原则

1. **统一性**: 所有工具共享相同的标准按钮和交互逻辑
2. **可扩展性**: 工具可以注册自定义按钮而不影响标准功能
3. **封装性**: 通用逻辑在 ToolLayout 中处理，工具只需关注特定功能
4. **一致性**: 确保所有工具的用户体验保持一致

### 按钮分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    ToolLayout 按钮系统                        │
├─────────────────────────────────────────────────────────────┤
│  自定义按钮区域        │         标准系统按钮区域               │
│  (工具特定逻辑)        │         (通用逻辑封装)                │
├─────────────────────────────────────────────────────────────┤
│  [Custom1][Custom2]   │  [Info][Settings][Home][Save][Min]   │
│                      │                                     │
│  • 工具内部实现逻辑     │  • ToolLayout 统一处理               │
│  • 注册按钮配置到这里   │  • 所有工具共享相同逻辑               │
│  • 状态管理在工具内     │  • 自动处理导航、存储等               │
└─────────────────────────────────────────────────────────────┘
```

## 标准系统按钮

所有工具都会自动显示以下标准按钮（从左到右）：

1. **Documentation (Info)** - 显示文档
2. **Settings** - 切换右侧面板
3. **Home** - 返回工具页面
4. **Bookmark** - 收藏/取消收藏
5. **Minimize** - 最小化到抽屉

### 通用逻辑封装

这些标准按钮的逻辑完全在 ToolLayout 中封装处理：

| 按钮 | 封装逻辑 | 工具需要提供 |
|------|----------|-------------|
| **Info** | 文档展示逻辑 | `onShowDocumentation` 回调 |
| **Settings** | 右侧面板切换 | `rightPanelContent` 内容 |
| **Home** | 导航到 `/tools` | 无需提供（自动处理） |
| **Bookmark** | 收藏状态管理 | `onToggleFavorite` + `isFavorite` |
| **Minimize** | 最小化到抽屉 | `onMinimize` 回调 |

## 自定义工具按钮系统

### 设计理念

自定义按钮系统遵循"**配置在框架，逻辑在工具**"的设计理念：

- **按钮配置**: 在 ToolLayout 中注册（图标、样式、状态）
- **业务逻辑**: 在工具内部实现（点击处理、状态管理）
- **视觉一致**: 所有按钮共享相同的UI规范和交互模式

### CustomToolButton 接口

```typescript
interface CustomToolButton {
  id: string;                    // 唯一标识符
  icon: React.ComponentType<{ className?: string }>; // Lucide图标组件
  title: string;                 // 悬停提示文本
  onClick: () => void;           // 点击处理函数（工具内部逻辑）
  isActive?: boolean;            // 是否处于激活状态
  disabled?: boolean;            // 是否禁用
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary"; // 按钮样式
}
```

### 自定义按钮的逻辑分离

```typescript
// 在工具组件中
export default function MyTool() {
  // 1. 工具内部状态管理
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 2. 工具内部业务逻辑
  const handleToggleCalculator = () => {
    setIsCalculatorOpen(!isCalculatorOpen);
    // 其他计算器相关逻辑...
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 导出逻辑...
    } finally {
      setIsExporting(false);
    }
  };

  // 3. 按钮配置注册到 ToolLayout
  const customButtons: CustomToolButton[] = [
    {
      id: "calculator-toggle",
      icon: Calculator,
      title: isCalculatorOpen ? "Close Calculator" : "Open Calculator",
      onClick: handleToggleCalculator,  // 工具内部逻辑
      isActive: isCalculatorOpen,       // 工具内部状态
    },
    {
      id: "export-data",
      icon: Download,
      title: "Export Data",
      onClick: handleExport,            // 工具内部逻辑
      disabled: isExporting,            // 工具内部状态
    },
  ];

  return (
    <ToolLayout customButtons={customButtons}>
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

## 如何使用系统

### 最小化按钮行为说明

**重要：最小化按钮的默认行为是不保存状态**

- ✅ **默认行为**: 工具最小化时不保存任何状态，恢复时为初始状态
- ⚠️ **状态保存**: 只有当工具明确需要保存状态时，才需要额外实现状态管理
- 🎯 **设计原则**: 遵循"简单优先"原则，避免不必要的状态管理复杂度

#### 什么时候需要保存状态？

**✅ 需要保存状态的场景：**
- 用户输入了大量文本内容
- 进行了复杂的计算或配置
- 有重要的工作进度或结果
- 表单填写到一半

**❌ 不需要保存状态的场景：**
- 简单的转换工具（如编码转换）
- 计算器类工具（每次重新开始）
- 纯展示类工具
- 无用户输入的工具

#### 实现原则

1. **默认不保存**: 优先使用不保存状态的实现
2. **按需保存**: 只在真正需要时才添加状态管理
3. **最小状态**: 只保存必要的状态，避免保存衍生状态
4. **类型安全**: 使用 TypeScript 确保状态恢复的类型安全

### 1. 标准用法（推荐）

使用 `useToolControls` hook，默认不保存状态：

```typescript
import { useToolControls } from "@/hooks/use-tool-controls";
import { ToolLayout } from "@/components/layout/tool-layout";
import { toolInfo } from "./toolInfo";

export default function SimpleTool() {
  // 使用标准化工具控制（默认不保存状态）
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    // 不传递 state 参数 = 不保存状态
  });

  return (
    <ToolLayout {...toolLayoutProps}>
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

### 2. 使用传统方式（手动实现）

如果需要手动实现控制逻辑：

```typescript
import { ToolLayout } from "@/components/layout/tool-layout";
import { useMinimizedToolsActions } from "@/stores/minimized-tools-store";
import { useFavoriteActions, useIsFavorite } from "@/stores/favorites-store";
import { useNavigate } from "react-router-dom";
import { toolInfo } from "./toolInfo";

export default function ManualTool() {
  const navigate = useNavigate();
  const { minimizeTool } = useMinimizedToolsActions();
  const { toggleFavorite } = useFavoriteActions();
  const isFavorite = useIsFavorite(toolInfo.id);

  // 最小化逻辑（不保存状态）
  const handleMinimize = () => {
    minimizeTool(toolInfo); // 不传递 state 参数
    navigate("/tools");
  };

  // 收藏逻辑
  const handleToggleFavorite = () => {
    toggleFavorite(toolInfo.id);
  };

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onMinimize={handleMinimize}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isFavorite}
    >
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

### 3. 需要保存状态的工具实现

**只有当工具确实需要保存用户输入或计算结果时才使用此方法：**

```typescript
import { useState, useEffect } from "react";
import { useToolControls } from "@/hooks/use-tool-controls";
import { ToolLayout } from "@/components/layout/tool-layout";
import { useIsToolMinimized, useToolState, useMinimizedToolsActions } from "@/stores/minimized-tools-store";
import { toolInfo } from "./toolInfo";

export default function StatefulTool() {
  // 工具状态
  const [inputValue, setInputValue] = useState("");
  const [calculation, setCalculation] = useState(0);
  
  // 将需要保存的状态组合
  const toolState = {
    inputValue,
    calculation,
  };

  // 使用工具控制（保存状态）
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    state: toolState,  // 传递状态以保存
  });

  // 状态恢复逻辑
  const isMinimized = useIsToolMinimized(toolInfo.id);
  const savedState = useToolState(toolInfo.id);
  const { restoreTool } = useMinimizedToolsActions();

  useEffect(() => {
    if (isMinimized && savedState) {
      // 恢复保存的状态
      const typedState = savedState as typeof toolState;
      setInputValue(typedState.inputValue || "");
      setCalculation(typedState.calculation || 0);
      restoreTool(toolInfo.id);
    }
  }, [isMinimized, savedState, restoreTool]);

  return (
    <ToolLayout {...toolLayoutProps}>
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

### 4. 注册自定义按钮

对于需要特殊功能的工具：

```typescript
import { ToolLayout, type CustomToolButton } from "@/components/layout/tool-layout";
import { Calculator, Download, Share } from "lucide-react";

export default function AdvancedTool() {
  // 工具内部状态
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 工具内部逻辑
  const handleToggleCalculator = () => {
    setIsCalculatorOpen(!isCalculatorOpen);
  };

  const handleExport = async () => {
    setIsExporting(true);
    // 导出逻辑
    setIsExporting(false);
  };

  // 注册自定义按钮
  const customButtons: CustomToolButton[] = [
    {
      id: "calculator-toggle",
      icon: Calculator,
      title: isCalculatorOpen ? "Close Calculator" : "Open Calculator",
      onClick: handleToggleCalculator,
      isActive: isCalculatorOpen,
    },
    {
      id: "export-data",
      icon: Download,
      title: "Export Data",
      onClick: handleExport,
      disabled: isExporting,
    },
    {
      id: "share-tool",
      icon: Share,
      title: "Share Tool",
      onClick: () => navigator.share({...}),
      variant: "outline",
    },
  ];

  return (
    <ToolLayout
      toolName="Advanced Tool"
      toolDescription="Tool with custom features"
      customButtons={customButtons}
      onMinimize={handleMinimize}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isFavorite}
    >
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

### 3. 确保所有工具具有相同逻辑

#### 标准化实现模板

**推荐：使用 `useToolControls` Hook（默认不保存状态）**

```typescript
import { useToolControls } from "@/hooks/use-tool-controls";
import { ToolLayout } from "@/components/layout/tool-layout";
import { toolInfo } from "./toolInfo";

export default function StandardTool() {
  // 使用标准化的工具控制（默认不保存状态）
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    // 不传递 state 参数 = 不保存状态
  });

  return (
    <ToolLayout {...toolLayoutProps}>
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

**高级：需要保存状态时的实现**

```typescript
import { useState, useEffect, useCallback } from "react";
import { useToolControls } from "@/hooks/use-tool-controls";
import { ToolLayout } from "@/components/layout/tool-layout";
import { useIsToolMinimized, useToolState, useMinimizedToolsActions } from "@/stores/minimized-tools-store";
import { toolInfo } from "./toolInfo";

export default function StatefulTool() {
  const [toolState, setToolState] = useState({
    inputValue: "",
    selectedOption: "default",
    // 其他需要保存的状态...
  });

  // 使用标准化的工具控制（保存状态）
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    state: toolState,  // 传递状态以保存
  });

  // 状态恢复逻辑（仅在需要保存状态时使用）
  const isMinimized = useIsToolMinimized(toolInfo.id);
  const savedState = useToolState(toolInfo.id);
  const { restoreTool } = useMinimizedToolsActions();

  useEffect(() => {
    if (isMinimized && savedState) {
      // 恢复保存的状态
      setToolState(savedState as typeof toolState);
      restoreTool(toolInfo.id);
    }
  }, [isMinimized, savedState, restoreTool]);

  return (
    <ToolLayout {...toolLayoutProps}>
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

**传统实现（不推荐，仅用于理解）**

```typescript
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToolLayout } from "@/components/layout/tool-layout";
import { useMinimizedToolsActions, useIsToolMinimized, useToolState } from "@/stores/minimized-tools-store";
import { useFavoriteActions, useIsFavorite } from "@/stores/favorites-store";
import { toolInfo } from "./toolInfo";

export default function ManualImplementationTool() {
  const navigate = useNavigate();
  
  // 手动实现的存储hooks
  const { minimizeTool, restoreTool } = useMinimizedToolsActions();
  const { toggleFavorite } = useFavoriteActions();
  const isFavorite = useIsFavorite(toolInfo.id);
  const isMinimized = useIsToolMinimized(toolInfo.id);
  const savedState = useToolState(toolInfo.id);

  // 手动实现的最小化（不保存状态）
  const handleMinimize = useCallback(() => {
    minimizeTool(toolInfo); // 不传递状态参数
    navigate("/tools");
  }, [minimizeTool, navigate]);

  // 手动实现的收藏
  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(toolInfo.id);
  }, [toggleFavorite]);

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onMinimize={handleMinimize}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isFavorite}
    >
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

## 通用逻辑封装分析

### 当前封装状态

| 功能 | 封装程度 | 当前实现 | 改进建议 |
|------|----------|----------|----------|
| **导航 (Home)** | ✅ 完全封装 | ToolLayout 内部处理 | 无需改进 |
| **最小化** | ⚠️ 部分封装 | 需要工具提供回调 | 可进一步封装 |
| **收藏** | ⚠️ 部分封装 | 需要工具提供回调 | 可进一步封装 |
| **文档** | ❌ 未封装 | 完全依赖工具实现 | 可建立注册机制 |
| **设置面板** | ✅ 完全封装 | ToolLayout 内部处理 | 无需改进 |

### 进一步封装的可能性

#### 1. 最小化逻辑封装

**当前实现**:
```typescript
// 工具中需要实现
const handleMinimize = () => {
  const toolState = { /* 收集状态 */ };
  minimizeTool(toolInfo, toolState);
  navigate("/tools");
};
```

**封装后的理想实现**:
```typescript
// ToolLayout 内部自动处理
<ToolLayout
  toolName={toolInfo.name}
  toolInfo={toolInfo}           // 提供工具信息
  getToolState={() => ({ /* 状态 */ })}  // 提供状态收集函数
  onRestoreState={(state) => { /* 恢复状态 */ }}  // 提供状态恢复函数
/>
```

#### 2. 收藏逻辑封装

**当前实现**:
```typescript
// 工具中需要实现
const { toggleFavorite } = useFavoriteActions();
const isFavorite = useIsFavorite(toolInfo.id);
const handleToggleFavorite = () => toggleFavorite(toolInfo.id);
```

**封装后的理想实现**:
```typescript
// ToolLayout 内部自动处理
<ToolLayout
  toolName={toolInfo.name}
  toolInfo={toolInfo}  // 自动处理收藏逻辑
/>
```

#### 3. 文档链接注册机制

**当前实现**:
```typescript
// 工具需要提供文档处理
const handleShowDocumentation = () => {
  // 自定义文档展示逻辑
};
```

**封装后的理想实现**:
```typescript
// 注册式文档系统
<ToolLayout
  toolName={toolInfo.name}
  documentationConfig={{
    type: "markdown",
    path: "/tools/my-tool/docs/user-guide.md",
    sections: ["overview", "usage", "examples"]
  }}
/>
```

### 建议的架构改进

#### Control Area 重构方案

```typescript
// 新的 ToolLayout 接口设计
interface ToolLayoutProps {
  // 基本信息
  toolInfo: ToolInfo;  // 包含所有工具元数据
  
  // 状态管理（自动封装）
  getToolState?: () => Record<string, unknown>;
  onRestoreState?: (state: Record<string, unknown>) => void;
  
  // 文档配置（注册机制）
  documentationConfig?: {
    type: "markdown" | "component" | "url";
    source: string | React.ComponentType;
    sections?: string[];
  };
  
  // 自定义按钮（工具特定）
  customButtons?: CustomToolButton[];
  
  // 右侧面板
  rightPanelContent?: React.ReactNode;
  
  // 其他
  children: React.ReactNode;
}
```

#### 实现后的工具代码简化

```typescript
// 简化后的工具实现
export default function MyTool() {
  const [toolState, setToolState] = useState({});

  const customButtons: CustomToolButton[] = [
    {
      id: "special-function",
      icon: Zap,
      title: "Special Function",
      onClick: handleSpecialFunction,
    },
  ];

  return (
    <ToolLayout
      toolInfo={toolInfo}  // 自动处理最小化、收藏
      getToolState={() => toolState}  // 自动处理状态收集
      onRestoreState={setToolState}    // 自动处理状态恢复
      documentationConfig={{           // 自动处理文档
        type: "markdown",
        source: "/docs/my-tool.md"
      }}
      customButtons={customButtons}    // 工具特定按钮
    >
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

## 按钮状态管理

### 激活状态
使用 `isActive` 属性来显示按钮的激活状态：
- `true`: 按钮显示为激活状态（背景高亮）
- `false` 或 `undefined`: 正常状态

### 禁用状态
使用 `disabled` 属性来禁用按钮：
- `true`: 按钮变灰且不可点击
- `false` 或 `undefined`: 正常可点击

### 样式变体
使用 `variant` 属性来设置按钮样式：
- `"ghost"` (默认): 透明背景，悬停时显示背景
- `"default"`: 主色调背景
- `"outline"`: 边框样式
- `"secondary"`: 次要色调背景
- `"destructive"`: 危险操作样式

## 右侧面板集成

Settings 按钮现在始终显示，但其行为取决于是否有面板内容：

```typescript
<ToolLayout
  toolName="My Tool"
  rightPanelContent={panelContent}  // 有内容时Settings按钮可用
  rightPanelTitle="Settings"
  rightPanelDescription="Tool settings and options"
>
  {/* Tool content */}
</ToolLayout>
```

### 面板状态
- **有内容**: Settings 按钮可用，可以打开/关闭面板
- **无内容**: Settings 按钮禁用，显示"No panel content available"

## 最佳实践

### 按钮数量
- 建议自定义按钮不超过 3-4 个，避免工具栏过于拥挤
- 对于复杂工具，考虑将部分功能移到右侧面板中

### 图标选择
- 使用 Lucide React 图标库中的图标
- 选择语义明确的图标
- 保持图标风格一致

### 交互反馈
- 使用 `isActive` 提供视觉反馈
- 使用 `disabled` 防止无效操作
- 提供清晰的 `title` 说明

### 状态同步
- 确保按钮状态与实际功能状态同步
- 使用 React 状态管理来控制按钮行为

## 实际案例：程序员计算器

### 当前实现

```typescript
// 程序员计算器的完整实现示例
export default function ProgrammerCalculator() {
  const navigate = useNavigate();
  
  // 工具状态
  const [currentExpression, setCurrentExpression] = useState("");
  const [isCalculatorPanelOpen, setIsCalculatorPanelOpen] = useState(false);
  
  // 标准化存储hooks
  const { minimizeTool, restoreTool } = useMinimizedToolsActions();
  const { toggleFavorite } = useFavoriteActions();
  const isFavorite = useIsFavorite(toolInfo.id);
  
  // 自定义按钮逻辑
  const handleToggleCalculator = () => {
    setIsCalculatorPanelOpen(!isCalculatorPanelOpen);
  };
  
  // 标准按钮逻辑
  const handleMinimize = useCallback(() => {
    const toolState = { currentExpression, isCalculatorPanelOpen };
    minimizeTool(toolInfo, toolState);
    navigate("/tools");
  }, [currentExpression, isCalculatorPanelOpen, minimizeTool, navigate]);
  
  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(toolInfo.id);
  }, [toggleFavorite]);
  
  // 注册自定义按钮
  const customButtons: CustomToolButton[] = [
    {
      id: "calculator-toggle",
      icon: Calculator,
      title: isCalculatorPanelOpen ? "Close Calculator" : "Open Calculator",
      onClick: handleToggleCalculator,
      isActive: isCalculatorPanelOpen,
    },
  ];

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      customButtons={customButtons}
      onMinimize={handleMinimize}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isFavorite}
    >
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

## 最佳实践和注意事项

### 按钮设计原则

1. **按钮顺序**: 自定义按钮显示在标准按钮之前
2. **ID 唯一性**: 确保每个自定义按钮的 `id` 在工具内唯一
3. **图标选择**: 使用语义明确的 Lucide 图标
4. **状态同步**: 确保按钮状态与功能状态保持同步
5. **可访问性**: 始终提供有意义的 `title` 属性

### 开发建议

1. **逻辑分离**: 业务逻辑在工具内部，UI配置在 ToolLayout
2. **状态管理**: 使用标准化的状态管理模式
3. **错误处理**: 为按钮操作添加适当的错误处理
4. **性能优化**: 使用 `useCallback` 优化回调函数
5. **测试覆盖**: 为按钮功能编写单元测试

### 响应式考虑

- 按钮在小屏幕上可能会被隐藏
- 考虑为重要功能提供替代访问方式
- 确保按钮标签在不同屏幕尺寸下都清晰可读

## 迁移指南

### 从旧系统迁移

如果你的工具之前使用了自定义的按钮实现：

1. **分析现有按钮**: 确定哪些是工具特定的，哪些是通用的
2. **重构自定义按钮**: 将工具特定的按钮移到 `customButtons` 数组中
3. **标准化通用按钮**: 使用 ToolLayout 提供的标准按钮系统
4. **更新状态管理**: 采用标准化的状态管理模式
5. **测试验证**: 确保所有功能正常工作

### 兼容性保证

- 新系统完全向后兼容
- 不使用自定义按钮的工具无需修改
- 现有的 `customControls` 属性仍然有效（用于左侧区域）
- 渐进式迁移：可以逐步迁移工具而不影响其他工具

## 未来发展方向

### 短期改进

1. **文档注册系统**: 建立统一的文档展示机制
2. **状态管理封装**: 进一步简化最小化和收藏逻辑
3. **按钮组件库**: 提供常用的按钮模板和配置

### 长期规划

1. **智能按钮系统**: 基于工具类型自动推荐相关按钮
2. **用户自定义**: 允许用户自定义按钮布局和显示
3. **插件系统**: 支持第三方按钮插件的注册和管理

---

**文档版本**: 2.0.0  
**最后更新**: 2024-06-21  
**维护者**: ToolLayout 开发团队 