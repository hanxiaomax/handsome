import { useState } from "react";
import { Calculator } from "@/components/common/calculator";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Calculator as CalculatorIcon, X } from "lucide-react";
import { toolInfo } from "./toolInfo";

export default function CalculatorTool() {
  const [formattedValue, setFormattedValue] = useState("0");
  const [result, setResult] = useState<number | null>(null);

  // Individual input states for binding mode
  const [inputValue1, setInputValue1] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [inputValue3, setInputValue3] = useState("");

  // Calculator panel state
  const [showCalculatorPanel, setShowCalculatorPanel] = useState(false);
  const [currentCalculatorField, setCurrentCalculatorField] =
    useState<string>("");
  const [currentCalculatorHandler, setCurrentCalculatorHandler] = useState<
    ((result: number) => void) | null
  >(null);
  const [currentCalculatorPrecision, setCurrentCalculatorPrecision] =
    useState(2);

  const handleValueChange = (_: number, formatted: string) => {
    setFormattedValue(formatted);
  };

  const handleCalculationComplete = (calculationResult: number) => {
    setResult(calculationResult);
  };

  // Calculator completion handlers for each input
  const handleInput1Calculate = (calculationResult: number) => {
    const resultString = calculationResult.toString();
    setInputValue1(resultString);
    setResult(calculationResult);
    setShowCalculatorPanel(false);
  };

  const handleInput2Calculate = (calculationResult: number) => {
    const resultString = calculationResult.toString();
    setInputValue2(resultString);
    setResult(calculationResult);
    setShowCalculatorPanel(false);
  };

  const handleInput3Calculate = (calculationResult: number) => {
    const resultString = calculationResult.toString();
    setInputValue3(resultString);
    setResult(calculationResult);
    setShowCalculatorPanel(false);
  };

  // Open calculator for specific field
  const openCalculatorFor = (
    fieldName: string,
    handler: (result: number) => void,
    precision: number = 2
  ) => {
    setCurrentCalculatorField(fieldName);
    setCurrentCalculatorHandler(() => handler);
    setCurrentCalculatorPrecision(precision);
    setShowCalculatorPanel(true);
  };

  const closeCalculator = () => {
    setShowCalculatorPanel(false);
    setCurrentCalculatorField("");
    setCurrentCalculatorHandler(null);
  };

  // Tool state passed to ToolWrapper for state management
  const toolState = {
    formattedValue,
    result,
    inputValue1,
    inputValue2,
    inputValue3,
    showCalculatorPanel,
  };

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ calculatorState: toolState }}>
      {/* Standard container classes following guide specifications */}
      <div className="w-full p-6 space-y-6">
        {/* Tab system for different calculator modes */}
        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="direct">Direct Use</TabsTrigger>
            <TabsTrigger value="popup">Popup Calculator</TabsTrigger>
            <TabsTrigger value="binding">Panel Calculator</TabsTrigger>
          </TabsList>

          {/* Direct use tab content */}
          <TabsContent value="direct" className="space-y-6">
            {/* Usage Documentation */}
            <Card id="usage-documentation-section">
              <CardHeader>
                <CardTitle>Direct Calculator Usage Guide</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Learn how to integrate and use the Calculator component
                  directly in your applications
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Usage */}
                <div>
                  <h3 className="font-medium mb-3">Basic Usage</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`import { Calculator } from '@/components/common/calculator';

function MyApp() {
  const handleValueChange = (value: number, formatted: string) => {
    console.log('Value changed:', value, formatted);
  };

  const handleCalculationComplete = (result: number) => {
    console.log('Calculation complete:', result);
  };

  return (
    <Calculator 
      onValueChange={handleValueChange}
      onCalculationComplete={handleCalculationComplete}
      decimalPlaces={2}
      className="max-w-md"
    />
  );
}`}</code>
                    </pre>
                  </div>
                </div>

                {/* Props Documentation */}
                <div>
                  <h3 className="font-medium mb-3">Component Props</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                            Prop
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                            Type
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                            Default
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            initialValue
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            number | string
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            0
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Initial display value
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            onValueChange
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            (value, formatted) =&gt; void
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            -
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Called when value changes
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            onCalculationComplete
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            (result) =&gt; void
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            -
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Called when calculation completes
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            decimalPlaces
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            number
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            -
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Number of decimal places for results
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            bindToFocusedInput
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            boolean
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            false
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Auto-bind to focused input fields
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            autoApply
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            boolean
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            false
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Auto-apply results to bound inputs
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            realTimeBinding
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            boolean
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            false
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Real-time value binding during input
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            className
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            string
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            -
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Additional CSS classes
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-medium mb-3">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-medium mb-2">
                        🧮 Complete Formula Display
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Shows both the complete mathematical expression and
                        current result in a dual-line display.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h4 className="font-medium mb-2">
                        📏 Horizontal Scrolling
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Long formulas scroll horizontally without breaking the
                        layout or expanding the container.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <h4 className="font-medium mb-2">
                        🔬 Scientific Functions
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Includes trigonometric, logarithmic, and power functions
                        with standard mathematical notation.
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <h4 className="font-medium mb-2">
                        ⚙️ Flexible Integration
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Easy to integrate with custom styling, event handlers,
                        and responsive design.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Size Demonstrations */}
            <Card id="size-demonstrations-section">
              <CardHeader>
                <CardTitle>Calculator Sizes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose from three preset sizes based on your layout
                  requirements
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Compact Size */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-medium">Compact Size</h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      max-w-xs
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Best for:</strong> Sidebars, small panels, mobile
                      layouts
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs">
                      <code>
                        {
                          '<Calculator className="max-w-xs" decimalPlaces={2} />'
                        }
                      </code>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Calculator
                      className="max-w-xs w-full"
                      onValueChange={handleValueChange}
                      decimalPlaces={2}
                    />
                  </div>
                </div>

                {/* Standard Size */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-medium">Standard Size</h3>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                      max-w-md
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Best for:</strong> Main content areas, dialog
                      boxes, general use
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs">
                      <code>
                        {
                          '<Calculator className="max-w-md" decimalPlaces={2} />'
                        }
                      </code>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Calculator
                      className="max-w-md w-full"
                      onValueChange={handleValueChange}
                      decimalPlaces={2}
                    />
                  </div>
                </div>

                {/* Large Size */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-medium">Large Size</h3>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                      max-w-lg
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Best for:</strong> Dedicated calculator pages,
                      wide layouts, desktop applications
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs">
                      <code>
                        {
                          '<Calculator className="max-w-lg" decimalPlaces={2} />'
                        }
                      </code>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Calculator
                      className="max-w-lg w-full"
                      onValueChange={handleValueChange}
                      decimalPlaces={2}
                    />
                  </div>
                </div>

                {/* Size Comparison Table */}
                <div>
                  <h3 className="font-medium mb-3">Size Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                            Size
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                            CSS Class
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                            Max Width
                          </th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                            Best Use Cases
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium">
                            Compact
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            max-w-xs
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            20rem (320px)
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Sidebars, mobile layouts, compact panels
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium">
                            Standard
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            max-w-md
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            28rem (448px)
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            General use, dialogs, main content
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-medium">
                            Large
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono">
                            max-w-lg
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            32rem (512px)
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                            Dedicated pages, wide layouts, desktop apps
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Examples */}
            <Card id="advanced-examples-section">
              <CardHeader>
                <CardTitle>Advanced Usage Examples</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Common integration patterns and advanced configurations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example 1: Form Integration */}
                <div>
                  <h3 className="font-medium mb-3">
                    Form Integration with State Management
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`import { useState } from 'react';
import { Calculator } from '@/components/common/calculator';

function FormWithCalculator() {
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const handlePriceCalculation = (value: number) => {
    setPrice(value.toFixed(2));
    setResult(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Product Price</label>
        <input 
          type="number" 
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Calculate or enter manually"
        />
      </div>
      
      <Calculator
        className="max-w-md"
        onCalculationComplete={handlePriceCalculation}
        decimalPlaces={2}
        initialValue={price}
      />
      
      {result !== null && (
        <p>Last calculated: $\{result.toFixed(2)}</p>
      )}
    </div>
  );
}`}</code>
                    </pre>
                  </div>
                </div>

                {/* Example 2: Real-time Binding */}
                <div>
                  <h3 className="font-medium mb-3">Real-time Input Binding</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`function RealTimeCalculator() {
  return (
    <div className="space-y-4">
      <p>Click on any input field, then use the calculator:</p>
      
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="First value" />
        <input type="number" placeholder="Second value" />
        <input type="number" placeholder="Result" />
        <input type="number" placeholder="Total" />
      </div>
      
      <Calculator
        className="max-w-md"
        bindToFocusedInput={true}
        realTimeBinding={true}
        autoApply={true}
        decimalPlaces={2}
      />
    </div>
  );
}`}</code>
                    </pre>
                  </div>
                </div>

                {/* Example 3: Custom Styling */}
                <div>
                  <h3 className="font-medium mb-3">
                    Custom Styling and Themes
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`function CustomStyledCalculator() {
  return (
    <Calculator
      className="max-w-md border-2 border-blue-500 shadow-lg rounded-xl"
      onValueChange={(value, formatted) => {
        console.log(\`Value: \${value}, Formatted: \${formatted}\`);
      }}
      onCalculationComplete={(result) => {
        // Custom handling of results
        analytics.track('calculator_used', { result });
      }}
      decimalPlaces={4}
      initialValue="0"
    />
  );
}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Demo */}
            <Card id="live-demo-section">
              <CardHeader>
                <CardTitle>Interactive Demo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Try out the calculator with real-time feedback
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Calculator
                  className="max-w-md w-full"
                  onValueChange={handleValueChange}
                  decimalPlaces={2}
                />

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Current Value:
                  </p>
                  <p className="text-2xl font-mono">{formattedValue}</p>
                  {result !== null && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Last Calculation Result: {result?.toString() || "N/A"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Popup calculator tab content */}
          <TabsContent value="popup" className="space-y-6">
            <Card id="popup-calculator-section">
              <CardHeader>
                <CardTitle>Popup Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculator in a dialog popup. Useful when you need a
                  calculator on demand without taking up page space.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <CalculatorIcon className="h-4 w-4 mr-2" />
                        Open Calculator
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Scientific Calculator</DialogTitle>
                      </DialogHeader>
                      <Calculator
                        onValueChange={handleValueChange}
                        onCalculationComplete={handleCalculationComplete}
                        className="w-full max-w-md"
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {result !== null && (
                  <div className="text-center space-y-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Last Calculation Result:
                    </p>
                    <p className="text-xl font-mono">
                      {result?.toString() || "N/A"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Panel calculator tab content */}
          <TabsContent value="binding" className="space-y-6">
            <Card id="panel-calculator-section">
              <CardHeader>
                <CardTitle>Panel Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Each input field has its own calculator button. Click to open
                  a calculator panel on the right that adjusts the layout
                  instead of covering content.
                </p>
              </CardHeader>
              <CardContent>
                {/* Resizable layout with main content and calculator panel */}
                <ResizablePanelGroup
                  direction="horizontal"
                  className="min-h-[600px] rounded-lg border"
                >
                  {/* Main content panel */}
                  <ResizablePanel
                    defaultSize={showCalculatorPanel ? 60 : 100}
                    minSize={40}
                  >
                    <div className="p-6 space-y-6">
                      {/* Input fields with individual calculator buttons */}
                      <div id="panel-input-fields-area" className="space-y-6">
                        <h3 className="font-medium">
                          Input Fields with Panel Calculators
                        </h3>

                        <div className="grid gap-6 md:max-w-md">
                          {/* Input 1 with calculator */}
                          <div className="space-y-2">
                            <Label htmlFor="panel-input1">
                              Price (with 2 decimal places)
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="panel-input1"
                                type="number"
                                placeholder="Enter or calculate price"
                                value={inputValue1}
                                onChange={(e) => setInputValue1(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  openCalculatorFor(
                                    "Price",
                                    handleInput1Calculate,
                                    2
                                  )
                                }
                              >
                                <CalculatorIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Input 2 with calculator */}
                          <div className="space-y-2">
                            <Label htmlFor="panel-input2">Quantity</Label>
                            <div className="flex gap-2">
                              <Input
                                id="panel-input2"
                                type="number"
                                placeholder="Enter or calculate quantity"
                                value={inputValue2}
                                onChange={(e) => setInputValue2(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  openCalculatorFor(
                                    "Quantity",
                                    handleInput2Calculate,
                                    0
                                  )
                                }
                              >
                                <CalculatorIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Input 3 with calculator */}
                          <div className="space-y-2">
                            <Label htmlFor="panel-input3">Total Amount</Label>
                            <div className="flex gap-2">
                              <Input
                                id="panel-input3"
                                type="number"
                                placeholder="Enter or calculate total"
                                value={inputValue3}
                                onChange={(e) => setInputValue3(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  openCalculatorFor(
                                    "Total Amount",
                                    handleInput3Calculate,
                                    2
                                  )
                                }
                              >
                                <CalculatorIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Quick calculation example */}
                          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <h4 className="font-medium mb-2">
                              Quick Calculation Example:
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Try this: Set Price = 15.50, Quantity = 3, then
                              calculate Total = Price × Quantity
                            </p>
                            {inputValue1 && inputValue2 && (
                              <p className="text-sm font-mono">
                                {inputValue1} × {inputValue2} ={" "}
                                {(
                                  parseFloat(inputValue1) *
                                  parseFloat(inputValue2)
                                ).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Advantages section */}
                      <div className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">
                          Panel Calculator Advantages:
                        </h4>
                        <ul className="space-y-1">
                          <li>
                            ✅ <strong>No Overlay:</strong> Calculator panel
                            pushes content left instead of covering it
                          </li>
                          <li>
                            ✅ <strong>Resizable Layout:</strong> Adjust the
                            split between content and calculator as needed
                          </li>
                          <li>
                            ✅ <strong>Always Visible:</strong> See both your
                            inputs and calculator simultaneously
                          </li>
                          <li>
                            ✅ <strong>Large Interface:</strong> Full height
                            panel for comfortable calculator use
                          </li>
                          <li>
                            ✅ <strong>Clear Context:</strong> Header shows
                            exactly which field you're calculating for
                          </li>
                          <li>
                            ✅ <strong>Current Value Display:</strong> See the
                            current field value while calculating
                          </li>
                          <li>
                            ✅ <strong>Auto Apply & Close:</strong> Results
                            automatically applied and panel can be closed
                          </li>
                          <li>
                            ✅ <strong>Custom Precision:</strong> Each field
                            maintains its own decimal precision
                          </li>
                        </ul>
                      </div>
                    </div>
                  </ResizablePanel>

                  {/* Calculator panel - only show when needed */}
                  {showCalculatorPanel && (
                    <>
                      <ResizableHandle withHandle />
                      <ResizablePanel
                        defaultSize={40}
                        minSize={30}
                        maxSize={60}
                      >
                        <div className="flex flex-col h-full">
                          {/* Calculator panel header */}
                          <div className="flex items-center justify-between p-4 border-b">
                            <div>
                              <h3 className="font-medium">
                                Calculator for {currentCalculatorField}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Calculate the{" "}
                                {currentCalculatorField.toLowerCase()} value
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={closeCalculator}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Calculator content */}
                          <div className="flex-1 p-4 space-y-4">
                            <Calculator
                              onCalculationComplete={
                                currentCalculatorHandler || (() => {})
                              }
                              decimalPlaces={currentCalculatorPrecision}
                              className="w-full max-w-sm"
                            />

                            {/* Current value display */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <h4 className="font-medium mb-2">
                                Current {currentCalculatorField} Value:
                              </h4>
                              <p className="text-lg font-mono">
                                {currentCalculatorField === "Price"
                                  ? inputValue1 || "0"
                                  : currentCalculatorField === "Quantity"
                                  ? inputValue2 || "0"
                                  : currentCalculatorField === "Total Amount"
                                  ? inputValue3 || "0"
                                  : "0"}
                              </p>
                            </div>

                            {/* Apply button */}
                            <Button
                              onClick={closeCalculator}
                              className="w-full"
                              variant="outline"
                            >
                              Close Calculator
                            </Button>
                          </div>
                        </div>
                      </ResizablePanel>
                    </>
                  )}
                </ResizablePanelGroup>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature overview section */}
        <Card id="features-section">
          <CardHeader>
            <CardTitle>Calculator Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Basic Operations</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Addition, Subtraction, Multiplication, Division</li>
                  <li>• Power operations (x^y)</li>
                  <li>• Clear and backspace functions</li>
                  <li>• Decimal number support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-3">Scientific Functions</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Trigonometric functions (sin, cos, tan)</li>
                  <li>• Logarithmic functions (ln, log)</li>
                  <li>• Square root and square operations</li>
                  <li>• Mathematical constants (π, e)</li>
                  <li>• Reciprocal function (1/x)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-3">Panel Calculator</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dedicated calculator button for each input</li>
                  <li>
                    • Right panel that pushes content instead of overlaying
                  </li>
                  <li>• Resizable layout for optimal space usage</li>
                  <li>• Always visible inputs and calculator simultaneously</li>
                  <li>• Custom decimal precision per field</li>
                  <li>• Full height interface for comfortable use</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-3">Integration Modes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Direct embedded calculator</li>
                  <li>• Dialog popup for on-demand use</li>
                  <li>• Panel calculator with resizable layout</li>
                  <li>• Flexible container and styling support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolWrapper>
  );
}
