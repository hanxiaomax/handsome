# ARXML Parser - API Reference

## Overview

本文档提供ARXML Parser工具的详细API参考，包括所有公共接口、类型定义和使用示例。

## Core Classes

### FastXMLParser

主要的XML解析引擎，使用fast-xml-parser库实现高效解析。

#### Constructor
```typescript
constructor()
```

创建新的FastXMLParser实例，自动配置最优解析选项。

#### Methods

##### parseXMLToTree()
```typescript
parseXMLToTree(xmlContent: string): ParsedXMLNode[]
```

将XML字符串解析为树状节点结构。

**参数**:
- `xmlContent` (string): 待解析的XML内容

**返回值**: `ParsedXMLNode[]` - 解析后的树节点数组

**示例**:
```typescript
const parser = new FastXMLParser();
const nodes = parser.parseXMLToTree('<root><item>value</item></root>');
```

**错误处理**:
- 抛出 `Error` 如果XML格式无效
- 抛出 `Error` 如果解析过程中出现异常

##### convertToXMLElements()
```typescript
convertToXMLElements(nodes: ParsedXMLNode[]): XMLElement[]
```

将解析树节点转换为XMLElement格式，用于向后兼容。

**参数**:
- `nodes` (ParsedXMLNode[]): 解析后的树节点

**返回值**: `XMLElement[]` - 转换后的XML元素数组

##### convertTreeToXML()
```typescript
convertTreeToXML(nodes: ParsedXMLNode[]): string
```

将树节点重新转换为XML字符串。

**参数**:
- `nodes` (ParsedXMLNode[]): 树节点数组

**返回值**: `string` - 格式化的XML字符串

### XMLStreamParser

保留的解析器类，提供兼容性支持和搜索功能。

#### Constructor
```typescript
constructor()
```

#### Methods

##### searchElements()
```typescript
searchElements(query: string): void
```

在解析的元素中搜索匹配项。

**参数**:
- `query` (string): 搜索查询字符串

##### getState()
```typescript
getState(): ParserState
```

获取当前解析器状态。

**返回值**: `ParserState` - 当前状态对象

## Type Definitions

### Core Types

#### ParsedXMLNode
```typescript
interface ParsedXMLNode {
  tagName: string;        // XML标签名
  attributes: Record<string, string>; // 属性键值对
  children: ParsedXMLNode[];          // 子节点数组
  textContent?: string;               // 文本内容
  path: string;                       // 节点路径
  depth: number;                      // 节点深度
  uuid?: string;                      // 唯一标识符
}
```

#### XMLElement
```typescript
interface XMLElement {
  id: string;                    // 唯一标识符
  name: string;                  // 元素名称
  type: XMLElementType;          // 元素类型
  tagName: string;              // XML标签名
  path: string;                 // 元素路径
  attributes: Record<string, string>; // 属性
  textContent?: string;         // 文本内容
  children?: XMLElement[];      // 子元素
  parent?: string;              // 父元素ID
  loaded: boolean;              // 是否已加载
  hasChildren: boolean;         // 是否有子元素
  metadata: ElementMetadata;    // 元数据
}
```

#### XMLElementType
```typescript
type XMLElementType =
  | "ELEMENT"                // 普通元素
  | "TEXT"                   // 文本节点
  | "COMMENT"                // 注释
  | "CDATA"                  // CDATA节点
  | "PROCESSING_INSTRUCTION" // 处理指令
  | "DOCUMENT"               // 文档节点
  | "DOCTYPE"                // DOCTYPE声明
  | "UNKNOWN";               // 未知类型
```

### State Management Types

#### ParserState
```typescript
interface ParserState {
  status: "idle" | "parsing" | "loading" | "complete" | "error";
  progress: number;         // 解析进度 (0-100)
  currentSection: string;   // 当前处理阶段
  elementsProcessed: number; // 已处理元素数
  memoryUsage: number;      // 内存使用量
  errors: ParseError[];     // 错误列表
  warnings: ParseWarning[]; // 警告列表
}
```

#### ParseError
```typescript
interface ParseError {
  id: string;              // 错误ID
  type: "syntax" | "schema" | "reference" | "memory";
  message: string;         // 错误消息
  line?: number;          // 错误行号
  column?: number;        // 错误列号
  path?: string;          // 错误路径
  severity: "error" | "warning"; // 严重程度
}
```

#### ElementMetadata
```typescript
interface ElementMetadata {
  lineNumber: number;      // 行号
  byteOffset: number;      // 字节偏移
  size: number;           // 元素大小
  namespace: string;       // 命名空间
  schema: string;         // 模式
  description?: string;    // 描述
  tags?: string[];        // 标签
  depth: number;          // 深度
}
```

### UI State Types

#### FileUploadState
```typescript
interface FileUploadState {
  isDragOver: boolean;      // 是否正在拖拽
  selectedFile: File | null; // 选中的文件
  fileInfo: {              // 文件信息
    name: string;
    size: number;
    type: string;
  } | null;
  content: string;         // 美化后内容
  originalContent: string; // 原始内容
}
```

#### DisplayMode
```typescript
type DisplayMode = "beautified" | "tree" | "compressed" | "json";
```

### Search and Filter Types

#### SearchResult
```typescript
interface SearchResult {
  element: XMLElement;     // 匹配的元素
  score: number;          // 匹配分数
  matches: SearchMatch[]; // 匹配详情
}
```

#### SearchMatch
```typescript
interface SearchMatch {
  field: "name" | "type" | "path" | "attribute"; // 匹配字段
  value: string;          // 匹配值
  indices: [number, number][]; // 匹配位置
}
```

