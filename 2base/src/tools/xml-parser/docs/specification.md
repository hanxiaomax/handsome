# XML Parser - Design Specification

## Overview

XML Parser是一个通用的XML文件解析和可视化工具，支持任何XML格式的高效处理、树状结构导航和多种格式输出。该工具遵循现代Web应用设计原则，提供直观的用户界面和强大的解析能力，特别适用于AUTOSAR XML、SVG、RSS、配置文件等各种XML格式。

### 主要特性
- **双输入模式**: 支持文件上传和直接文本输入
- **高效解析**: 使用fast-xml-parser库处理复杂XML结构
- **可视化导航**: 树状结构显示，支持展开/折叠和面包屑导航
- **多格式输出**: 支持美化XML、压缩XML、JSON格式和树状结构视图
- **实时搜索**: 在树状结构中快速定位元素
- **智能复制清除**: 基于当前状态的上下文感知操作
- **通用兼容**: 支持AUTOSAR、SVG、RSS、配置文件等各种XML格式

## User Interface Design

### Layout Structure

工具采用标准的ToolLayout框架，遵循macOS风格的窗口设计：

```typescript
<ToolLayout
  toolName="XML Parser"
  toolDescription="Parse and visualize any XML files with interactive tree navigation"
  onClose={() => navigate('/')}
  onMinimize={() => {}}
  onFullscreen={() => {}}
  isFullscreen={false}
>
  {/* 主要内容区域 */}
</ToolLayout>
```

### Component Hierarchy

#### 主容器结构
```
XML Parser
├── ResizablePanelGroup (horizontal)
│   ├── Left Panel (Source XML)
│   │   ├── Status Bar (文件信息和状态)
│   │   ├── Toolbar (控制按钮和操作)
│   │   └── Visualization Area
│   │       ├── Input Tabs (File Upload / Text Input)
│   │       └── Source Code Display
│   │
│   ├── ResizableHandle
│   │
│   └── Right Panel (Processed View)
│       ├── Status Bar (显示模式和内容信息)
│       ├── Toolbar (模式选择和操作控制)
│       ├── Breadcrumb Status Bar (路径导航，条件显示)
│       └── Visualization Area (处理后内容显示)
└── Status Bar (错误信息显示，条件显示)
```

### Responsive Design

- **面板尺寸**: 左右面板默认各占50%，最小30%
- **最小宽度**: 1024px以下适配移动设备
- **滚动区域**: 左右预览区域独立滚动
- **动态高度**: Breadcrumb状态栏根据树状模式动态显示

### 主要UI区域

#### 1. 左侧面板 - 源XML输入
- **状态栏**: 显示输入类型、文件名和文件大小信息
- **工具栏**: 行号切换、自动解析开关、解析按钮、复制/下载/清除操作
- **输入区域**: 
  - 标签页切换（文件上传/文本输入）
  - 拖拽上传区域
  - 文本输入框（带滚动条）
  - 源码显示区域（带行号和语法高亮）

#### 2. 右侧面板 - 处理后视图
- **状态栏**: 显示当前模式和元素数量
- **工具栏**: 显示模式切换、搜索框、展开/折叠控制、复制/下载操作
- **路径导航栏**: 面包屑导航（仅在树状模式且有选择时显示）
- **内容区域**: 四种显示模式的内容展示

## Core Features

### Feature 1: 双输入模式系统

#### 文件上传模式
- **支持格式**: .xml, .arxml, .xsd, .svg, .rss, .atom
- **拖拽上传**: 可视化拖拽区域，支持拖拽反馈
- **文件验证**: 自动检测XML格式
- **自动解析**: 可选的文件加载后自动解析（小于10MB）

#### 文本输入模式
- **直接粘贴**: 支持大文本内容粘贴
- **滚动支持**: 400px高度的滚动文本区域
- **实时验证**: 输入内容的格式检查
- **智能切换**: 文件选择时自动切换到文件模式

### Feature 2: 高效XML解析引擎

#### 解析器架构
- **主解析器**: fast-xml-parser 5.2.3
- **配置优化**: 属性解析、文本节点、CDATA、注释支持
- **性能优化**: 大文件分块处理，进度指示
- **错误处理**: 详细的解析错误报告

#### 解析流程
```typescript
// 解析配置
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  parseAttributeValue: true,
  trimValues: true
}

// 解析流程
1. 验证输入格式
2. 初始化解析器
3. 结构化解析 (30%)
4. 转换为树节点 (70%)
5. 生成XML元素 (100%)
```

### Feature 3: 多格式可视化

