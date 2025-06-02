# 工具架构模板生成器

基于新建立的架构标准，这里提供快速生成新工具架构的模板和指南。

## 快速生成步骤

### 1. 创建目录结构
```bash
# 在 src/tools/ 下创建新工具
mkdir src/tools/[tool-name]
mkdir src/tools/[tool-name]/lib
mkdir src/tools/[tool-name]/lib/hooks
mkdir src/tools/[tool-name]/lib/utils
mkdir src/tools/[tool-name]/components
mkdir src/tools/[tool-name]/docs
```

### 2. 核心文件模板

#### ui.tsx 模板
```typescript
"use client";

// Framework UI Components
import { ToolWrapper } from "@/components/common/tool-wrapper";

// Tool Configuration
import { toolInfo } from "./toolInfo";

// Business Logic (Hooks)
import { use[ToolName]State, use[ToolName]Logic } from "./lib";

// UI Components
import { MainComponent, ControlPanel, ResultsDisplay } from "./components";

export default function [ToolName]() {
  // State Management Hook
  const { state, actions } = use[ToolName]State();

  // Business Logic Hook
  const { computed, handlers } = use[ToolName]Logic(state, actions);

  return (
    <ToolWrapper toolInfo={toolInfo} state={state}>
      <div className="tool-layout">
        
        {/* Control Panel */}
        <ControlPanel 
          data={computed.controlData}
          onAction={handlers.handleControl}
        />
        
        {/* Main Content */}
        <MainComponent 
          data={computed.mainData}
          onAction={handlers.handleMain}
        />
        
        {/* Results */}
        <ResultsDisplay 
          data={computed.results}
          onAction={handlers.handleResults}
        />
        
      </div>
    </ToolWrapper>
  );
}
```

#### State Hook 模板 (lib/hooks/use[ToolName]State.ts)
```typescript
import { useState, useCallback } from "react";

export interface [ToolName]State {
  // Core business state
  inputData: string;
  outputData: string;
  isProcessing: boolean;
  
  // UI state
  selectedOption: string;
  isExpanded: boolean;
}

const initialState: [ToolName]State = {
  inputData: "",
  outputData: "",
  isProcessing: false,
  selectedOption: "default",
  isExpanded: false,
};

export function use[ToolName]State() {
  const [state, setState] = useState<[ToolName]State>(initialState);

  const actions = {
    setInputData: useCallback((data: string) => {
      setState(prev => ({ ...prev, inputData: data }));
    }, []),

    setOutputData: useCallback((data: string) => {
      setState(prev => ({ ...prev, outputData: data }));
    }, []),

    setProcessing: useCallback((processing: boolean) => {
      setState(prev => ({ ...prev, isProcessing: processing }));
    }, []),

    setSelectedOption: useCallback((option: string) => {
      setState(prev => ({ ...prev, selectedOption: option }));
    }, []),

    toggleExpanded: useCallback(() => {
      setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
    }, []),

    resetState: useCallback(() => {
      setState(initialState);
    }, []),
  };

  return { state, actions };
}
```

#### Logic Hook 模板 (lib/hooks/use[ToolName]Logic.ts)
```typescript
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { [ToolName]State } from "./use[ToolName]State";

export function use[ToolName]Logic(
  state: [ToolName]State,
  actions: ReturnType<typeof import('./use[ToolName]State').use[ToolName]State>['actions']
) {
  // Main processing function
  const handleProcess = useCallback(async () => {
    if (!state.inputData.trim()) {
      toast.error("请输入内容");
      return;
    }

    actions.setProcessing(true);
    
    try {
      // Main business logic here
      const result = await processData(state.inputData);
      actions.setOutputData(result);
      
      toast.success("处理完成");
    } catch (error) {
      toast.error("处理失败");
      console.error(error);
    } finally {
      actions.setProcessing(false);
    }
  }, [state.inputData, actions]);

  // Computed values
  const computed = useMemo(() => ({
    hasInput: !!state.inputData.trim(),
    hasOutput: !!state.outputData.trim(),
    canProcess: !!state.inputData.trim() && !state.isProcessing,
    
    controlData: {
      inputData: state.inputData,
      selectedOption: state.selectedOption,
      isProcessing: state.isProcessing,
    },
    
    mainData: {
      inputData: state.inputData,
      isExpanded: state.isExpanded,
    },
    
    results: {
      outputData: state.outputData,
      hasOutput: !!state.outputData.trim(),
    },
  }), [state]);

  // Event handlers
  const handlers = {
    handleProcess,
    
    handleInputChange: useCallback((value: string) => {
      actions.setInputData(value);
    }, [actions]),
    
    handleClear: useCallback(() => {
      actions.resetState();
    }, [actions]),
    
    handleControl: useCallback((action: string, data?: any) => {
      switch (action) {
        case 'process':
          handleProcess();
          break;
        case 'clear':
          actions.resetState();
          break;
        case 'option':
          actions.setSelectedOption(data);
          break;
      }
    }, [handleProcess, actions]),
    
    handleMain: useCallback((action: string, data?: any) => {
      switch (action) {
        case 'input':
          actions.setInputData(data);
          break;
        case 'toggle':
          actions.toggleExpanded();
          break;
      }
    }, [actions]),
    
    handleResults: useCallback((action: string, data?: any) => {
      switch (action) {
        case 'copy':
          navigator.clipboard.writeText(state.outputData);
          toast.success("已复制到剪贴板");
          break;
        case 'download':
          // Download logic
          break;
      }
    }, [state.outputData]),
  };

  return { computed, handlers };
}

// Helper function - move to utils/ if complex
async function processData(input: string): Promise<string> {
  // Implement your business logic here
  return input.toUpperCase(); // Example
}
```

