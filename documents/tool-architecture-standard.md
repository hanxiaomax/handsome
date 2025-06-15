# 工具架构标准 (Tool Architecture Standard)

## 架构原则

### 核心理念：关注点分离
- **UI层 (ui.tsx)**: 仅负责布局和渲染，不包含业务逻辑
- **业务逻辑 (lib/)**: 所有数据处理、状态管理、工具函数
- **组件层 (components/)**: 可复用的UI组件，专注于展示和交互
- **配置层 (toolInfo.ts)**: 工具元数据和配置

## 目录结构标准

```
tools/[tool-name]/
├── ui.tsx                    # 主UI组件 - 仅布局
├── toolInfo.ts               # 工具元数据
├── lib/                      # 业务逻辑层
│   ├── index.ts              # 统一导出
│   ├── hooks/                # 自定义Hooks
│   │   ├── use[Tool]State.ts # 状态管理Hook
│   │   └── use[Tool]Logic.ts # 业务逻辑Hook
│   ├── utils/                # 工具函数
│   │   ├── [功能]Utils.ts    # 特定功能工具函数
│   │   └── validators.ts     # 验证函数
│   ├── types.ts              # TypeScript类型定义
│   └── constants.ts          # 常量定义
├── components/               # UI组件层
│   ├── index.ts              # 统一导出
│   ├── [Component].tsx       # 具体组件
│   └── sections/             # 复杂区域组件
└── docs/                     # 文档
    ├── specification.md      # 工具规格说明
    └── api-reference.md      # API参考
```

## UI层 (ui.tsx) 标准

### 职责边界
✅ **应该包含**:
- 布局结构和样式
- 组件组装和排列
- 基础UI状态（如展开/折叠、选中状态）
- 事件处理器的绑定（不是实现）

❌ **不应该包含**:
- 业务逻辑运算
- 数据处理和转换
- 复杂的状态管理
- API调用或文件处理
- 算法实现

### 代码模板

```typescript
"use client";

import { useState } from "react";

// Framework UI Components
import { ToolWrapper } from "@/components/common/tool-wrapper";

// Tool Configuration
import { toolInfo } from "./toolInfo";

// Business Logic (Hooks & Utils)
import { use[Tool]State, use[Tool]Logic } from "./lib";

// UI Components
import { 
  [ComponentA], 
  [ComponentB], 
  [ComponentC] 
} from "./components";

export default function [ToolName]() {
  // State Management Hook
  const {
    state,
    actions
  } = use[Tool]State();

  // Business Logic Hook  
  const {
    handlers,
    computed
  } = use[Tool]Logic(state);

  // UI-only state (展开/折叠、选中等)
  const [uiState, setUIState] = useState({
    selectedTab: 'input',
    isExpanded: false,
    // ... other UI-only state
  });

  return (
    <ToolWrapper toolInfo={toolInfo} state={state}>
      {/* Tool Layout Structure */}
      <div className="tool-layout">
        
        {/* Header Section */}
        <ComponentA 
          data={computed.headerData}
          onAction={handlers.handleHeaderAction}
          uiState={uiState.selectedTab}
          onUIChange={(tab) => setUIState(prev => ({...prev, selectedTab: tab}))}
        />
        
        {/* Main Content Section */}
        <div className="main-content">
          <ComponentB 
            data={computed.mainData}
            onAction={handlers.handleMainAction}
            isExpanded={uiState.isExpanded}
            onToggle={(expanded) => setUIState(prev => ({...prev, isExpanded: expanded}))}
          />
        </div>
        
        {/* Results Section */}
        <ComponentC 
          data={computed.results}
          onAction={handlers.handleResultAction}
        />
        
      </div>
    </ToolWrapper>
  );
}
```

## 业务逻辑层 (lib/) 标准

### 1. 状态管理Hook (`lib/hooks/use[Tool]State.ts`)

```typescript
// 管理工具的核心状态
export function use[Tool]State() {
  const [state, setState] = useState<[Tool]State>({
    // 核心业务状态
  });

  const actions = {
    updateState: (updates: Partial<[Tool]State>) => {
      setState(prev => ({ ...prev, ...updates }));
    },
    resetState: () => {
      setState(initialState);
    },
    // ... 其他状态操作
  };

  return { state, actions };
}
```

### 2. 业务逻辑Hook (`lib/hooks/use[Tool]Logic.ts`)

