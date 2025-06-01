# Layout Demo - Design Specification

## Overview

Layout Demo是一个专门用于展示ToolLayout组件使用方法和设计原则的示范工具。它通过可视化标识不同的UI区域，帮助开发人员理解标准布局结构、设计原则和最佳实践。

### 主要特性
- **布局演示**: 清晰标识ToolLayout提供的各个区域
- **区域标注**: 使用彩色边框和标签标识不同功能区域
- **交互示例**: 提供实际的输入输出交互演示
- **设计原则**: 详细展示关键设计原则和实施指南
- **代码模板**: 提供标准工具实现模板

## User Interface Design

### Layout Structure

工具采用标准的ToolLayout框架，完全遵循设计规范：

```typescript
<ToolLayout
  toolName="Layout Demo"
  toolDescription="Demonstration of ToolLayout usage and design principles"
  onClose={handleClose}
  onMinimize={handleMinimize}
  onFullscreen={handleFullscreen}
  isFullscreen={isFullscreen}
>
  <div className="w-full p-6 space-y-6 mt-5">
    {/* 标准容器内容 */}
  </div>
</ToolLayout>
```

### Component Hierarchy

#### 标准布局演示区域
```
Layout Demo
├── ToolLayout Container
│   ├── Sidebar Area (ToolLayout提供)
│   ├── Header Area (ToolLayout提供)
│   ├── Window Controls (ToolLayout提供)
│   └── Main Content Area (工具实现)
│       ├── Layout Overview Section
│       ├── Input Section Demo
│       ├── Control Section Demo
│       ├── Output Section Demo
│       ├── Design Principles Section
│       └── Code Template Section
```

### Visual Design Elements

#### 区域标识系统
- **布局概览**: 蓝色边框和标签 (`border-blue-200 bg-blue-50/30`)
- **输入区域**: 绿色边框和标签 (`border-green-200 bg-green-50/30`)
- **控制区域**: 紫色边框和标签 (`border-purple-200 bg-purple-50/30`)
- **输出区域**: 橙色边框和标签 (`border-orange-200 bg-orange-50/30`)
- **设计原则**: 灰色边框和标签 (`border-slate-200`)

#### 标签系统
每个主要区域使用固定positioned Badge标签：
```typescript
<Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
  <Icon className="w-3 h-3 mr-1" />
  Section Name
</Badge>
```

## Core Features

### Feature 1: ToolLayout区域演示

#### ToolLayout提供的区域
1. **Sidebar Area**: App导航、工具搜索、主题切换
2. **Header Area**: 工具名称描述、侧边栏触发器、主题切换
3. **Window Controls**: macOS风格的窗口控制按钮
4. **Main Content Area**: 工具自定义内容区域

#### 可视化标识
- 使用虚线边框标识不同区域边界
- 颜色编码区分不同功能区域
- 图标和文字说明各区域功能

### Feature 2: 交互式演示

#### 输入控件演示
- **Input Field**: 标准文本输入框
- **Textarea**: 多行文本输入
- **实时反馈**: 输入内容实时显示在输出区域

#### 控制按钮演示
- **Copy Button**: 复制功能演示
- **Download Button**: 下载功能演示
- **Settings Button**: 设置功能演示
- **Clear Button**: 清除功能演示

### Feature 3: 设计原则展示

#### 布局标准
- **必需项目**: ToolLayout使用、标准容器、无Card包装
- **避免项目**: Card包装主内容、自定义窗口装饰、硬编码颜色

#### 可访问性要求
- **键盘导航**: Tab顺序、Enter/Space激活、Escape取消
- **ARIA支持**: aria-label、aria-expanded、role属性
- **视觉可访问性**: WCAG 2.1 AA对比度、焦点指示器

### Feature 4: 代码模板提供

#### 标准实现模板
提供完整的TypeScript组件模板，包括：
- ToolLayout配置
- 标准容器结构
- 响应式设计
- 可访问性支持

## Technical Implementation

### Architecture

#### 组件结构
```typescript
LayoutDemo
├── State Management
│   ├── isFullscreen (boolean)
│   ├── inputValue (string)
│   └── textareaValue (string)
├── Event Handlers
│   ├── handleClose()
│   ├── handleMinimize()
│   └── handleFullscreen()
└── UI Sections
    ├── LayoutOverviewSection
    ├── InputSectionDemo
    ├── ControlSectionDemo
    ├── OutputSectionDemo
    ├── DesignPrinciplesSection
    └── CodeTemplateSection
```

