# 标准新工具创建Prompt模板

```markdown
# 编写一个名为 `<工具名称>` 的工具

## 工具的功能包括
1. <功能描述1>
2. <功能描述2>
3. <功能描述3>
4. <更多功能...>

## 技术要求
- 使用 TypeScript + React 18.2.0 + tailwindcss 4
- 基于 shadcn/ui 组件库，但不要自行安装
- 遵循工具布局框架规范
- 支持响应式设计
- 包含完整的键盘快捷键支持
- 实现无障碍功能

## 设计规范
@design-specification.md

## 风格和样式
@THEME_GUIDE.md

## 参考文档
请参考以下关键文档来理解项目架构和设计模式：

### 布局框架文档
- `@tool-layout-specification.md` - 工具布局框架的完整规范
- `@tool-layout-usage-example.md` - 布局框架使用示例和最佳实践

### 现有工具实现参考
- `@programmer-calculator-specification.md` - 复杂交互工具的实现参考
- `@unit-converter-specification.md` - 实时转换工具的实现参考  
- `@uuid-generator-specification.md` - 简单工具的实现参考
- `@world-clock-specification.md` - 数据管理工具的实现参考

### 组件实现参考
- `@tool-layout.tsx` - 标准布局组件的实现

## 任务要求

### 1. 创建详细的设计文档
请根据上述功能需求创建详细的设计文档并输出到 `tools/<工具名称>-specification.md`，包含：

#### 必需内容：
- **Overview**: 工具概述和目标用户
- **Core Features**: 核心功能详细描述
- **UI Layout Design**: 界面布局设计（包含ASCII图示）
- **Technical Implementation**: 技术实现方案
  - Core Data Structures (TypeScript接口定义)
  - Component Architecture (组件架构)
  - State Management (状态管理策略)
- **Component Requirements**: 所需的shadcn/ui组件列表
- **Installation Requirements**: 安装命令
- **Responsive Design**: 响应式设计策略
- **Accessibility Features**: 无障碍功能设计
- **Performance Considerations**: 性能优化策略
- **Testing Requirements**: 测试要求

#### 设计原则：
- **Minimal Design**: 简洁清爽，无装饰元素
- **Theme Colors Only**: 只使用主题颜色，禁止硬编码颜色
- **shadcn/ui Only**: 只使用shadcn/ui组件
- **Privacy First**: 本地处理，数据隐私优先

### 2. 实现工具UI组件
创建工具的完整实现：

#### 文件结构：
```
tools/<工具名称>/
├── ui.tsx                 # 主要工具组件
├── toolInfo.ts           # 工具元数据
├── lib/                  # 工具逻辑
│   ├── index.ts          # 主要逻辑导出
│   ├── engine.ts         # 核心处理引擎
│   └── types.ts          # TypeScript类型定义
└── components/           # 工具特定组件（如需要）
    └── <component>.tsx
```

#### 实现要求：
1. **使用ToolLayout框架**: 
   ```typescript
   import { ToolLayout } from '@/components/layout/tool-layout'
   ```

2. **遵循布局标准**:
   ```typescript
   <ToolLayout
     toolName={toolInfo.name}
     toolDescription={toolInfo.description}
     onClose={handleClose}
     onMinimize={handleMinimize}
     onFullscreen={handleFullscreen}
     isFullscreen={isFullscreen}
   >
     <div className="w-full p-6 space-y-6 mt-5">
       {/* 主要工具界面 - 不要使用Card包装 */}
       <div className="space-y-6">
         {/* 工具内容 */}
       </div>
       
       {/* 可选：帮助信息 - 可以使用Card */}
       <Card>
         <CardContent>
           {/* 键盘快捷键等辅助信息 */}
         </CardContent>
       </Card>
     </div>
   </ToolLayout>
   ```

3. **窗口控制处理**:
   ```typescript
   const handleClose = useCallback(() => navigate('/'), [navigate])
   const handleMinimize = useCallback(() => {
     minimizeTool(toolInfo)
     navigate('/')
   }, [minimizeTool, navigate])
   ```

4. **工具元数据定义**:
   ```typescript
   // toolInfo.ts
   export const toolInfo: ToolInfo = {
     id: '<工具ID>',
     name: '<工具名称>',
     description: '<工具描述>',
     category: '<分类>',
     tags: ['<标签1>', '<标签2>'],
     requiresBackend: false,
     icon: <IconComponent>,
     path: '/tools/<工具路径>',
     version: '1.0.0',
     releaseDate: '2024-01-20',
     pricing: 'free'
   }
   ```

### 3. 注册工具到系统 ⭐ **重要步骤**
**必须完成工具注册才能在应用中使用！**

#### 3.1 在工具数据文件中注册
编辑 `src/data/tools.ts` 文件：

1. **导入工具信息**:
   ```typescript
   import { toolInfo as <工具名称>Info } from "@/tools/<工具名称>/toolInfo";
   ```

2. **添加到工具数组**:
   ```typescript
   export const tools: ToolInfo[] = [
     // 现有工具...
     <工具名称>Info,  // 添加新工具
     // 其他工具...
   ];
   ```

#### 3.2 创建路由页面
在 `src/app/tools/<工具名称>/page.tsx` 创建路由页面：

```typescript
import <ToolComponent> from "@/tools/<工具名称>/ui";