#### 工具函数模板 (lib/utils/[toolName]Utils.ts)
```typescript
/**
 * [ToolName] Utility Functions
 */

export function validateInput(input: string): boolean {
  return input.trim().length > 0;
}

export function formatOutput(data: string): string {
  return data.trim();
}

export function processData(input: string): string {
  // Core business logic
  return input;
}

export function exportData(data: string, format: 'txt' | 'json'): void {
  const blob = new Blob([data], { 
    type: format === 'json' ? 'application/json' : 'text/plain' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}
```

#### 组件模板 (components/MainComponent.tsx)
```typescript
interface MainComponentProps {
  data: {
    inputData: string;
    isExpanded: boolean;
  };
  onAction: (action: string, data?: any) => void;
}

export function MainComponent({ data, onAction }: MainComponentProps) {
  return (
    <div className="main-component">
      <textarea
        value={data.inputData}
        onChange={(e) => onAction('input', e.target.value)}
        placeholder="输入内容..."
        className="w-full p-4 border rounded"
      />
      
      <button
        onClick={() => onAction('toggle')}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {data.isExpanded ? '收起' : '展开'}
      </button>
    </div>
  );
}
```

### 3. 配置文件模板

#### toolInfo.ts
```typescript
import type { ToolInfo } from '@/types/tool';
import { ToolIcon } from 'lucide-react';

export const toolInfo: ToolInfo = {
  id: '[tool-name]',
  name: '[Tool Display Name]',
  description: '[Tool description]',
  category: 'development', // or text, file, encode, crypto, image
  tags: ['tag1', 'tag2'],
  requiresBackend: false,
  icon: ToolIcon,
  path: '/tools/[tool-name]'
};
```

#### lib/index.ts
```typescript
// Export hooks
export { use[ToolName]State } from "./hooks/use[ToolName]State";
export { use[ToolName]Logic } from "./hooks/use[ToolName]Logic";

// Export utilities
export * from "./utils/[toolName]Utils";

// Export types
export type { [ToolName]State } from "./hooks/use[ToolName]State";
```

#### components/index.ts
```typescript
export { MainComponent } from "./MainComponent";
export { ControlPanel } from "./ControlPanel";
export { ResultsDisplay } from "./ResultsDisplay";
```

## 使用指南

### 1. 快速开始
1. 复制上述模板文件
2. 将 `[ToolName]` 和 `[tool-name]` 替换为实际工具名
3. 根据工具需求调整状态结构
4. 实现具体的业务逻辑
5. 添加必要的UI组件

### 2. 开发流程
1. 先设计状态结构 (State Hook)
2. 实现业务逻辑 (Logic Hook)
3. 创建UI组件 (Components)
4. 组装布局 (ui.tsx)
5. 测试和优化

### 3. 质量检查
- [ ] ui.tsx < 300行
- [ ] 无业务逻辑在UI层
- [ ] 完整的TypeScript类型
- [ ] 错误处理完善
- [ ] 组件可复用

## 示例工具

参考已重构的 `xml-parser` 工具，它完整展示了新架构的实现方式。 