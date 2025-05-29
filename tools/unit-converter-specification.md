# Unit Converter - Design Specification

## Overview

A comprehensive unit conversion tool designed for students, engineers, scientists, and professionals. Features real-time conversion across multiple unit categories with educational information about conversion rules and relationships.

## Design Principles

### Minimal Design Philosophy
- **Clean Interface**: Focus on input, conversion, and results
- **Essential Information**: Show only relevant units and conversions
- **Instant Feedback**: Real-time conversion as user types
- **Educational Value**: Provide context and explanations for conversions

### User Experience Goals
- **One Input, Multiple Outputs**: Enter once, see all relevant conversions
- **Quick Category Switching**: Fast navigation between unit types
- **Visual Clarity**: Clear distinction between input and output values
- **Learning Support**: Understand the "why" behind conversions

## Core Features

### Unit Categories (Subject-Based Grouping)
- **📏 Length & Distance**: Metric, Imperial, Scientific, Nautical
- **⚖️ Weight & Mass**: Mass units, Weight units, Precious metals
- **🌡️ Temperature**: Celsius, Fahrenheit, Kelvin, Rankine, Réaumur
- **📐 Area**: Square meters, Imperial area, Land measurement
- **🫙 Volume**: Liquid volume, Dry volume, Cooking measurements
- **⏰ Time**: Seconds to years, Scientific time units
- **🚗 Speed**: Linear speed, Angular velocity, Scientific
- **🔧 Pressure**: Atmospheric, Scientific, Industrial
- **⚡ Energy**: Mechanical, Electrical, Heat, Food calories
- **💪 Power**: Mechanical, Electrical, Engine power
- **💾 Data Storage**: Bytes, Bits, Modern storage units
- **📐 Angle**: Degrees, Radians, Gradians, Military
- **📻 Frequency**: Hertz variations, Wavelength
- **🔌 Electrical**: Voltage, Current, Resistance, Capacitance

### Real-Time Conversion Engine
- **Instant Updates**: Convert as user types (debounced)
- **High Precision**: Support for scientific notation
- **Smart Formatting**: Auto-format large/small numbers
- **Bidirectional**: Any unit can be input, others update

### Educational Information
- **Conversion Formula**: Show the mathematical relationship
- **Context Information**: When and why to use each unit
- **Historical Notes**: Origin and standardization of units
- **Precision Notes**: Accuracy limitations and rounding

### Quick Features
- **Favorites**: Star frequently used conversions
- **History**: Recent conversion history
- **Copy Values**: One-click copy of any result
- **Reset**: Quick clear of all values

## UI Layout Design

### Main Interface (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│ Unit Converter                                    [⭐] [📋] │
├─────────────────────────────────────────────────────────────┤
│ [📏 Length] [⚖️ Weight] [🌡️ Temp] [📐 Area] [🫙 Volume]      │
│ [⏰ Time] [🚗 Speed] [🔧 Pressure] [⚡ Energy] [💪 Power]    │
│ [💾 Data] [📐 Angle] [📻 Frequency] [🔌 Electrical]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📏 Length & Distance Conversion                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Input: [1.5] [Meters ▼]                               │ │
│ │ Auto-detect: ✓ Decimal separator                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Common Units ────────────────────────────────────────┐ │
│ │ 📏 Centimeters      150.00 cm                         │ │
│ │ 📏 Millimeters      1,500.00 mm                       │ │
│ │ 📏 Inches           59.055 in                         │ │
│ │ 📏 Feet             4.921 ft                          │ │
│ │ 📏 Yards            1.640 yd                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Scientific Units ────────────────────────────────────┐ │
│ │ 🔬 Micrometers      1,500,000.00 μm                   │ │
│ │ 🔬 Nanometers       1.50×10⁹ nm                       │ │
│ │ 🔬 Angstroms        1.50×10¹⁰ Å                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Large Distances ─────────────────────────────────────┐ │
│ │ 🌍 Kilometers       0.0015 km                         │ │
│ │ 🌍 Miles            0.000932 mi                       │ │
│ │ 🌍 Nautical Miles   0.000810 nmi                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ╭─ Conversion Info ──────────────────────────────────────╮ │
│ │ Formula: 1 meter = 100 centimeters                    │ │
│ │ Context: Meter is the SI base unit of length          │ │
│ │ Precision: Results rounded to 6 significant figures   │ │
│ ╰────────────────────────────────────────────────────────╯ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Interface
```
┌─────────────────────────────────────┐
│ Unit Converter              [☰]     │
├─────────────────────────────────────┤
│ 📏 Length & Distance               │
├─────────────────────────────────────┤
│ Input: [1.5] [Meters ▼]            │
├─────────────────────────────────────┤
│                                     │
│ 📏 Centimeters     150.00 cm  [📋] │
│ 📏 Millimeters   1,500.00 mm  [📋] │
│ 📏 Inches           59.055 in [📋] │
│ 📏 Feet             4.921 ft  [📋] │
│                                     │
│ [Show All Units] [Conversion Info]  │
└─────────────────────────────────────┘
```