export default function <ToolName>Page() {
  return <<ToolComponent> />;
}
```

#### 3.3 配置主路由 ⭐ **关键步骤**
**必须在主应用路由中注册工具路由！**

编辑 `src/App.tsx` 文件：

1. **导入工具组件**:
   ```typescript
   import <ToolComponent> from "@/tools/<工具名称>/ui";
   ```

2. **添加路由规则**:
   ```typescript
   <Routes>
     {/* 现有路由... */}
     <Route path="/tools/<工具名称>" element={<<ToolComponent> />} />
   </Routes>
   ```

#### 3.4 验证注册成功
- 工具应出现在主页工具列表中
- 可以通过 `/tools/<工具名称>` 路径访问
- 分类计数正确更新
- 搜索功能可以找到该工具

### 4. 安装所需组件
确保安装所有必需的shadcn/ui组件：
```bash
# 示例安装命令（根据实际需要调整）
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# 其他所需组件...
```

### 5. 编码规范要求
- **Language**: 所有代码、注释、变量名使用英文
- **TypeScript**: 严格类型检查，定义完整的接口
- **Import Order**: 遵循标准导入顺序（React -> shadcn/ui -> 内部组件 -> 工具类型）
- **Error Handling**: 完善的错误处理和用户反馈
- **Performance**: 使用useCallback、useMemo优化性能
- **Accessibility**: 完整的键盘导航和屏幕阅读器支持
- **Component Documentation**: 为关键组件添加清晰的注释和唯一ID便于沟通和维护

#### 组件注释和ID规范：
```typescript
{/* Tool Main Container - Primary workspace area */}
<div id="tool-main-container" className="w-full p-6 space-y-6 mt-5">
  
  {/* Input Section - User input area */}
  <div id="input-section" className="space-y-4">
    {/* Input controls and form elements */}
  </div>
  
  {/* Control Panel - Action buttons and settings */}
  <div id="control-panel" className="flex items-center gap-2">
    {/* Control buttons */}
  </div>
  
  {/* Results Section - Output display area */}
  <div id="results-section" className="space-y-4">
    {/* Results and output content */}
  </div>
  
  {/* Status Bar - Tool status and feedback */}
  <div id="status-bar" className="flex items-center justify-between">
    {/* Status information */}
  </div>
</div>
```

#### 命名规范：
- **ID格式**: 使用kebab-case，如 `tool-main-container`、`input-section`
- **注释格式**: `{/* Component Name - Brief description */}`
- **必须标注的组件**:
  - 主要容器区域
  - 输入/输出区域  
  - 控制面板
  - 状态显示区域
  - 重要的交互组件
  - 模态框和弹出层

### 6. 测试验证
实现完成后需要验证：
- [ ] 工具可以正常构建和运行
- [ ] **工具已正确注册并出现在主页列表中** 
- [ ] **可以通过路由访问工具页面** 
- [ ] 所有核心功能正常工作
- [ ] 响应式布局在不同屏幕尺寸下正常显示
- [ ] 键盘快捷键正常工作
- [ ] 窗口控制（关闭、最小化、全屏）正常工作
- [ ] 主题切换正常工作
- [ ] 无障碍功能正常工作

## 开始实现
请按照上述要求，首先创建详细的设计文档，然后实现完整的工具功能。**确保完成工具注册步骤**，这是工具能够在应用中正常使用的关键！
```

---

这个Prompt模板提供了：

1. **标准化结构** - 每个新工具都遵循相同的创建流程
2. **完整的参考文档** - 引用了所有必要的规范和示例
3. **明确的技术要求** - TypeScript、React、shadcn/ui等
4. **详细的实现指导** - 从设计文档到代码实现的完整流程
5. **⭐ 重点强调工具注册步骤** - 确保工具能正常集成到系统中
6. **质量保证** - 包含测试验证清单

使用时只需要：
1. 替换 `<工具名称>` 为实际工具名
2. 填写具体的功能需求
3. 发送给Cursor进行开发 