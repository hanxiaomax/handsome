# ToolLayout Button System Documentation

## 概述

ToolLayout 组件提供了一个一致的按钮系统，确保所有工具都有统一的右侧按钮布局。系统支持标准按钮和自定义按钮的注册。

## 标准按钮布局

所有工具都会显示以下标准按钮（从左到右）：

1. **自定义按钮区域** - 工具特定的功能按钮
2. **Documentation (Info)** - 显示文档
3. **Settings** - 切换右侧面板
4. **Home** - 返回主页
5. **Bookmark** - 收藏/取消收藏
6. **Minimize** - 最小化到抽屉

## 自定义按钮系统

### CustomToolButton 接口

```typescript
interface CustomToolButton {
  id: string;                    // 唯一标识符
  icon: React.ComponentType<{ className?: string }>; // Lucide图标组件
  title: string;                 // 悬停提示文本
  onClick: () => void;           // 点击处理函数
  isActive?: boolean;            // 是否处于激活状态
  disabled?: boolean;            // 是否禁用
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary"; // 按钮样式
}
```

### 使用示例

```typescript
import { ToolLayout, type CustomToolButton } from "@/components/layout/tool-layout";
import { Calculator, Download, Share } from "lucide-react";

export default function MyTool() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const customButtons: CustomToolButton[] = [
    {
      id: "calculator-toggle",
      icon: Calculator,
      title: isCalculatorOpen ? "Close Calculator" : "Open Calculator",
      onClick: () => setIsCalculatorOpen(!isCalculatorOpen),
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
      onClick: handleShare,
      variant: "outline",
    },
  ];

  return (
    <ToolLayout
      toolName="My Tool"
      toolDescription="Tool description"
      customButtons={customButtons}
    >
      {/* Tool content */}
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

## 程序员计算器示例

```typescript
// 程序员计算器中的自定义按钮实现
const customButtons: CustomToolButton[] = [
  {
    id: "calculator-toggle",
    icon: Calculator,
    title: isCalculatorPanelOpen ? "Close Calculator" : "Open Calculator",
    onClick: handleToggleCalculator,
    isActive: isCalculatorPanelOpen,
  },
];

// 右侧面板内容根据按钮状态条件渲染
const rightPanelContent = isCalculatorPanelOpen ? (
  <div className="h-full">
    <ProgrammerCal {...calculatorProps} />
  </div>
) : undefined;
```

## 注意事项

1. **按钮顺序**: 自定义按钮显示在标准按钮之前
2. **ID 唯一性**: 确保每个自定义按钮的 `id` 在工具内唯一
3. **图标大小**: 图标会自动设置为 `h-4 w-4` 尺寸
4. **响应式**: 按钮在小屏幕上可能会被隐藏，考虑提供替代访问方式
5. **可访问性**: 始终提供有意义的 `title` 属性

## 迁移指南

### 从旧系统迁移
如果你的工具之前使用了自定义的按钮实现：

1. 将自定义按钮逻辑移到 `customButtons` 数组中
2. 使用标准的 `CustomToolButton` 接口
3. 移除工具内部的按钮渲染代码
4. 确保按钮状态正确同步

### 兼容性
- 新系统完全向后兼容
- 不使用自定义按钮的工具无需修改
- 现有的 `customControls` 属性仍然有效（用于左侧区域）

---

**更新时间**: 2024-06-20  
**版本**: 1.0.0 