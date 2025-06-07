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
import { Calculator as CalculatorIcon } from "lucide-react";
import { toolInfo } from "./toolInfo";

export default function CalculatorTool() {
  const [formattedValue, setFormattedValue] = useState("0");
  const [result, setResult] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleValueChange = (_: number, formatted: string) => {
    setFormattedValue(formatted);
  };

  const handleCalculationComplete = (calculationResult: number) => {
    setResult(calculationResult);
  };

  // 工具状态，传递给ToolWrapper用于状态管理
  const toolState = {
    formattedValue,
    result,
    inputValue,
  };

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ calculatorState: toolState }}>
      {/* 标准容器类：w-full p-6 space-y-6 mt-12 */}
      <div className="w-full p-6 space-y-6">
        {/* 标签页系统 */}
        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="direct">Direct Use</TabsTrigger>
            <TabsTrigger value="popup">Popup Calculator</TabsTrigger>
            <TabsTrigger value="binding">Input Binding</TabsTrigger>
          </TabsList>

          {/* 直接使用标签页 */}
          <TabsContent value="direct" className="space-y-6">
            <Card id="direct-calculator-section">
              <CardHeader>
                <CardTitle>Direct Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculator embedded directly in the page. Perfect for
                  dedicated calculation pages.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Calculator
                  className="max-w-md"
                  onValueChange={handleValueChange}
                  decimalPlaces={2}
                />

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Current Value:
                  </p>
                  <p className="text-2xl font-mono">{formattedValue}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 弹出式计算器标签页 */}
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
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {result !== null && (
                  <div className="text-center space-y-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Last Calculation Result:
                    </p>
                    <p className="text-xl font-mono">{result}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 输入绑定标签页 */}
          <TabsContent value="binding" className="space-y-6">
            <Card id="input-binding-section">
              <CardHeader>
                <CardTitle>Input Binding Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculator with automatic input field binding. Values are
                  automatically applied to focused input fields.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 输入字段区域 */}
                  <div id="input-fields-area" className="space-y-4">
                    <h3 className="font-medium">Input Fields</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="input1">Value 1</Label>
                        <Input
                          id="input1"
                          type="number"
                          placeholder="Focus this input then use calculator"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="input2">Value 2</Label>
                        <Input
                          id="input2"
                          type="number"
                          placeholder="Focus this input then use calculator"
                        />
                      </div>
                      <div>
                        <Label htmlFor="input3">
                          Result (2 decimal places)
                        </Label>
                        <Input
                          id="input3"
                          type="number"
                          placeholder="Focus this input then use calculator"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 计算器绑定区域 */}
                  <div id="calculator-binding-area" className="space-y-4">
                    <h3 className="font-medium">Calculator</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <CalculatorIcon className="h-4 w-4 mr-2" />
                          Open Calculator with Input Binding
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            Calculator with Input Binding
                          </DialogTitle>
                          <p className="text-sm text-muted-foreground">
                            Values will be automatically applied to focused
                            input fields
                          </p>
                        </DialogHeader>
                        <Calculator
                          bindToFocusedInput={true}
                          realTimeBinding={true}
                          decimalPlaces={2}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* 使用说明 */}
                <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">How Input Binding Works:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Focus on any input field above</li>
                    <li>Open the calculator</li>
                    <li>
                      Perform calculations - values will automatically populate
                      the focused input
                    </li>
                    <li>
                      Real-time binding means every calculation step updates the
                      input immediately
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 功能特性说明 */}
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
                <h3 className="font-medium mb-3">Data Binding</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Automatic input field binding</li>
                  <li>• Real-time value updates</li>
                  <li>• Custom decimal place formatting</li>
                  <li>• Value change callbacks</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-3">Integration</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Flexible container support</li>
                  <li>• Dialog and popover compatible</li>
                  <li>• Custom styling support</li>
                  <li>• Event-driven architecture</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolWrapper>
  );
}
