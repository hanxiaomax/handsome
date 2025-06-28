# 工具按钮和 Dialog 封装系统使用指南

## 概述

这个封装系统提供了多个强大的 hooks 来简化工具开发：
- `useToolButtons` - 管理工具按钮和标准化功能
- `useToolDialogs` - 管理 Dialog 状态和交互
- `useToolIntro` - 管理工具介绍 Dialog 的显示逻辑，基于 Cookie 跟踪首次访问

## 核心特性

### 🎯 useToolButtons Hook

#### 主要功能
- **预设按钮类型**：20+ 种常用按钮类型，自动图标和样式
- **标准化功能**：自动处理最小化、收藏、状态恢复等
- **动态管理**：运行时添加、删除、更新按钮
- **类型安全**：完整的 TypeScript 支持

#### 预设按钮类型
```typescript
type PresetButtonType = 
  | 'info' | 'settings' | 'refresh' | 'download' | 'share' 
  | 'copy' | 'edit' | 'delete' | 'add' | 'search' | 'filter' 
  | 'sort' | 'export' | 'import' | 'help' | 'fullscreen' 
  | 'preview' | 'save' | 'reset'
```

### 🎯 useToolDialogs Hook

#### 主要功能
- **预设 Dialog 类型**：info, settings, confirm, warning, error, success 等
- **便捷方法**：一行代码创建常用 Dialog
- **状态管理**：自动处理 Dialog 开关状态
- **批量操作**：支持多个 Dialog 同时管理

## 基本使用

### 1. 简单工具示例

```typescript
import { useToolButtons, useToolDialogs } from '@/hooks';
import { ToolLayout } from '@/components/layout/tool-layout';

export default function MyTool() {
  const [toolState, setToolState] = useState({ data: 'example' });
  
  // 初始化封装系统
  const toolButtons = useToolButtons(toolInfo, toolState);
  const dialogs = useToolDialogs();

  // 恢复工具状态
  toolButtons.restoreToolState((state) => {
    setToolState(state.toolState as typeof toolState);
  });

  // 按钮处理函数
  const handleRefresh = () => {
    // 刷新逻辑
    dialogs.showSuccess("Refreshed!", "Data has been refreshed");
  };

  const handleInfo = () => {
    dialogs.showInfo("Tool Info", "This is my awesome tool");
  };

  // 注册按钮
  useEffect(() => {
    toolButtons.addPresetButton('refresh', handleRefresh);
    toolButtons.addPresetButton('info', handleInfo);
  }, []);

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      customButtons={toolButtons.customButtons}
      onMinimize={toolButtons.handleMinimize}
      onToggleFavorite={toolButtons.handleToggleFavorite}
      isFavorite={toolButtons.isFavorite}
    >
      {/* 工具内容 */}
    </ToolLayout>
  );
}
```

### 2. 高级工具示例

```typescript
export default function AdvancedTool() {
  const toolButtons = useToolButtons(toolInfo, toolState);
  const dialogs = useToolDialogs();

  // 自定义按钮
  const handleCustomAction = () => {
    dialogs.showConfirm(
      "Confirm Action",
      "Are you sure you want to proceed?",
      () => {
        // 确认后的操作
        dialogs.showSuccess("Done!", "Action completed successfully");
      }
    );
  };

  // 批量注册按钮
  useEffect(() => {
    toolButtons.addButtons([
      { id: 'refresh', type: 'refresh', onClick: handleRefresh },
      { id: 'download', type: 'download', onClick: handleDownload },
      { id: 'custom', icon: CustomIcon, title: 'Custom', onClick: handleCustomAction },
    ]);
  }, []);

  // 动态更新按钮状态
  const toggleButton = () => {
    toolButtons.updateButton('refresh', { disabled: !isReady });
  };

  return (
    <>
      <ToolLayout {...toolLayoutProps}>
        {/* 工具内容 */}
      </ToolLayout>
      
      {/* 渲染 Dialogs */}
      {dialogs.openDialogs.map(dialog => (
        <Dialog key={dialog.id} open={dialog.isOpen} onOpenChange={() => dialogs.closeDialog(dialog.id)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialog.title}</DialogTitle>
            </DialogHeader>
            {dialog.content}
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}
```

## API 参考

### useToolButtons

#### 方法
- `addButton(config)` - 添加单个按钮
- `addButtons(configs)` - 批量添加按钮
- `addPresetButton(type, onClick, overrides?)` - 添加预设按钮
- `removeButton(id)` - 移除按钮
- `updateButton(id, updates)` - 更新按钮
- `clearButtons()` - 清空所有按钮

