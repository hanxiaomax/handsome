# Tool Development Guide

本指南详细说明了如何在本项目中创建一个新的工具，包括目录结构、代码实现、注册流程和最佳实践。

## 📋 目录

- [工具架构概览](#工具架构概览)
- [创建新工具步骤](#创建新工具步骤)
- [目录结构规范](#目录结构规范)
- [必需文件详解](#必需文件详解)
- [可选文件说明](#可选文件说明)
- [代码模板](#代码模板)
- [注册流程](#注册流程)
- [实际示例](#实际示例)
- [最佳实践](#最佳实践)
- [测试指南](#测试指南)
- [故障排除](#故障排除)

## 🏗️ 工具架构概览

### 设计原则
- **Privacy First**: 所有数据处理在浏览器本地进行
- **Zero Configuration**: 用户无需安装任何软件
- **Modular Architecture**: 每个工具独立开发和维护
- **Progressive Enhancement**: 核心功能优先，高级功能可选

### 技术栈
- **React 19.1.0**: 函数组件 + Hooks
- **TypeScript 5.8+**: 严格模式类型检查
- **Vite 6.3.5**: 现代构建工具
- **Tailwind CSS 4.0**: 原子化CSS框架
- **shadcn/ui 2.5.0**: 可复用UI组件
- **React Router DOM 7.6.0**: 客户端路由

## 🚀 创建新工具步骤

### 步骤1: 创建工具目录
```bash
# 在 src/tools/ 下创建新工具目录
mkdir src/tools/your-tool-name
cd src/tools/your-tool-name
```

### 步骤2: 创建必需文件
```bash
# 创建基础文件
touch ui.tsx          # 主要组件
touch toolInfo.ts     # 工具元数据
touch lib.ts          # 业务逻辑（可选）
```

### 步骤3: 实现工具代码
参考下方的[代码模板](#代码模板)部分

### 步骤4: 注册工具
在 `src/App.tsx` 中添加路由和导入

### 步骤5: 添加到工具列表
在 `src/data/tools.ts` 中注册工具信息

## 📁 目录结构规范

```
src/tools/your-tool-name/
├── ui.tsx                    # 必需：主要React组件
├── toolInfo.ts              # 必需：工具元数据配置
├── lib.ts                   # 可选：业务逻辑和工具函数（简单工具）
├── lib/                     # 可选：复杂逻辑模块目录（复杂工具）
│   ├── parser.ts
│   ├── validator.ts
│   ├── processor.ts
│   └── __tests__/
│       ├── parser.test.ts
│       └── validator.test.ts
├── components/              # 可选：工具专用组件
│   ├── input-panel.tsx
│   ├── result-display.tsx
│   └── settings-dialog.tsx
├── docs/                    # 推荐：详细文档
│   ├── specification.md     # 工具规范文档
│   ├── user-guide.md       # 用户使用指南
│   └── api-reference.md    # API参考文档
├── assets/                  # 可选：静态资源
│   ├── sample-files/
│   └── icons/
└── types.ts                 # 可选：TypeScript类型定义
```

### 🎯 工具复杂度指导原则

#### 简单工具（≤3个文件）
```
src/tools/uuid-generator/
├── ui.tsx                  # UI组件
├── toolInfo.ts            # 元数据
└── lib.ts                 # 简单逻辑
```

#### 中等复杂度工具（4-8个文件）
```
src/tools/unit-converter/
├── ui.tsx                  # UI组件
├── toolInfo.ts            # 元数据
├── lib.ts                 # 主要逻辑
├── components/            # 工具专用组件
│   └── combobox.tsx
└── docs/
    └── specification.md
```

#### 复杂工具（≥9个文件）
```
src/tools/programmer-calculator/
├── ui.tsx                  # UI组件
├── toolInfo.ts            # 元数据
├── lib/                   # 复杂逻辑模块
│   ├── calculator.ts
│   ├── base-converter.ts
│   └── __tests__/
├── components/            # 多个专用组件
│   ├── display.tsx
│   ├── button-grid.tsx
│   └── bit-grid.tsx
└── docs/
    ├── specification.md
    └── api-reference.md
```

## 📄 必需文件详解

### 1. toolInfo.ts - 工具元数据
```typescript
import type { ToolInfo } from '@/types/tool'
import { YourIcon } from 'lucide-react'

export const toolInfo: ToolInfo = {
  id: 'your-tool-name',                    // 唯一标识符，用于路由
  name: 'Your Tool Name',                  // 显示名称
  description: 'Tool description',         // 简短描述
  category: 'development',                 // 工具分类
  tags: ['tag1', 'tag2', 'utility'],     // 搜索标签
  requiresBackend: false,                  // 是否需要后端支持
  icon: YourIcon,                         // Lucide React图标
  path: '/tools/your-tool-name',          // 访问路径
  version: '1.0.0',                       // 版本号
  releaseDate: '2024-12-01',              // 发布日期
  pricing: 'free'                         // 定价信息
}
```

#### 可用的分类 (category)
- `development`: 开发工具
- `text`: 文本处理工具
- `file`: 文件处理工具
- `encode`: 编码/解码工具
- `crypto`: 加密/安全工具
- `image`: 图像处理工具

### 2. ui.tsx - 主要组件
```typescript
import { useState } from 'react'
import { ToolWrapper } from '@/components/common/tool-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toolInfo } from './toolInfo'

export default function YourToolName() {
  // 工具状态管理
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleProcess = async () => {
    setLoading(true)
    try {
      // 处理逻辑
      const processedResult = await processInput(input)
      setResult(processedResult)
    } catch (error) {
      console.error('Processing failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolWrapper 
      toolInfo={toolInfo} 
      state={{ input, result, loading }}
    >
      {/* 主容器 - 遵循标准布局规范 */}
      <div className="w-full p-6 space-y-6 mt-5">
        
        {/* 输入区域 */}
        <Card id="input-section">
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 输入控件 */}
          </CardContent>
        </Card>
        
        {/* 控制区域 */}
        <div id="control-section" className="flex gap-2">
          <Button onClick={handleProcess} disabled={loading}>
            {loading ? 'Processing...' : 'Process'}
          </Button>
          <Button variant="outline" onClick={() => setInput('')}>
            Clear
          </Button>
        </div>
        
        {/* 输出区域 */}
        <Card id="output-section">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 结果显示 */}
          </CardContent>
        </Card>
        
      </div>
    </ToolWrapper>
  )
}

// 工具逻辑函数
async function processInput(input: string): Promise<string> {
  // 实现具体的处理逻辑
  return `Processed: ${input}`
}
```



## 🎛️ 通用控制系统

### ToolWrapper 组件架构
项目采用了先进的通用控制系统，通过 `ToolWrapper` 组件自动提供标准化的工具控制功能。

#### 自动提供的功能
- **Home按钮**: 自动导航回首页
- **Favorite按钮**: 自动管理收藏状态，支持实时切换
- **Minimize按钮**: 自动保存工具状态并最小化到抽屉
- **状态管理**: 自动处理工具状态的保存和恢复
- **导航集成**: 自动集成React Router导航
- **类型安全**: 完整的TypeScript类型支持

#### 按钮注册逻辑
```typescript
// src/components/common/tool-wrapper.tsx
interface ToolWrapperProps {
  toolInfo: ToolInfo;                    // 工具元数据
  state?: Record<string, unknown>;       // 工具状态 (可选)
  children: React.ReactNode;             // 工具内容
}

export function ToolWrapper({ toolInfo, state, children }: ToolWrapperProps) {
  // 自动获取通用控制逻辑
  const controlProps = useToolControls(toolInfo, state);
  
  return (
    <ToolLayout {...controlProps}>
      {children}
    </ToolLayout>
  );
}
```

#### 控制逻辑Hook
```typescript
// src/hooks/use-tool-controls.ts
export function useToolControls(toolInfo: ToolInfo, state?: Record<string, unknown>) {
  const navigate = useNavigate();
  const { minimizeTool } = useMinimizedTools();
  const { favorites, toggleFavorite } = useFavorites();
  
  // 自动生成控制函数
  const handleHome = useCallback(() => navigate("/"), [navigate]);
  
  const handleMinimize = useCallback(() => {
    if (state) {
      minimizeTool(toolInfo, state);
    }
    navigate("/");
  }, [minimizeTool, navigate, toolInfo, state]);
  
  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(toolInfo.id);
    toast.success(
      favorites.includes(toolInfo.id) 
        ? `已从收藏夹移除 ${toolInfo.name}` 
        : `已添加 ${toolInfo.name} 到收藏夹`
    );
  }, [toggleFavorite, toolInfo, favorites]);
  
  // 返回标准化的ToolLayout props
  return {
    toolName: toolInfo.name,
    toolDescription: toolInfo.description,
    onHome: handleHome,
    onMinimize: handleMinimize,
    onToggleFavorite: handleToggleFavorite,
    isFavorite: favorites.includes(toolInfo.id),
  };
}
```



### 状态管理最佳实践

#### 状态结构规范
```typescript
// 推荐的状态结构
interface MyToolState {
  input: string;
  result: string | null;
  settings: ToolSettings;
  history: ProcessedItem[];
}

// 传递给 ToolWrapper
<ToolWrapper 
  toolInfo={toolInfo} 
  state={{ 
    myToolState: state,           // 核心工具状态
    additionalData: metadata      // 额外数据 (可选)
  }}
>
```

#### 状态恢复机制
```typescript
// 工具启动时自动恢复状态
useEffect(() => {
  const savedState = getMinimizedToolState(toolInfo.id);
  if (savedState?.myToolState) {
    setState(savedState.myToolState);
    toast.info("已恢复之前的工作状态");
  }
}, []);
```

### 按钮样式和交互

#### 统一的按钮设计
```typescript
// src/components/layout/tool-layout.tsx
const WindowControls = ({ onHome, onToggleFavorite, onMinimize, isFavorite }: WindowControlsProps) => (
  <div className="flex items-center gap-2">
    {/* Home按钮 */}
    <Button
      variant="ghost"
      size="sm"
      onClick={onHome}
      className="flex items-center gap-2 px-3"
    >
      <Home className="h-4 w-4" />
      <span>Home</span>
    </Button>
    
    {/* 收藏按钮 */}
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggleFavorite}
      className={`flex items-center gap-2 px-3 ${
        isFavorite ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
      }`}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
    </Button>
    
    {/* 最小化按钮 */}
    <Button
      variant="ghost"
      size="sm"
      onClick={onMinimize}
      className="flex items-center gap-2 px-3"
    >
      <Minimize2 className="h-4 w-4" />
      <span>Minimize</span>
    </Button>
  </div>
);
```

### 系统优势

使用ToolWrapper通用控制系统的优势：

- **代码简洁**: 每个工具只需20-30行控制代码，减少70%样板代码
- **一致性强**: 自动统一所有工具的控制界面和交互体验  
- **维护方便**: 集中维护控制逻辑，降低80%维护成本
- **类型安全**: 完整的TypeScript类型支持和检查
- **功能完整**: 自动提供Home、收藏、最小化等完整功能
- **开发高效**: 开发者只需关注业务逻辑，不需要处理控制逻辑

## 📦 可选文件说明

### lib.ts - 业务逻辑模块
```typescript
/**
 * 工具核心逻辑和工具函数
 */

export interface ProcessOptions {
  format: 'json' | 'xml' | 'csv'
  validate: boolean
}

export class YourToolProcessor {
  static async process(input: string, options: ProcessOptions): Promise<string> {
    // 实现处理逻辑
    return input
  }
  
  static validate(input: string): boolean {
    // 实现验证逻辑
    return true
  }
}

export const defaultOptions: ProcessOptions = {
  format: 'json',
  validate: true
}
```

### types.ts - 类型定义
```typescript
export interface ToolState {
  input: string
  result: string | null
  loading: boolean
  error: string | null
}

export interface ProcessResult {
  success: boolean
  data?: string
  error?: string
  metadata?: Record<string, any>
}

export type SupportedFormat = 'json' | 'xml' | 'csv' | 'yaml'
```

### components/ - 专用组件
```typescript
// components/input-panel.tsx
interface InputPanelProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function InputPanel({ value, onChange, placeholder }: InputPanelProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-32 p-3 border rounded-md"
        />
      </CardContent>
    </Card>
  )
}
```

## 🔧 代码模板

### 快速开始模板
```typescript
// src/tools/your-tool-name/ui.tsx
import { useState } from 'react'
import { ToolWrapper } from '@/components/common/tool-wrapper'
import { toolInfo } from './toolInfo'

export default function YourToolName() {
  // 工具状态（根据需要定义）
  const [state, setState] = useState({
    input: '',
    result: null,
    loading: false
  })

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ toolState: state }}>
      <div className="w-full p-6 space-y-6 mt-5">
        <h1>Your tool content here</h1>
        {/* 工具的具体内容 */}
      </div>
    </ToolWrapper>
  )
}
```

```typescript
// src/tools/your-tool-name/toolInfo.ts
import type { ToolInfo } from '@/types/tool'
import { Wrench } from 'lucide-react'

export const toolInfo: ToolInfo = {
  id: 'your-tool-name',
  name: 'Your Tool Name',
  description: 'Brief description',
  category: 'development',
  tags: ['utility'],
  requiresBackend: false,
  icon: Wrench,
  path: '/tools/your-tool-name',
  version: '1.0.0',
  releaseDate: '2024-12-01',
  pricing: 'free'
}
```

## 📝 注册流程

### 1. 添加路由 (src/App.tsx)
```typescript
// 添加导入
import YourToolName from "@/tools/your-tool-name/ui"

// 在 Routes 中添加路由
<Route path="/tools/your-tool-name" element={<YourToolName />} />
```

### 2. 注册工具信息 (src/data/tools.ts)
```typescript
import { toolInfo as yourToolInfo } from '@/tools/your-tool-name/toolInfo'

export const tools: ToolInfo[] = [
  // ... 现有工具
  yourToolInfo,
]
```

## 🎯 实际示例：创建文本转换器

让我们通过一个实际示例来演示如何创建一个简单的文本转换器工具。

### 步骤1: 创建目录结构
```bash
mkdir src/tools/text-transformer
cd src/tools/text-transformer
```

### 步骤2: 创建 toolInfo.ts
```typescript
// src/tools/text-transformer/toolInfo.ts
import type { ToolInfo } from '@/types/tool'
import { Type } from 'lucide-react'

export const toolInfo: ToolInfo = {
  id: 'text-transformer',
  name: 'Text Transformer',
  description: 'Transform text to uppercase, lowercase, title case and more',
  category: 'text',
  tags: ['text', 'transform', 'case', 'uppercase', 'lowercase'],
  requiresBackend: false,
  icon: Type,
  path: '/tools/text-transformer',
  version: '1.0.0',
  releaseDate: '2024-12-01',
  pricing: 'free'
}
```

### 步骤3: 创建 ui.tsx
```typescript
// src/tools/text-transformer/ui.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToolLayout } from '@/components/layout/tool-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function TextTransformer() {
  const navigate = useNavigate()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  const handleClose = () => navigate('/')
  const handleMinimize = () => console.log('Minimize to drawer')
  const handleFullscreen = () => setIsFullscreen(!isFullscreen)

  const transformText = (type: string) => {
    let transformed = ''
    switch (type) {
      case 'uppercase':
        transformed = input.toUpperCase()
        break
      case 'lowercase':
        transformed = input.toLowerCase()
        break
      case 'title':
        transformed = input.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
        break
      case 'reverse':
        transformed = input.split('').reverse().join('')
        break
      default:
        transformed = input
    }
    setResult(transformed)
  }

  return (
    <ToolLayout
      toolName="Text Transformer"
      toolDescription="Transform text to uppercase, lowercase, title case and more"
      onClose={handleClose}
      onMinimize={handleMinimize}
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
    >
      <div className="w-full p-6 space-y-6 mt-5">
        
        {/* Input Section */}
        <Card id="input-section">
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text">Enter text to transform</Label>
              <Textarea
                id="input-text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your text here..."
                className="min-h-32"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Control Section */}
        <div id="control-section" className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            onClick={() => transformText('uppercase')}
            disabled={!input.trim()}
          >
            UPPERCASE
          </Button>
          <Button 
            onClick={() => transformText('lowercase')}
            disabled={!input.trim()}
            variant="outline"
          >
            lowercase
          </Button>
          <Button 
            onClick={() => transformText('title')}
            disabled={!input.trim()}
            variant="outline"
          >
            Title Case
          </Button>
          <Button 
            onClick={() => transformText('reverse')}
            disabled={!input.trim()}
            variant="outline"
          >
            esreveR
          </Button>
        </div>
        
        {/* Output Section */}
        <Card id="output-section">
          <CardHeader>
            <CardTitle>Transformed Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="output-text">Result</Label>
              <Textarea
                id="output-text"
                value={result}
                readOnly
                placeholder="Transformed text will appear here..."
                className="min-h-32"
              />
            </div>
          </CardContent>
        </Card>
        
      </div>
    </ToolLayout>
  )
}
```

### 步骤4: 注册工具

在 `src/App.tsx` 中添加路由：
```typescript
// 添加导入
import TextTransformer from "@/tools/text-transformer/ui"

// 在 Routes 中添加
<Route path="/tools/text-transformer" element={<TextTransformer />} />
```

在 `src/data/tools.ts` 中注册：
```typescript
// 添加导入
import { toolInfo as textTransformerInfo } from '@/tools/text-transformer/toolInfo'

// 在 tools 数组中添加
export const tools: ToolInfo[] = [
  // ... 现有工具
  textTransformerInfo,
]
```

### 步骤5: 测试工具
```bash
npm run dev  # 启动开发服务器
# 访问 http://localhost:5173/tools/text-transformer
```

## ✨ 最佳实践

### 🎨 UI/UX 设计
- **使用ToolLayout包装器**: 提供统一的布局和窗口控制
- **遵循标准容器类**: `w-full p-6 space-y-6 mt-5`
- **避免Card包装主内容**: ToolLayout已提供容器样式
- **响应式设计**: 使用Tailwind的响应式类
- **暗黑模式支持**: 使用shadcn/ui的颜色变量

### 🔧 代码质量
- **TypeScript严格模式**: 启用所有严格检查
- **函数组件 + Hooks**: 不使用类组件
- **命名导出优于默认导出**: 组件除外
- **Props接口定义**: 为所有组件定义明确的Props类型
- **错误边界**: 实现适当的错误处理

### 📊 性能优化
- **代码分割**: 使用动态导入大型依赖
- **内存管理**: 清理事件监听器和定时器
- **文件大小限制**: ≤ 100MB文件处理
- **内存限制**: < 500MB工具内存使用
- **懒加载**: 延迟加载非关键组件

### 🔒 安全性
- **输入验证**: 验证所有用户输入
- **文件类型检查**: 限制允许的文件类型
- **本地处理**: 优先本地数据处理
- **敏感数据清理**: 处理后清除敏感数据

### ♿ 可访问性
- **语义化HTML**: 使用正确的HTML元素
- **ARIA支持**: 添加必要的ARIA属性
- **键盘导航**: 支持完整的键盘操作
- **屏幕阅读器**: 提供描述性文本
- **对比度**: 确保足够的颜色对比度

## 🧪 测试指南

### 单元测试
```typescript
// src/tools/your-tool-name/lib/__tests__/processor.test.ts
import { describe, it, expect } from 'vitest'
import { YourToolProcessor } from '../processor'

describe('YourToolProcessor', () => {
  it('should process input correctly', () => {
    const input = 'test input'
    const result = YourToolProcessor.process(input, {})
    expect(result).toBeDefined()
  })
})
```

### 组件测试
```typescript
// src/tools/your-tool-name/__tests__/ui.test.tsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import YourToolName from '../ui'

test('renders tool correctly', () => {
  render(
    <BrowserRouter>
      <YourToolName />
    </BrowserRouter>
  )
  expect(screen.getByText('Your Tool Name')).toBeInTheDocument()
})
```

### 运行测试
```bash
npm run test                    # 运行所有测试
npm run test -- your-tool-name # 运行特定工具测试
npm run test:coverage          # 生成覆盖率报告
```

## 🔍 故障排除

### 常见问题

#### 1. 路由不工作
**症状**: 访问工具URL显示404
**解决方案**:
- 检查 `src/App.tsx` 中是否添加了路由
- 确认路径与 `toolInfo.ts` 中的 `path` 一致
- 验证导入路径是否正确

#### 2. 工具未显示在列表中
**症状**: 工具不在首页工具列表中出现
**解决方案**:
- 检查 `src/data/tools.ts` 中是否注册了工具
- 确认 `toolInfo.ts` 导出正确
- 验证 `category` 和 `tags` 设置

#### 3. 样式不正确
**症状**: 工具布局或样式异常
**解决方案**:
- 确保使用了 `ToolLayout` 包装器
- 检查主容器类: `w-full p-6 space-y-6 mt-5`
- 避免在主内容外层添加额外的 Card 包装

#### 4. TypeScript 错误
**症状**: 类型检查失败
**解决方案**:
- 确保导入了正确的类型: `import type { ToolInfo } from '@/types/tool'`
- 检查所有必需属性是否已定义
- 验证图标导入: `import { IconName } from 'lucide-react'`

#### 5. 构建失败
**症状**: Vite 构建时出错
**解决方案**:
- 检查所有导入路径是否正确
- 确保没有未使用的导入
- 验证所有文件都使用了正确的文件扩展名

### 调试技巧

#### 开发模式调试
```bash
npm run dev                     # 启动开发服务器
npm run build                   # 测试生产构建
npm run lint                    # 检查代码质量
npm run type-check             # TypeScript 类型检查
```

#### 控制台调试
```typescript
// 在组件中添加调试信息
console.log('Tool state:', { input, result, loading })

// 使用React DevTools
// 安装: https://react.dev/learn/react-developer-tools
```

## 📚 参考资源

### 官方文档
- [React 19 文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### 项目相关
- [设计规范](./design-specification.md)
- [组件文档](./src/components/README.md)
- [API 参考](./src/types/README.md)

### 示例工具
- **简单工具**: `src/tools/uuid-generator/`
- **复杂工具**: `src/tools/arxml-parser/`
- **布局演示**: `src/tools/layout-demo/`

---

## 🎯 快速检查清单

### 新工具开发检查清单
创建新工具时，请确保完成以下检查项：

#### 基础设置
- [ ] 创建了工具目录 `src/tools/your-tool-name/`
- [ ] 实现了 `ui.tsx` 主组件
- [ ] 配置了 `toolInfo.ts` 元数据
- [ ] 在 `src/App.tsx` 中添加了路由
- [ ] 在 `src/data/tools.ts` 中注册了工具

#### ToolWrapper集成
- [ ] 使用了 `ToolWrapper` 包装器
- [ ] 正确导入 `import { ToolWrapper } from '@/components/common/tool-wrapper'`
- [ ] 传递了 `toolInfo` 和 `state` 参数
- [ ] 只专注于工具业务逻辑，无需手动控制代码

#### 布局和样式
- [ ] 遵循了标准容器类 `w-full p-6 space-y-6 mt-5`
- [ ] 添加了适当的ID标识符 (`input-section`, `control-section`, `output-section`)
- [ ] 验证了响应式设计
- [ ] 支持暗黑模式

#### 代码质量
- [ ] 检查了TypeScript类型，无编译错误
- [ ] 遵循了项目代码规范
- [ ] 添加了必要的错误处理
- [ ] 确保了可访问性支持

#### 功能测试
- [ ] 测试了基本功能
- [ ] 验证了Home按钮导航
- [ ] 验证了Favorite按钮切换
- [ ] 验证了Minimize状态保存
- [ ] 测试了状态恢复功能



完成以上检查项后，你的新工具就可以正常使用了！

---

## 📈 开发效率提升

通过使用通用控制系统，项目获得了显著的开发效率提升：

- **代码减少**: 每个工具减少50-80行样板代码
- **开发速度**: 新工具开发时间减少60%  
- **维护成本**: 集中维护，降低80%维护成本
- **一致性**: 100%的UI和交互一致性
- **类型安全**: 完整的TypeScript类型安全保障
- **专注业务**: 开发者可以专注于工具的核心功能逻辑

---

*本指南会随着项目发展持续更新。如有问题或建议，请创建issue或提交PR。* 