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
     path: '/tools/<工具路径>'
   }
   ```

### 3. 安装所需组件
确保安装所有必需的shadcn/ui组件：
```bash
# 示例安装命令（根据实际需要调整）
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# 其他所需组件...
```

### 4. 编码规范要求
- **Language**: 所有代码、注释、变量名使用英文
- **TypeScript**: 严格类型检查，定义完整的接口
- **Import Order**: 遵循标准导入顺序（React -> shadcn/ui -> 内部组件 -> 工具类型）
- **Error Handling**: 完善的错误处理和用户反馈
- **Performance**: 使用useCallback、useMemo优化性能
- **Accessibility**: 完整的键盘导航和屏幕阅读器支持

### 5. 测试验证
实现完成后需要验证：
- [ ] 工具可以正常构建和运行
- [ ] 所有核心功能正常工作
- [ ] 响应式布局在不同屏幕尺寸下正常显示
- [ ] 键盘快捷键正常工作
- [ ] 窗口控制（关闭、最小化、全屏）正常工作
- [ ] 主题切换正常工作
- [ ] 无障碍功能正常工作

## 开始实现
请按照上述要求，首先创建详细的设计文档，然后实现完整的工具功能。确保遵循所有设计原则和技术要求。
```

---

这个Prompt模板提供了：

1. **标准化结构** - 每个新工具都遵循相同的创建流程
2. **完整的参考文档** - 引用了所有必要的规范和示例
3. **明确的技术要求** - TypeScript、React、shadcn/ui等
4. **详细的实现指导** - 从设计文档到代码实现的完整流程
5. **质量保证** - 包含测试验证清单

使用时只需要：
1. 替换 `<工具名称>` 为实际工具名
2. 填写具体的功能需求
3. 发送给Cursor进行开发 