### State Management

#### 主要状态
```typescript
interface DemoState {
  isFullscreen: boolean;     // 全屏状态
  inputValue: string;        // 输入框内容
  textareaValue: string;     // 文本区域内容
}
```

#### 事件处理
- **窗口控制**: 处理关闭、最小化、全屏操作
- **输入交互**: 实时更新输入内容到输出区域
- **演示功能**: 模拟各种工具功能

### Performance Considerations

#### 轻量级实现
- **静态内容**: 大部分内容为静态展示
- **最小状态**: 仅维护必要的演示状态
- **优化渲染**: 使用React.memo避免不必要的重渲染

### Dependencies

#### shadcn/ui组件
- **Card**: 区域容器
- **Button**: 演示按钮
- **Input/Textarea**: 输入控件
- **Badge**: 区域标签
- **Separator**: 分隔线

## API Reference

### Core Component

#### LayoutDemo组件
```typescript
export default function LayoutDemo(): JSX.Element
```

演示工具的主组件，展示ToolLayout的完整使用方法。

**特性**:
- 完整的ToolLayout集成
- 可视化区域标识
- 交互式演示功能
- 设计原则展示

### Event Handlers

#### 窗口控制事件
```typescript
const handleClose = () => navigate('/')
const handleMinimize = () => console.log('Minimize to drawer')
const handleFullscreen = () => setIsFullscreen(!isFullscreen)
```

#### 输入事件
```typescript
const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  setInputValue(e.target.value)
}

const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
  setTextareaValue(e.target.value)
}
```

## Design Guidelines

### Visual Hierarchy

#### 色彩系统
- **蓝色**: 布局概览和代码模板
- **绿色**: 输入区域和正面示例
- **紫色**: 控制区域和交互元素
- **橙色**: 输出区域和结果显示
- **红色**: 重要提示和错误示例

#### 字体系统
- **标题**: font-semibold, text-lg
- **副标题**: font-medium, text-sm
- **正文**: text-muted-foreground, text-sm
- **代码**: font-mono, text-xs

### Accessibility

#### 键盘导航
- **Tab**: 按逻辑顺序遍历所有交互元素
- **Enter/Space**: 激活按钮和链接
- **方向键**: 在相关元素间导航

#### ARIA支持
- **aria-label**: 为所有交互元素提供描述
- **role**: 适当的语义角色标识
- **aria-describedby**: 关联帮助文本

## Testing Strategy

### Visual Testing

#### 布局一致性
- 验证各区域标识正确显示
- 确保颜色编码系统一致
- 检查响应式布局适配

#### 交互测试
- 验证输入输出联动正确
- 确保窗口控制功能正常
- 检查所有演示按钮可点击

### Accessibility Testing

#### 键盘导航
- 验证Tab顺序逻辑
- 确保所有元素可键盘访问
- 检查焦点指示器清晰

#### 屏幕阅读器
- 验证内容语义正确
- 确保区域标识可读
- 检查交互元素可识别

## Educational Value

### 学习目标

#### 开发人员收益
1. **布局理解**: 清晰理解ToolLayout结构
2. **设计原则**: 掌握关键设计原则
3. **最佳实践**: 学习标准实现方法
4. **代码模板**: 获得可用的实现模板

#### 设计规范传达
- **视觉标识**: 通过颜色和标签清晰传达
- **实际示例**: 提供可操作的交互示例
- **详细指南**: 包含完整的实施指导
- **代码参考**: 提供标准化代码模板

## Future Enhancements

### 扩展功能
- **主题演示**: 展示暗色/亮色主题切换
- **响应式演示**: 不同屏幕尺寸的布局变化
- **动画演示**: 展示标准交互动画
- **错误处理**: 演示标准错误处理模式

### 教育内容
- **视频教程**: 集成视频教学内容
- **交互指南**: 更多交互式学习元素
- **最佳实践**: 更多设计模式示例

---

**版本**: 1.0.0  
**最后更新**: 2024年12月  
**用途**: 教育演示工具，不用于生产环境 