## Technical Implementation

### Core Data Structures

```typescript
interface UnitCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  groups: UnitGroup[];
}

interface UnitGroup {
  id: string;
  name: string;
  units: Unit[];
  isCollapsed?: boolean;
}

interface Unit {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  baseRatio: number;          // Conversion ratio to base unit
  baseOffset?: number;        // For temperature conversions
  isBaseUnit: boolean;
  precision: number;          // Decimal places to show
  scientificNotation?: boolean; // Use sci notation for large/small numbers
  description: string;
  context: string;           // When/why to use this unit
}

interface ConversionResult {
  unit: Unit;
  value: number;
  formattedValue: string;
  scientificValue?: string;
  isApproximate: boolean;
}

interface ConversionInfo {
  formula: string;
  explanation: string;
  precision: string;
  historicalNote?: string;
}

interface ConverterState {
  selectedCategory: string;
  inputValue: number;
  inputUnit: string;
  results: ConversionResult[];
  conversionInfo: ConversionInfo;
  favorites: string[];        // Unit IDs
  history: ConversionHistory[];
  showAllUnits: boolean;
  compactMode: boolean;
}

interface ConversionHistory {
  id: string;
  timestamp: Date;
  categoryId: string;
  inputValue: number;
  inputUnit: string;
  outputUnit: string;
  outputValue: number;
}
```

### Unit Categories Configuration

```typescript
const unitCategories: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length & Distance',
    icon: '📏',
    description: 'Linear measurements from nanometers to light-years',
    groups: [
      {
        id: 'common',
        name: 'Common Units',
        units: [
          {
            id: 'meter',
            name: 'Meter',
            symbol: 'm',
            baseRatio: 1,
            isBaseUnit: true,
            precision: 6,
            description: 'SI base unit of length',
            context: 'Standard metric measurement for everyday distances'
          },
          {
            id: 'centimeter',
            name: 'Centimeter',
            symbol: 'cm',
            baseRatio: 0.01,
            isBaseUnit: false,
            precision: 2,
            description: '1/100 of a meter',
            context: 'Ideal for measuring small objects and body measurements'
          },
          {
            id: 'inch',
            name: 'Inch',
            symbol: 'in',
            baseRatio: 0.0254,
            isBaseUnit: false,
            precision: 3,
            description: 'Imperial unit, 1/12 of a foot',
            context: 'Common in US for construction and manufacturing'
          }
          // ... more units
        ]
      },
      {
        id: 'scientific',
        name: 'Scientific Units',
        units: [
          {
            id: 'nanometer',
            name: 'Nanometer',
            symbol: 'nm',
            baseRatio: 1e-9,
            isBaseUnit: false,
            precision: 2,
            scientificNotation: true,
            description: 'One billionth of a meter',
            context: 'Used in nanotechnology and atomic measurements'
          }
          // ... more scientific units
        ]
      }
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: '🌡️',
    description: 'Temperature scales and thermal measurements',
    groups: [
      {
        id: 'common',
        name: 'Common Scales',
        units: [
          {
            id: 'celsius',
            name: 'Celsius',
            symbol: '°C',
            baseRatio: 1,
            baseOffset: 273.15,
            isBaseUnit: false,
            precision: 2,
            description: 'Centigrade scale, water freezes at 0°C',
            context: 'Standard temperature scale in most countries'
          },
          {
            id: 'fahrenheit',
            name: 'Fahrenheit',
            symbol: '°F',
            baseRatio: 5/9,
            baseOffset: 459.67,
            isBaseUnit: false,
            precision: 2,
            description: 'US customary scale, water freezes at 32°F',
            context: 'Primary scale used in the United States'
          },
          {
            id: 'kelvin',
            name: 'Kelvin',
            symbol: 'K',
            baseRatio: 1,
            baseOffset: 0,
            isBaseUnit: true,
            precision: 2,
            description: 'Absolute temperature scale starting at absolute zero',
            context: 'SI base unit, used in scientific calculations'
          }
        ]
      }
    ]
  }
  // ... other categories
];
```

