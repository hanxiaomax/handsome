# Unit Converter UI Architecture and Interaction Design Specification

## Overview

本文档详细说明单位转换器工具的用户界面架构、组件设计和交互模式。该工具采用模块化组件架构，提供直观的用户体验，支持多种输入模式和实时转换功能。

## UI Architecture Overview

### 1. 整体布局结构

单位转换器采用左右分栏布局：
- 左侧：类别浏览器（1/3宽度）
- 右侧：输入和输出面板（2/3宽度）

```
┌─────────────────────────────────────────────────────────────┐
│                    ToolLayout (Container)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┬─────────────────────────────────────┐ │
│  │                   │                                     │ │
│  │   Category        │        Input & Output Panel         │ │
│  │   Browser         │                                     │ │
│  │   (1/3 width)     │         (2/3 width)                 │ │
│  │                   │                                     │ │
│  │ ┌───────────────┐ │ ┌─────────────────────────────────┐ │ │
│  │ │ Category List │ │ │      Input Section              │ │ │
│  │ │               │ │ │ ┌─────────────────────────────┐ │ │ │
│  │ │ • Length      │ │ │ │  Value Input + Unit Select  │ │ │ │
│  │ │ • Weight      │ │ │ │  [123.45] [meter ▼] [C]    │ │ │ │
│  │ │ • Temperature │ │ │ └─────────────────────────────┘ │ │ │
│  │ │ • Speed       │ │ │                                 │ │ │
│  │ │ • Digital     │ │ │      Conversion Results         │ │ │
│  │ │ • Area        │ │ │ ┌─────────────────────────────┐ │ │ │
│  │ │ • Volume      │ │ │ │  Results Table              │ │ │ │
│  │ │ • Time        │ │ │ │ ┌─────┬─────────┬─────────┐ │ │ │ │
│  │ │ • Energy      │ │ │ │ │Unit │ Value   │ Actions │ │ │ │ │
│  │ │ • Power       │ │ │ │ ├─────┼─────────┼─────────┤ │ │ │ │
│  │ │ • Pressure    │ │ │ │ │ cm  │ 12345   │ [F][S]  │ │ │ │ │
│  │ │ • Angle       │ │ │ │ │ in  │ 486.22  │ [C][D]  │ │ │ │ │
│  │ │ • Frequency   │ │ │ │ │ ft  │ 40.518  │         │ │ │ │ │
│  │ │               │ │ │ │ └─────┴─────────┴─────────┘ │ │ │ │
│  │ └───────────────┘ │ │                             │ │ │ │
│  │                   │ │ ┌─────────────────────────────┐ │ │ │
│  │ [+ Custom Unit]   │ │ │      More Units             │ │ │ │
│  │                   │ │ │ ┌─────┬─────────┬─────────┐ │ │ │ │
│  └───────────────────┘ │ │ │ km  │ 0.123   │         │ │ │ │
│                        │ │ │ mi  │ 0.076   │         │ │ │ │
│                        │ │ │ yd  │ 134.95  │         │ │ │ │
│                        │ │ └─────┴─────────┴─────────┘ │ │ │ │
│                        │ └─────────────────────────────┘ │ │
│                        └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. 组件层次结构

```
UnitConverter (Main Component)
├── CategorySelector
│   ├── CategoryButton[]
│   └── CustomConversionDialog
├── OutputPanel
│   ├── InputSection
│   │   ├── Input (value)
│   │   ├── Select (unit)
│   │   └── Button (clear)
│   ├── ConversionTable
│   │   ├── TableHeader
│   │   ├── TableBody
│   │   │   └── ConversionRow[]
│   │   │       ├── UnitCell
│   │   │       ├── ValueCell
│   │   │       └── ActionButtons
│   │   │           ├── FocusButton
│   │   │           ├── SwapButton
│   │   │           ├── CopyButton
│   │   │           └── DeleteButton
│   │   └── MoreCard (expandable)
│   └── WelcomeMessage (when no category selected)
```

## Core Components Specification

### 1. CategorySelector Component

#### 功能职责
- 显示所有可用的单位类别
- 处理类别选择和切换
- 提供自定义单位创建入口

#### 实现细节
```typescript
interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onOpenCustomDialog: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  onOpenCustomDialog
}) => {
  const categories = [
    { id: "length", name: "Length", icon: Ruler },
    { id: "weight", name: "Weight", icon: Weight },
    { id: "temperature", name: "Temperature", icon: Thermometer },
    // ... 其他类别
  ];

  return (
    <div className="space-y-2">
      {categories.map(category => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onCategorySelect(category.id)}
        >
          <category.icon className="mr-2 h-4 w-4" />
          {category.name}
        </Button>
      ))}
      
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={onOpenCustomDialog}
      >
        <Plus className="mr-2 h-4 w-4" />
        Custom Unit
      </Button>
    </div>
  );
};
```

#### 交互行为
- **点击选择**: 切换到对应类别，触发转换计算
- **视觉反馈**: 选中状态高亮显示
- **自定义单位**: 打开创建对话框

### 2. OutputPanel Component

#### 功能职责
- 整合输入区域和结果显示
- 管理转换状态和数据流
- 协调各子组件间的交互

#### 核心状态管理
```typescript
interface OutputPanelState {
  inputValue: string;
  selectedUnit: string;
  conversionResults: ConversionResult[];
  focusedUnits: Set<string>;
  isLoading: boolean;
  error: string | null;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ category, converter }) => {
  const [state, setState] = useState<OutputPanelState>({
    inputValue: "",
    selectedUnit: "",
    conversionResults: [],
    focusedUnits: new Set(),
    isLoading: false,
    error: null
  });

  // 实时转换计算
  useEffect(() => {
    if (state.inputValue && state.selectedUnit && category) {
      performConversion();
    }
  }, [state.inputValue, state.selectedUnit, category]);

  const performConversion = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const value = parseFloat(state.inputValue);
      if (isNaN(value)) return;

      const results = converter.convertToAll(value, state.selectedUnit);
      setState(prev => ({ 
        ...prev, 
        conversionResults: sortResults(results, prev.focusedUnits),
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
    }
  }, [state.inputValue, state.selectedUnit, converter]);

  return (
    <div className="space-y-6">
      <InputSection 
        value={state.inputValue}
        selectedUnit={state.selectedUnit}
        units={getUnitsForCategory(category)}
        onValueChange={(value) => setState(prev => ({ ...prev, inputValue: value }))}
        onUnitChange={(unit) => setState(prev => ({ ...prev, selectedUnit: unit }))}
        onClear={() => setState(prev => ({ ...prev, inputValue: "" }))}
      />
      
      {state.conversionResults.length > 0 ? (
        <ConversionTable 
          results={state.conversionResults}
          focusedUnits={state.focusedUnits}
          onFocus={handleFocus}
          onSwap={handleSwap}
          onCopy={handleCopy}
          onDelete={handleDelete}
        />
      ) : (
        <WelcomeMessage category={category} />
      )}
    </div>
  );
};
```

### 3. InputSection Component

#### 功能职责
- 提供数值输入界面
- 单位选择下拉菜单
- 输入清除功能

#### 布局设计
```typescript
const InputSection: React.FC<InputSectionProps> = ({
  value,
  selectedUnit,
  units,
  onValueChange,
  onUnitChange,
  onClear
}) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="value-input">Enter Value</Label>
      <div className="relative flex">
        <Input
          id="value-input"
          type="number"
          placeholder="Enter a value to convert"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="pr-40" // 为按钮组留出空间
        />
        
        {/* 单位选择器 */}
        <Select value={selectedUnit} onValueChange={onUnitChange}>
          <SelectTrigger className="absolute right-8 top-0 h-full w-28 border-0 bg-transparent">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {units.map(unit => (
              <SelectItem key={unit.name} value={unit.name}>
                <span className="font-medium">{unit.symbol}</span>
                <span className="ml-2 text-muted-foreground">{unit.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 清除按钮 */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
```

#### 交互特性
- **实时验证**: 输入时进行数值格式验证
- **智能提示**: 单位选择器显示符号和全名
- **快速清除**: 有内容时显示清除按钮

### 4. ConversionTable Component

#### 功能职责
- 展示转换结果列表
- 提供操作按钮（聚焦、交换、复制、删除）
- 支持结果排序和过滤

#### 表格结构设计
```typescript
const ConversionTable: React.FC<ConversionTableProps> = ({
  results,
  focusedUnits,
  onFocus,
  onSwap,
  onCopy,
  onDelete
}) => {
  const displayResults = results.slice(0, 8); // 主要显示前8个
  const moreResults = results.slice(8);       // 其余放入More区域

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Unit</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayResults.map((result, index) => (
            <ConversionRow
              key={result.unit}
              result={result}
              isFocused={focusedUnits.has(result.unit)}
              onFocus={() => onFocus(result.unit)}
              onSwap={() => onSwap(result.unit)}
              onCopy={() => onCopy(result.value, result.unit)}
              onDelete={() => onDelete(result.unit)}
            />
          ))}
        </TableBody>
      </Table>

      {moreResults.length > 0 && (
        <MoreCard results={moreResults} />
      )}
    </div>
  );
};
```

### 5. ConversionRow Component

#### 功能职责
- 显示单个转换结果
- 提供行内操作按钮
- 支持聚焦状态视觉反馈

#### 实现细节
```typescript
const ConversionRow: React.FC<ConversionRowProps> = ({
  result,
  isFocused,
  onFocus,
  onSwap,
  onCopy,
  onDelete
}) => {
  const formatNumber = (value: number): { main: string; scientific?: string } => {
    const formatted = value.toLocaleString('en-US', {
      maximumFractionDigits: 10,
      minimumFractionDigits: 0
    });

    // 如果数字超过11位，显示科学计数法
    if (formatted.replace(/[,.]/g, '').length > 11) {
      return {
        main: formatted,
        scientific: value.toExponential(6)
      };
    }

    return { main: formatted };
  };

  const { main, scientific } = formatNumber(result.value);

  return (
    <TableRow 
      className={cn(
        "hover:bg-muted/50 transition-colors",
        isFocused && "bg-primary/5 border-l-2 border-l-primary"
      )}
    >
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-semibold">{result.symbol}</span>
          <span className="text-xs text-muted-foreground">{result.unit}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col">
          <span className="font-mono">{main}</span>
          {scientific && (
            <span className="text-xs text-muted-foreground font-mono">
              {scientific}
            </span>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <ActionButton
            icon={isFocused ? Star : StarOff}
            tooltip={isFocused ? "Unfocus" : "Focus"}
            onClick={onFocus}
            variant={isFocused ? "default" : "ghost"}
          />
          <ActionButton
            icon={ArrowUpDown}
            tooltip="Swap"
            onClick={onSwap}
          />
          <ActionButton
            icon={Copy}
            tooltip="Copy"
            onClick={onCopy}
          />
          <ActionButton
            icon={X}
            tooltip="Delete"
            onClick={onDelete}
            variant="ghost"
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
```

### 6. MoreCard Component

#### 功能职责
- 显示额外的转换结果
- 提供极简的表格样式
- 与主表格保持视觉一致性

#### 设计原则
```typescript
const MoreCard: React.FC<MoreCardProps> = ({ results }) => {
  return (
    <div className="border border-border/50 rounded-md mt-3">
      <div className="overflow-hidden">
        {results.map((result, index) => (
          <div
            key={result.unit}
            className={cn(
              "flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors",
              index !== results.length - 1 && "border-b border-border/30"
            )}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{result.symbol}</span>
              <span className="text-xs text-muted-foreground">{result.unit}</span>
            </div>
            
            <div className="text-right">
              <span className="font-mono text-sm">
                {result.value.toLocaleString('en-US', {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 0
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## State Management Architecture

### 1. 状态层次结构

```typescript
// 全局工具状态
interface UnitConverterState {
  selectedCategory: string;
  customUnits: CustomUnit[];
  preferences: UserPreferences;
}

// 输出面板状态
interface OutputPanelState {
  inputValue: string;
  selectedUnit: string;
  conversionResults: ConversionResult[];
  focusedUnits: Set<string>;
  isLoading: boolean;
  error: string | null;
}

// 自定义单位对话框状态
interface CustomDialogState {
  isOpen: boolean;
  mode: 'selection' | 'basic' | 'javascript' | 'ai';
  formData: CustomUnitFormData;
}
```

### 2. 状态更新流程

```
User Input → State Update → Conversion Calculation → UI Update
     ↓              ↓                ↓                ↓
[输入数值]    [inputValue]    [converter.convertToAll]  [表格更新]
[选择单位]    [selectedUnit]   [路径查找 + 计算]        [结果显示]
[切换类别]    [selectedCategory] [获取新单位列表]      [界面重置]
```

### 3. 数据流管理

```typescript
// 向上数据流：子组件 → 父组件
const handleValueChange = useCallback((value: string) => {
  setInputValue(value);
  if (value && selectedUnit) {
    performConversion(value, selectedUnit);
  }
}, [selectedUnit]);

// 向下数据流：父组件 → 子组件
<ConversionTable
  results={sortedResults}
  focusedUnits={focusedUnits}
  onFocus={handleFocus}
  onSwap={handleSwap}
/>
```

## Interaction Design Patterns

### 1. 实时转换模式

#### 触发条件
- 输入值变化
- 单位选择变化
- 类别切换

#### 防抖处理
```typescript
const debouncedConversion = useMemo(
  () => debounce((value: string, unit: string) => {
    if (value && unit) {
      performConversion(value, unit);
    }
  }, 300),
  []
);

useEffect(() => {
  debouncedConversion(inputValue, selectedUnit);
}, [inputValue, selectedUnit, debouncedConversion]);
```

### 2. 聚焦单位管理

#### 功能描述
- 用户可以标记重要单位
- 聚焦单位显示在结果顶部
- 提供视觉高亮效果

#### 实现逻辑
```typescript
const handleFocus = useCallback((unit: string) => {
  setFocusedUnits(prev => {
    const newSet = new Set(prev);
    if (newSet.has(unit)) {
      newSet.delete(unit);
      toast.success(`${unit} unfocused`);
    } else {
      newSet.add(unit);
      toast.success(`${unit} focused`);
    }
    return newSet;
  });
}, []);

const sortResults = useCallback((results: ConversionResult[], focused: Set<string>) => {
  return results.sort((a, b) => {
    const aFocused = focused.has(a.unit);
    const bFocused = focused.has(b.unit);
    
    if (aFocused && !bFocused) return -1;
    if (!aFocused && bFocused) return 1;
    return 0;
  });
}, []);
```

### 3. 单位交换功能

#### 用户体验
- 一键将结果单位设为输入单位
- 自动保持当前输入值
- 触发新的转换计算

#### 实现细节
```typescript
const handleSwap = useCallback((targetUnit: string) => {
  if (selectedUnit !== targetUnit) {
    setSelectedUnit(targetUnit);
    toast.success(`Swapped to ${targetUnit}`);
    
    // 触发新的转换计算
    if (inputValue) {
      performConversion(inputValue, targetUnit);
    }
  }
}, [selectedUnit, inputValue]);
```

### 4. 复制功能设计

#### 复制内容
- 复制原始格式化数值
- 不包含科学计数法
- 提供成功反馈

```typescript
const handleCopy = useCallback(async (value: number, unit: string) => {
  const formattedValue = value.toLocaleString('en-US', {
    maximumFractionDigits: 10,
    minimumFractionDigits: 0
  });
  
  try {
    await navigator.clipboard.writeText(formattedValue);
    toast.success(`Copied ${formattedValue}`);
  } catch (error) {
    toast.error('Failed to copy');
  }
}, []);
```

## Responsive Design Strategy

### 1. 布局断点

```css
/* 移动设备 (< 768px) */
@media (max-width: 767px) {
  .unit-converter-layout {
    flex-direction: column;
  }
  
  .category-selector {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .output-panel {
    width: 100%;
  }
}

/* 平板设备 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .category-selector {
    width: 40%;
  }
  
  .output-panel {
    width: 60%;
  }
}

/* 桌面设备 (> 1024px) */
@media (min-width: 1024px) {
  .category-selector {
    width: 33.333%;
  }
  
  .output-panel {
    width: 66.667%;
  }
}
```

### 2. 组件适配策略

#### 表格响应式
```typescript
const ConversionTable: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  if (isMobile) {
    return <MobileConversionList results={results} />;
  }
  
  return <DesktopConversionTable results={results} />;
};
```

#### 输入区域适配
```typescript
const InputSection: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
      <Input className="flex-1" />
      <Select>
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
      </Select>
    </div>
  );
};
```

## Accessibility Features

### 1. 键盘导航支持

#### Tab顺序设计
1. 类别选择器
2. 数值输入框
3. 单位选择器
4. 清除按钮
5. 结果表格行
6. 操作按钮

#### 快捷键支持
```typescript
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'c':
            if (selectedResult) {
              handleCopy(selectedResult.value, selectedResult.unit);
              event.preventDefault();
            }
            break;
          case 'Enter':
            if (focusedInput) {
              performConversion();
              event.preventDefault();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedResult, focusedInput]);
};
```

### 2. 屏幕阅读器支持

#### ARIA标签
```typescript
<Table role="table" aria-label="Conversion results">
  <TableHeader>
    <TableRow role="row">
      <TableHead role="columnheader" aria-sort="none">Unit</TableHead>
      <TableHead role="columnheader">Value</TableHead>
      <TableHead role="columnheader">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {results.map(result => (
      <TableRow 
        key={result.unit}
        role="row"
        aria-label={`${result.value} ${result.unit}`}
      >
        <TableCell role="cell">{result.symbol}</TableCell>
        <TableCell role="cell">{result.value}</TableCell>
        <TableCell role="cell">
          <Button 
            aria-label={`Copy ${result.value} ${result.unit}`}
            onClick={() => handleCopy(result.value, result.unit)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 3. 视觉辅助功能

#### 高对比度支持
```css
@media (prefers-contrast: high) {
  .conversion-row {
    border: 2px solid var(--border);
  }
  
  .focused-unit {
    background-color: var(--primary);
    color: var(--primary-foreground);
  }
}
```

#### 动画减少支持
```css
@media (prefers-reduced-motion: reduce) {
  .conversion-row {
    transition: none;
  }
  
  .action-button {
    transition: none;
  }
}
```

## Performance Optimization

### 1. 组件优化策略

#### React.memo使用
```typescript
const ConversionRow = React.memo<ConversionRowProps>(({ result, isFocused, ...actions }) => {
  return (
    <TableRow className={cn(isFocused && "bg-primary/5")}>
      {/* 组件内容 */}
    </TableRow>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.result.value === nextProps.result.value &&
    prevProps.isFocused === nextProps.isFocused
  );
});
```

#### useCallback优化
```typescript
const handleCopy = useCallback(async (value: number, unit: string) => {
  const formattedValue = formatNumber(value);
  await copyToClipboard(formattedValue);
  showToast(`Copied ${formattedValue}`);
}, []); // 无依赖，避免重新创建
```

### 2. 渲染优化

#### 虚拟滚动（大量结果时）
```typescript
const VirtualizedResults: React.FC<{ results: ConversionResult[] }> = ({ results }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  const visibleResults = useMemo(() => 
    results.slice(visibleRange.start, visibleRange.end),
    [results, visibleRange]
  );
  
  return (
    <div className="virtual-container" onScroll={handleScroll}>
      {visibleResults.map(result => (
        <ConversionRow key={result.unit} result={result} />
      ))}
    </div>
  );
};
```

### 3. 数据缓存策略

#### 转换结果缓存
```typescript
const conversionCache = useMemo(() => new Map<string, ConversionResult[]>(), []);

const getCachedResults = useCallback((value: number, unit: string, category: string) => {
  const cacheKey = `${value}-${unit}-${category}`;
  
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey)!;
  }
  
  const results = converter.convertToAll(value, unit);
  conversionCache.set(cacheKey, results);
  
  return results;
}, [converter]);
```

## Conclusion

单位转换器的UI架构采用模块化设计，具有以下特点：

1. **组件化架构**: 清晰的组件层次和职责分离
2. **响应式设计**: 适配多种设备和屏幕尺寸
3. **交互友好**: 实时转换、智能排序、便捷操作
4. **无障碍访问**: 完整的键盘导航和屏幕阅读器支持
5. **性能优化**: 组件缓存、虚拟滚动、防抖处理

该设计为用户提供了直观、高效的单位转换体验，支持复杂的转换需求和个性化操作偏好。 