#### 1. 美化XML模式
- **智能缩进**: 2空格缩进，保持XML结构
- **语法高亮**: 支持标签、属性、文本内容的视觉区分
- **行号显示**: 可切换的行号显示
- **自动换行**: 120字符长度自动换行

#### 2. 树状结构模式
- **层级显示**: 可展开/折叠的树状结构
- **元素计数**: 显示子元素数量
- **类型标识**: 区分不同XML元素类型
- **选择高亮**: 选中元素的视觉反馈

#### 3. 压缩XML模式
- **空格压缩**: 移除冗余空白字符
- **自动换行**: 120字符长度换行，保持可读性
- **结构保持**: 维持XML标签完整性

#### 4. JSON转换模式
- **结构映射**: XML到JSON的智能转换
- **属性处理**: @前缀标识XML属性
- **文本内容**: text字段存储文本节点
- **格式化输出**: 2空格缩进的JSON格式

### Feature 4: 交互式导航系统

#### 树状导航
- **展开/折叠**: 支持单个节点和批量操作
- **深度搜索**: 实时搜索XML元素名称
- **选择反馈**: 选中元素的边框高亮显示

#### 面包屑导航
- **路径显示**: 显示当前选中元素的完整路径
- **可点击导航**: 点击路径中的任意层级
- **根节点**: Home图标表示根节点
- **动态显示**: 仅在树状模式且有选择时显示

### Feature 5: 智能操作系统

#### 复制功能
- **多格式支持**: 根据当前显示模式复制对应格式
- **兼容性**: modern clipboard API + document.execCommand fallback
- **成功反馈**: Toast消息确认复制成功

#### 下载功能
- **格式保持**: 根据显示模式生成对应格式文件
- **智能命名**: 基于原文件名的自动命名
- **MIME类型**: 正确的文件类型标识

#### 智能清除
- **上下文感知**: 根据当前输入模式显示清除选项
- **条件显示**: 仅在有内容时显示清除按钮
- **全面清理**: 清除输入内容和解析结果

## Technical Implementation

### Architecture

#### 组件架构
```typescript
// 主组件
XMLParser
├── FileUploadState - 文件上传状态管理
├── XMLStreamParser - 解析引擎实例  
├── FastXMLParser - 新XML解析器
├── UI State Management - 界面状态
└── Event Handlers - 事件处理

// 解析引擎
FastXMLParser
├── XMLParser (fast-xml-parser)
├── XMLBuilder (fast-xml-parser)
├── parseXMLToTree() - 解析为树节点
├── convertToXMLElements() - 转换为元素
└── convertTreeToXML() - 导出XML
```

### State Management

#### 主要状态结构
```typescript
interface FileUploadState {
  isDragOver: boolean;
  selectedFile: File | null;
  fileInfo: FileInfo | null;
  content: string;          // 美化后内容
  originalContent: string;  // 原始内容
}

interface ParserState {
  status: "idle" | "parsing" | "complete" | "error";
  progress: number;
  currentSection: string;
  elementsProcessed: number;
  errors: ParseError[];
}

interface UIState {
  displayMode: "beautified" | "tree" | "compressed" | "json";
  showLineNumbers: boolean;
  expandedNodes: Set<string>;
  selectedElement: XMLElement | null;
  breadcrumb: string[];
  searchQuery: string;
  inputMode: "file" | "text";
  textInput: string;
}
```

### Performance Considerations

#### 内存管理
- **分块处理**: 大文件分块解析，避免内存溢出
- **虚拟滚动**: 大量元素的虚拟化显示（未来优化）
- **懒加载**: 树节点按需加载子元素
- **缓存策略**: 解析结果缓存，避免重复计算

#### 解析性能
- **工作线程**: 大文件后台解析（未来优化）  
- **增量更新**: 搜索时增量过滤
- **索引构建**: 快速元素查找索引

#### UI性能
- **React.memo**: 组件渲染优化
- **useCallback**: 避免不必要的重渲染
- **ScrollArea**: 高效滚动组件
- **debounce**: 搜索输入防抖

### Libraries and Dependencies

#### 核心依赖
- **fast-xml-parser@5.2.3**: XML解析核心库
- **lucide-react**: 图标库
- **sonner**: Toast消息提示
- **@radix-ui**: 无障碍UI组件基础

#### shadcn/ui组件
- **ResizablePanel**: 可调整大小的面板
- **ScrollArea**: 滚动区域组件
- **Tabs**: 标签页组件
- **Breadcrumb**: 面包屑导航
- **Button, Input, Badge**: 基础交互组件

## API Reference

### Core Engine