```typescript
// 处理复杂的业务逻辑
export function use[Tool]Logic(state: [Tool]State) {
  const handlers = {
    handleProcess: useCallback(async (data: any) => {
      // 业务处理逻辑
    }, [state]),
    
    handleValidate: useCallback((input: any) => {
      // 验证逻辑
    }, []),
    
    // ... 其他业务处理函数
  };

  const computed = {
    // 计算属性
    processedData: useMemo(() => {
      return processData(state.rawData);
    }, [state.rawData]),
    
    // ... 其他计算属性
  };

  return { handlers, computed };
}
```

### 3. 工具函数 (`lib/utils/[功能]Utils.ts`)

```typescript
// 纯函数，不依赖组件状态
export function processData(data: any): ProcessedData {
  // 数据处理逻辑
}

export function validateInput(input: any): ValidationResult {
  // 验证逻辑
}

export function formatOutput(data: any): string {
  // 格式化逻辑
}
```

## 状态管理（推荐 zustand）

### 推荐场景
- 工具状态较复杂、涉及多组件共享、或需要解耦 UI 与状态逻辑时，推荐使用 zustand。
- 每个工具应有独立的 zustand store，避免全局状态污染。

### 目录结构建议

```
tools/[tool-name]/
├── lib/
│   └── store.ts      # 状态管理（推荐命名）
```

### 状态类型与 store 创建

```typescript
import { create } from 'zustand'

interface ToolState {
  input: string
  result: string
  setInput: (input: string) => void
  setResult: (result: string) => void
}

export const useToolStore = create<ToolState>((set) => ({
  input: '',
  result: '',
  setInput: (input) => set({ input }),
  setResult: (result) => set({ result }),
}))
```

### 组件中使用 store

```typescript
import { useToolStore } from './lib/store'

export default function ToolComponent() {
  const { input, result, setInput, setResult } = useToolStore()
  // ...
}
```

### 进阶示例

详见 programmer-calculator 的 `lib/store.ts`，支持批量更新、选择性订阅、原子操作等高级用法。

### 状态管理原则
- store 只负责状态和操作，UI 组件只负责渲染和交互。
- 所有状态和操作均需定义 TypeScript 类型。
- 每个工具的 store 仅服务于本工具，不做全局导出。
- 可使用 zustand 的选择性订阅减少无关渲染。

## 组件层 (components/) 标准

### 组件设计原则
1. **单一职责**: 每个组件只负责一个功能区域
2. **无状态偏好**: 优先使用受控组件，状态由父级管理
3. **可复用**: 组件设计应考虑在其他工具中复用
4. **Props清晰**: 明确区分数据props和事件处理props

### 组件模板

```typescript
interface [Component]Props {
  // 数据props
  data: [ComponentData];
  loading?: boolean;
  error?: string;
  
  // UI状态props
  isExpanded?: boolean;
  selectedItem?: string;
  
  // 事件处理props
  onAction: (action: [ActionType]) => void;
  onUIChange?: (uiState: [UIState]) => void;
}

export function [Component]({ 
  data, 
  loading, 
  error,
  isExpanded,
  selectedItem,
  onAction,
  onUIChange 
}: [Component]Props) {
  return (
    <div className="component-container">
      {/* 组件UI实现 */}
    </div>
  );
}
```

## 实施指导

### 重构步骤
1. **分析现有代码**: 识别UI逻辑vs业务逻辑
2. **提取业务逻辑**: 创建Hook和工具函数
3. **分离组件**: 将复杂UI拆分为独立组件
4. **重构ui.tsx**: 保留布局，移除业务逻辑
5. **类型安全**: 确保完整的TypeScript支持
6. **测试验证**: 确保功能无损失

### 质量检查清单
- [ ] ui.tsx 文件 < 200行代码
- [ ] ui.tsx 无业务逻辑函数
- [ ] 所有数据处理在lib/中
- [ ] 组件高度可复用
- [ ] TypeScript类型完整
- [ ] 错误处理完善
- [ ] 性能无倒退

## 收益

1. **可维护性**: 清晰的代码结构，易于定位和修改
2. **可测试性**: 业务逻辑和UI分离，便于单元测试
3. **可复用性**: 组件和工具函数可在多个工具间复用
4. **团队协作**: 明确的分工，前端和逻辑开发可并行
5. **代码质量**: 强制分离关注点，提高代码质量

## 示例工具

参考 `xml-parser` 工具的重构实现，它展示了：
- 完整的lib/目录结构
- 状态管理Hook的使用
- 组件的合理拆分
- ui.tsx的简化布局实现 