### Conversion Engine

```typescript
class UnitConverter {
  private categories: Map<string, UnitCategory> = new Map();
  private units: Map<string, Unit> = new Map();
  
  constructor(categories: UnitCategory[]) {
    this.loadCategories(categories);
  }
  
  // Convert between any two units in the same category
  convert(value: number, fromUnitId: string, toUnitId: string): number {
    const fromUnit = this.units.get(fromUnitId);
    const toUnit = this.units.get(toUnitId);
    
    if (!fromUnit || !toUnit) {
      throw new Error('Invalid unit IDs');
    }
    
    // Special handling for temperature
    if (this.isTemperatureUnit(fromUnit)) {
      return this.convertTemperature(value, fromUnit, toUnit);
    }
    
    // Standard linear conversion
    const baseValue = value * fromUnit.baseRatio;
    return baseValue / toUnit.baseRatio;
  }
  
  // Convert temperature with offset handling
  private convertTemperature(value: number, fromUnit: Unit, toUnit: Unit): number {
    // Convert to Kelvin first (base unit)
    let kelvin: number;
    
    if (fromUnit.id === 'celsius') {
      kelvin = value + 273.15;
    } else if (fromUnit.id === 'fahrenheit') {
      kelvin = (value + 459.67) * (5/9);
    } else if (fromUnit.id === 'kelvin') {
      kelvin = value;
    } else {
      throw new Error('Unsupported temperature unit');
    }
    
    // Convert from Kelvin to target unit
    if (toUnit.id === 'celsius') {
      return kelvin - 273.15;
    } else if (toUnit.id === 'fahrenheit') {
      return kelvin * (9/5) - 459.67;
    } else if (toUnit.id === 'kelvin') {
      return kelvin;
    } else {
      throw new Error('Unsupported temperature unit');
    }
  }
  
  // Convert input to all units in category
  convertToAll(value: number, inputUnitId: string, categoryId: string): ConversionResult[] {
    const category = this.categories.get(categoryId);
    if (!category) return [];
    
    const results: ConversionResult[] = [];
    
    for (const group of category.groups) {
      for (const unit of group.units) {
        if (unit.id === inputUnitId) continue;
        
        try {
          const convertedValue = this.convert(value, inputUnitId, unit.id);
          const formattedValue = this.formatValue(convertedValue, unit);
          
          results.push({
            unit,
            value: convertedValue,
            formattedValue,
            scientificValue: unit.scientificNotation ? 
              this.toScientificNotation(convertedValue) : undefined,
            isApproximate: this.isApproximateConversion(inputUnitId, unit.id)
          });
        } catch (error) {
          console.warn(`Conversion failed for ${unit.id}:`, error);
        }
      }
    }
    
    return results.sort((a, b) => this.sortUnits(a.unit, b.unit));
  }
  
  // Format value based on unit specifications
  private formatValue(value: number, unit: Unit): string {
    const absValue = Math.abs(value);
    
    // Use scientific notation for very large or small numbers
    if (unit.scientificNotation || absValue >= 1e6 || (absValue < 0.001 && absValue > 0)) {
      return value.toExponential(unit.precision);
    }
    
    // Use regular formatting with appropriate precision
    if (absValue >= 1000) {
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: unit.precision
      });
    }
    
    return value.toFixed(unit.precision);
  }
  
  private toScientificNotation(value: number): string {
    return value.toExponential(2);
  }
  
  private isApproximateConversion(fromUnitId: string, toUnitId: string): boolean {
    // Some conversions are approximate (e.g., metric to imperial)
    const approximateConversions = [
      ['meter', 'inch'], ['meter', 'foot'], ['meter', 'yard'],
      ['kilogram', 'pound'], ['liter', 'gallon']
    ];
    
    return approximateConversions.some(([a, b]) => 
      (fromUnitId === a && toUnitId === b) || 
      (fromUnitId === b && toUnitId === a)
    );
  }
  
  // Generate conversion information
  getConversionInfo(inputUnitId: string, outputUnitId: string): ConversionInfo {
    const inputUnit = this.units.get(inputUnitId);
    const outputUnit = this.units.get(outputUnitId);
    
    if (!inputUnit || !outputUnit) {
      return {
        formula: 'Invalid units',
        explanation: 'Unable to generate conversion information',
        precision: 'N/A'
      };
    }
    
    const ratio = outputUnit.baseRatio / inputUnit.baseRatio;
    
    return {
      formula: `1 ${inputUnit.symbol} = ${ratio} ${outputUnit.symbol}`,
      explanation: `${inputUnit.description} converted to ${outputUnit.description}`,
      precision: `Results shown to ${outputUnit.precision} decimal places`,
      historicalNote: this.getHistoricalNote(inputUnit, outputUnit)
    };
  }
  
  private getHistoricalNote(inputUnit: Unit, outputUnit: Unit): string | undefined {
    // Add interesting historical context for certain conversions
    if (inputUnit.id === 'meter' && outputUnit.id === 'foot') {
      return 'The meter was originally defined as 1/10,000,000 of the distance from the equator to the North Pole';
    }
    return undefined;
  }
}
```