#### FastXMLParser类
```typescript
class FastXMLParser {
  // 解析XML为树节点
  parseXMLToTree(xmlContent: string): ParsedXMLNode[]
  
  // 转换为XML元素格式（兼容性）
  convertToXMLElements(nodes: ParsedXMLNode[]): XMLElement[]
  
  // 树节点转换为XML
  convertTreeToXML(nodes: ParsedXMLNode[]): string
}
```

#### XMLStreamParser类（保留兼容性）
```typescript
class XMLStreamParser {
  // 搜索元素
  searchElements(query: string): void
  
  // 获取状态
  getState(): ParserState
}
```

### Types and Interfaces

#### 核心类型定义
```typescript
interface ParsedXMLNode {
  tagName: string;
  attributes: Record<string, string>;
  children: ParsedXMLNode[];
  textContent?: string;
  path: string;
  depth: number;
  uuid?: string;
}

interface XMLElement {
  id: string;
  name: string;
  type: XMLElementType;
  tagName: string;
  path: string;
  attributes: Record<string, string>;
  textContent?: string;
  children?: XMLElement[];
  parent?: string;
  loaded: boolean;
  hasChildren: boolean;
  metadata: ElementMetadata;
}
```

## Accessibility

### Keyboard Navigation

#### 键盘快捷键
- **Tab**: 逐个焦点导航
- **Enter/Space**: 激活按钮和链接
- **Escape**: 关闭工具（返回首页）
- **Ctrl+C**: 复制当前显示内容
- **Ctrl+S**: 下载当前格式文件

#### 焦点管理
- **Tab顺序**: 侧边栏触发器 → 工具内容 → 窗口控制
- **焦点指示**: 清晰的焦点环显示
- **焦点陷阱**: 模态对话框中的焦点管理

### Screen Reader Support

#### ARIA标签
- **aria-label**: 所有交互元素的描述性标签
- **aria-expanded**: 树节点展开状态
- **aria-selected**: 选中元素状态
- **role**: 适当的语义角色标识

#### 实时区域
- **aria-live**: 解析进度和状态更新
- **aria-atomic**: 完整消息播报
- **状态通知**: 成功/错误操作的无障碍反馈

### Visual Accessibility

#### 高对比度支持
- **主题颜色**: 仅使用CSS变量定义的主题颜色
- **对比度**: 确保WCAG 2.1 AA级对比度
- **色彩独立**: 不依赖颜色传达信息

#### 缩放支持
- **响应式字体**: 支持浏览器字体缩放
- **相对单位**: 使用rem/em而非px固定单位
- **布局适配**: 200%缩放下仍保持可用性

## Testing Strategy

### Unit Tests

#### 解析引擎测试
```typescript
describe('FastXMLParser', () => {
  test('should parse simple XML correctly', () => {
    // 基础XML解析测试
  });
  
  test('should handle attributes properly', () => {
    // 属性解析测试
  });
  
  test('should convert to XMLElement format', () => {
    // 格式转换测试
  });
});
```

#### 格式化函数测试
```typescript
describe('XML Formatting', () => {
  test('should beautify XML with proper indentation', () => {
    // 美化功能测试
  });
  
  test('should compress XML while preserving structure', () => {
    // 压缩功能测试
  });
});
```

### Integration Tests

#### 用户工作流测试
1. **文件上传流程**: 拖拽上传 → 自动解析 → 显示结果
2. **文本输入流程**: 粘贴内容 → 手动解析 → 格式切换
3. **导航流程**: 树状模式 → 元素选择 → 面包屑导航
4. **搜索流程**: 搜索输入 → 结果过滤 → 元素定位

#### 错误处理测试
- **无效XML**: 错误提示和恢复
- **大文件**: 性能和内存测试
- **网络错误**: 解析失败处理

### Visual Testing

#### 布局一致性
- **面板比例**: 调整大小后的布局稳定性
- **响应式**: 不同屏幕尺寸下的显示效果
- **主题适配**: 明/暗主题下的视觉一致性

## Future Enhancements

### 性能优化
- **Web Worker**: 大文件后台解析
- **虚拟滚动**: 大量元素的高效显示
- **增量解析**: 流式XML解析支持

### 功能扩展
- **XML验证**: XSD/DTD模式验证
- **XPath查询**: 支持XPath表达式搜索
- **XML编辑**: 内置XML编辑器功能
- **比较工具**: XML文件对比功能

### 用户体验
- **历史记录**: 解析历史和收藏功能
- **批量处理**: 多文件同时处理
- **导出选项**: 更多格式导出支持
- **插件系统**: 自定义解析器扩展

---

**版本**: 1.0.0  
**最后更新**: 2024年12月  
**下次审查**: 功能扩展时更新文档 