#### 属性
- `customButtons` - 转换后的按钮列表（传给 ToolLayout）
- `handleMinimize` - 标准最小化处理函数
- `handleToggleFavorite` - 标准收藏切换函数
- `isFavorite` - 当前收藏状态
- `restoreToolState(callback)` - 恢复工具状态

### useToolDialogs

#### 便捷方法
- `showInfo(title, content, id?)` - 显示信息 Dialog
- `showSettings(title, content, id?)` - 显示设置 Dialog
- `showConfirm(title, content, onConfirm, onCancel?, id?)` - 显示确认 Dialog
- `showError(title, content, id?)` - 显示错误 Dialog
- `showSuccess(title, content, id?)` - 显示成功 Dialog

#### 基本方法
- `openDialog(config)` - 打开 Dialog
- `closeDialog(id)` - 关闭 Dialog
- `closeAllDialogs()` - 关闭所有 Dialog
- `updateDialog(id, updates)` - 更新 Dialog
- `isDialogOpen(id)` - 检查 Dialog 是否打开

#### 属性
- `openDialogs` - 当前打开的 Dialog 列表
- `allDialogs` - 所有 Dialog 状态

## 最佳实践

### 1. 按钮管理
```typescript
// ✅ 推荐：使用预设按钮
toolButtons.addPresetButton('refresh', handleRefresh);

// ✅ 推荐：批量注册
useEffect(() => {
  toolButtons.addButtons([
    { id: 'action1', type: 'refresh', onClick: handle1 },
    { id: 'action2', type: 'download', onClick: handle2 },
  ]);
}, []);

// ❌ 避免：手动管理复杂按钮配置
```

### 2. Dialog 管理
```typescript
// ✅ 推荐：使用便捷方法
dialogs.showConfirm("Title", "Content", onConfirm);

// ✅ 推荐：复用 Dialog ID
dialogs.showInfo("Info", content, "tool-info");

// ❌ 避免：手动管理 Dialog 状态
```

### 3. 状态恢复
```typescript
// ✅ 推荐：使用封装的恢复逻辑
toolButtons.restoreToolState((state) => {
  setToolState(state.toolState);
});

// ❌ 避免：手动处理最小化逻辑
```

### 4. 类型安全
```typescript
// ✅ 推荐：定义明确的状态接口
interface ToolState extends Record<string, unknown> {
  data: string;
  count: number;
}

// ✅ 推荐：使用预设类型
toolButtons.addPresetButton('refresh', handleRefresh);
```

## 迁移指南

### 从旧系统迁移

#### 1. 替换导入
```typescript
// 旧的方式
import { useState, useCallback } from 'react';
import { useMinimizedToolsActions } from '@/stores/minimized-tools-store';

// 新的方式
import { useToolButtons, useToolDialogs } from '@/hooks';
```

#### 2. 简化按钮注册
```typescript
// 旧的方式
const customButtons: CustomToolButton[] = [
  {
    id: "refresh",
    icon: RefreshIcon,
    title: "Refresh",
    onClick: handleRefresh,
  },
  // ...
];

// 新的方式
useEffect(() => {
  toolButtons.addPresetButton('refresh', handleRefresh);
}, []);
```

#### 3. 简化 Dialog 管理
```typescript
// 旧的方式
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [dialogContent, setDialogContent] = useState(null);

// 新的方式
dialogs.showInfo("Title", content);
```

## 性能优化

1. **按钮懒加载**：预设按钮图标按需加载
2. **状态缓存**：自动缓存和恢复工具状态
3. **事件优化**：使用 useCallback 优化事件处理
4. **批量操作**：支持批量按钮操作减少重渲染

## 故障排除

### 常见问题

1. **按钮不显示**
   - 检查是否正确调用 `addButton` 或 `addPresetButton`
   - 确认 `customButtons` 正确传递给 ToolLayout

2. **Dialog 不打开**
   - 检查是否正确渲染 Dialog 组件
   - 确认 Dialog ID 没有冲突

3. **状态恢复失败**
   - 确保状态接口继承 `Record<string, unknown>`
   - 检查 `restoreToolState` 回调函数

4. **TypeScript 错误**
   - 使用正确的预设按钮类型
   - 确保状态接口类型正确

## 示例项目

查看 `layout-demo/ui-enhanced.tsx` 获取完整的使用示例。 