## Component Architecture

### Main Unit Converter Component
```typescript
// tools/unit-converter/ui.tsx
export default function UnitConverter() {
  const [state, setState] = useState<ConverterState>(initialState);
  const converter = useRef(new UnitConverter(unitCategories));
  
  // Real-time conversion with debouncing
  const debouncedConvert = useMemo(
    () => debounce((value: number, unitId: string, categoryId: string) => {
      if (value && unitId && categoryId) {
        const results = converter.current.convertToAll(value, unitId, categoryId);
        const conversionInfo = converter.current.getConversionInfo(
          unitId, 
          results[0]?.unit.id || ''
        );
        
        setState(s => ({ ...s, results, conversionInfo }));
      }
    }, 150),
    []
  );
  
  // Handle input changes
  const handleInputChange = useCallback((value: number) => {
    setState(s => ({ ...s, inputValue: value }));
    debouncedConvert(value, state.inputUnit, state.selectedCategory);
  }, [state.inputUnit, state.selectedCategory, debouncedConvert]);
  
  return (
    <div className="w-full p-6 space-y-6 mt-5">
      {/* Category Selection */}
      <CategorySelector 
        categories={unitCategories}
        selected={state.selectedCategory}
        onSelect={handleCategoryChange}
      />
      
      {/* Input Section */}
      <InputSection
        value={state.inputValue}
        unit={state.inputUnit}
        category={state.selectedCategory}
        onChange={handleInputChange}
        onUnitChange={handleInputUnitChange}
      />
      
      {/* Results Grid */}
      <ResultsGrid
        results={state.results}
        showAllUnits={state.showAllUnits}
        favorites={state.favorites}
        onToggleFavorite={handleToggleFavorite}
        onCopyValue={handleCopyValue}
      />
      
      {/* Conversion Information */}
      <ConversionInfo info={state.conversionInfo} />
      
      {/* History Panel */}
      <HistoryPanel
        history={state.history}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
```

### Custom Components

#### Category Selector
```typescript
interface CategorySelectorProps {
  categories: UnitCategory[];
  selected: string;
  onSelect: (categoryId: string) => void;
}

function CategorySelector({ categories, selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <Button
          key={category.id}
          variant={selected === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(category.id)}
          className="text-sm"
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </Button>
      ))}
    </div>
  );
}
```