## Utility Functions

### XML Formatting

#### formatXMLManually()
```typescript
formatXMLManually(content: string): string
```

手动格式化XML内容，提供更好的缩进控制。

**参数**:
- `content` (string): 原始XML内容

**返回值**: `string` - 格式化后的XML

**特性**:
- 2空格缩进
- 保持文本内容完整性
- 正确处理自闭合标签
- 支持处理指令和注释

#### getBeautifiedXML()
```typescript
getBeautifiedXML(content: string): string
```

获取美化的XML内容。

#### getCompressedXML()
```typescript
getCompressedXML(content: string): string
```

获取压缩的XML内容，保持可读性。

**特性**:
- 移除冗余空白
- 120字符自动换行
- 保持XML结构完整

#### convertToJSON()
```typescript
convertToJSON(content: string): string
```

将XML转换为JSON格式。

**转换规则**:
- 属性使用@前缀
- 文本内容存储在text字段
- 重复元素转换为数组
- 2空格缩进格式化

## Event Handlers

### File Operations

#### handleFileSelect()
```typescript
handleFileSelect(file: File): Promise<void>
```

处理文件选择事件。

**参数**:
- `file` (File): 选择的文件对象

**流程**:
1. 验证文件格式
2. 读取文件内容
3. 更新状态
4. 触发自动解析（如启用）

#### handleFileDrop()
```typescript
handleFileDrop(e: React.DragEvent): void
```

处理文件拖拽放置事件。

### Parsing Operations

#### handleStartParsing()
```typescript
handleStartParsing(file?: File): Promise<void>
```

开始解析操作。

**参数**:
- `file` (File, optional): 可选的文件对象

**流程**:
1. 确定内容源（文件或文本）
2. 验证内容格式
3. 执行解析操作
4. 更新UI状态
5. 处理错误情况

### Navigation Operations

#### handleElementSelect()
```typescript
handleElementSelect(element: XMLElement): void
```

处理元素选择事件。

#### handleNodeToggle()
```typescript
handleNodeToggle(elementId: string): void
```

处理节点展开/折叠切换。

### Copy and Download Operations

#### handleCopy()
```typescript
handleCopy(): Promise<void>
```

处理复制操作，支持多种格式。

**支持格式**:
- beautified: 美化XML
- compressed: 压缩XML  
- json: JSON格式
- tree: 树结构JSON

**兼容性**:
- 现代浏览器: navigator.clipboard API
- 旧浏览器: document.execCommand fallback

#### handleDownload()
```typescript
handleDownload(): void
```

处理下载操作。

**文件命名规则**:
- beautified: `{filename}_beautified.xml`
- compressed: `{filename}_compressed.xml`
- json: `{filename}.json`
- tree: `{filename}_tree.json`

## Configuration

### Parser Configuration
```typescript
const parserOptions = {
  ignoreAttributes: false,      // 不忽略属性
  attributeNamePrefix: "@",     // 属性前缀
  textNodeName: "#text",        // 文本节点名
  parseAttributeValue: true,    // 解析属性值
  trimValues: true,            // 修剪值
  parseTrueNumberOnly: false,  // 不仅解析真正的数字
  arrayMode: false,            // 非数组模式
  alwaysCreateTextNode: false, // 不总是创建文本节点
  isArray: () => false,        // 数组判断函数
  processEntities: true,       // 处理实体
  htmlEntities: false,         // 不处理HTML实体
  ignoreNameSpace: false,      // 不忽略命名空间
  allowBooleanAttributes: false, // 不允许布尔属性
  parseNodeValue: true,        // 解析节点值
  parseTagValue: true,         // 解析标签值
  stopNodes: [],               // 停止节点
  cdataPropName: "__cdata"     // CDATA属性名
}
```

### Performance Limits
```typescript
const performanceLimits = {
  maxFileSize: 100 * 1024 * 1024,  // 100MB
  maxElements: 100000,              // 最大元素数
  memoryLimit: 500 * 1024 * 1024,  // 500MB内存限制
  autoParseThreshold: 10 * 1024 * 1024, // 10MB自动解析阈值
  maxLineLength: 120,               // 最大行长度
  indentSize: 2                     // 缩进大小
}
```

## Error Handling

### Common Errors

#### ParseError
```typescript
try {
  const nodes = parser.parseXMLToTree(xmlContent);
} catch (error) {
  if (error.message.includes('Invalid XML')) {
    // 处理XML格式错误
  } else if (error.message.includes('Memory limit')) {
    // 处理内存限制错误
  }
}
```

#### Error Categories
1. **Syntax Error**: XML语法错误
2. **Schema Error**: 模式验证错误
3. **Reference Error**: 引用解析错误
4. **Memory Error**: 内存不足错误

### Error Recovery Strategies
1. **Graceful Degradation**: 部分解析失败时显示可用部分
2. **User Feedback**: 提供清晰的错误消息和解决建议
3. **Retry Mechanism**: 对于临时错误提供重试选项
4. **Validation**: 预验证输入以避免解析错误

## Performance Considerations

### Memory Management
- 大文件分块处理
- 及时清理不需要的对象
- 使用WeakMap缓存引用
- 监控内存使用情况

### Parsing Optimization
- 流式解析大文件
- 懒加载树节点
- 增量搜索和过滤
- 后台线程处理

### UI Performance
- 虚拟滚动大列表
- React.memo优化组件
- useCallback缓存函数
- 防抖搜索输入

---

**版本**: 1.0.0  
**最后更新**: 2024年12月  
**相关文档**: [设计规范](./specification.md) | [用户指南](./user-guide.md) 