#### Input Section
```typescript
interface InputSectionProps {
  value: number;
  unit: string;
  category: string;
  onChange: (value: number) => void;
  onUnitChange: (unitId: string) => void;
}

function InputSection({ value, unit, category, onChange, onUnitChange }: InputSectionProps) {
  const selectedCategory = unitCategories.find(c => c.id === category);
  const availableUnits = selectedCategory?.groups.flatMap(g => g.units) || [];
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="input-value">Value</Label>
            <Input
              id="input-value"
              type="number"
              placeholder="Enter value..."
              value={value || ''}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              className="text-lg"
            />
          </div>
          <div className="w-48">
            <Label htmlFor="input-unit">From Unit</Label>
            <Select value={unit} onValueChange={onUnitChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory?.groups.map(group => (
                  <div key={group.id}>
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      {group.name}
                    </div>
                    {group.units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.icon && <span className="mr-2">{unit.icon}</span>}
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Results Grid
```typescript
interface ResultsGridProps {
  results: ConversionResult[];
  showAllUnits: boolean;
  favorites: string[];
  onToggleFavorite: (unitId: string) => void;
  onCopyValue: (value: string) => void;
}

function ResultsGrid({ results, showAllUnits, favorites, onToggleFavorite, onCopyValue }: ResultsGridProps) {
  const displayResults = showAllUnits ? results : results.slice(0, 6);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayResults.map(result => (
          <ResultCard
            key={result.unit.id}
            result={result}
            isFavorite={favorites.includes(result.unit.id)}
            onToggleFavorite={() => onToggleFavorite(result.unit.id)}
            onCopyValue={() => onCopyValue(result.formattedValue)}
          />
        ))}
      </div>
      
      {results.length > 6 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllUnits(!showAllUnits)}
          >
            {showAllUnits ? 'Show Less' : `Show All ${results.length} Units`}
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Responsive Design

### Breakpoint Strategy
- **Mobile (< 768px)**: Single column, stacked layout
- **Tablet (768px - 1023px)**: Two column results grid
- **Desktop (≥ 1024px)**: Three column results grid

### Mobile Optimizations
- Touch-friendly category buttons
- Larger input fields
- Swipe gestures for category navigation
- Bottom sheet for conversion information

## Performance Considerations

### Optimization Strategies
- **Debounced Input**: 150ms delay for real-time conversion
- **Memoized Calculations**: Cache conversion results
- **Lazy Loading**: Load unit data on demand
- **Virtual Scrolling**: For categories with many units

### Memory Management
- Limit conversion history to 50 items
- Clean up timers and debounced functions
- Efficient re-rendering with React.memo

## Accessibility Features

### Screen Reader Support
- Proper ARIA labels for all inputs and results
- Live regions for conversion updates
- Descriptive text for unit relationships

### Keyboard Navigation
- Tab through categories and inputs
- Enter to trigger conversions
- Arrow keys for unit selection
- Escape to clear inputs

## Educational Value

### Conversion Information Panel
- Mathematical formulas
- Historical context
- Usage recommendations
- Precision limitations

### Interactive Learning
- Hover tooltips with unit details
- Conversion factor visualization
- Relationship diagrams
- Practice mode for learning

## Installation Requirements

```bash
# Install required shadcn/ui components
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add label
npx shadcn@latest add toast
npx shadcn@latest add tabs

# Existing components (already available)
# - button, card, badge
```

## Future Enhancements

### Planned Features
- **Currency Conversion**: Live exchange rates
- **Unit Calculator**: Perform calculations with mixed units
- **Comparison Mode**: Side-by-side unit comparisons
- **Custom Units**: User-defined conversion factors
- **Offline Mode**: Work without internet connection

### Advanced Features
- **Voice Input**: Speak conversion requests
- **Camera Input**: Extract measurements from images
- **API Integration**: Scientific calculator integration
- **Export Results**: PDF/CSV export of conversions

---

**Implementation Priority**: Essential tool for students and professionals across multiple disciplines. Provides educational value while solving practical conversion needs with elegant, real-time interface. 