import { useState } from "react";
import { Calculator } from "@/components/common/calculator";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toolInfo } from "./toolInfo";

export default function CalculatorTool() {
  // State for different calculator modes
  const [basicValue, setBasicValue] = useState(0);
  const [autoValue, setAutoValue] = useState(0);
  const [lastCalculation, setLastCalculation] = useState("");
  const [textValue, setTextValue] = useState("");

  // Tool state for ToolWrapper
  const toolState = {
    basicValue,
    autoValue,
    lastCalculation,
    textValue,
  };

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ calculatorState: toolState }}>
      {/* Main Calculator Tool Container - Primary workspace */}
      <div
        id="calculator-tool-container"
        className="w-full p-6 space-y-6 mt-12"
      >
        {/* Tool Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Advanced Calculator Tool</h2>
          <p className="text-muted-foreground">
            Demonstration of the Calculator component's various modes and data
            binding capabilities
          </p>
        </div>

        {/* Calculator Modes Tabs */}
        <Tabs defaultValue="variants" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="auto">Auto-Apply</TabsTrigger>
            <TabsTrigger value="binding">Smart Binding</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Variants Demo */}
          <TabsContent value="variants">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Normal Variant */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Normal Variant
                    <Badge variant="default">Default</Badge>
                  </CardTitle>
                  <CardDescription>
                    Calculator rendered directly in the current area without
                    popover
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calculator
                    variant="normal"
                    onValueChange={(value) =>
                      console.log("Normal variant value:", value)
                    }
                    showExpression={true}
                    decimalPlaces={2}
                  />
                </CardContent>
              </Card>

              {/* Inline Variant */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Inline Variant
                    <Badge variant="secondary">Button + Popover</Badge>
                  </CardTitle>
                  <CardDescription>
                    Calculator activated through button click with popover
                    interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Calculator
                      variant="inline"
                      triggerText="Open Calculator"
                      triggerVariant="default"
                      showIcon={true}
                      onValueChange={(value) =>
                        console.log("Inline variant value:", value)
                      }
                      showExpression={true}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Features:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Compact trigger button</li>
                      <li>Popover-based interface</li>
                      <li>Apply/Cancel buttons</li>
                      <li>Position customizable</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            {/* Usage Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Variant Usage Examples</CardTitle>
                <CardDescription>
                  Code examples showing how to use different calculator variants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Normal Variant (Default)</h4>
                    <code className="text-sm bg-muted p-3 rounded block break-all">
                      {`<Calculator variant="normal" onValueChange={setValue} />`}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      Renders calculator directly in place. Perfect for
                      dedicated calculator areas.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Inline Variant</h4>
                    <code className="text-sm bg-muted p-3 rounded block break-all">
                      {`<Calculator variant="inline" triggerText="Calculator" />`}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      Shows button that opens calculator in popover. Ideal for
                      form fields.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Basic Calculator Mode */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Basic Calculator Mode
                  <Badge variant="secondary">Manual Apply</Badge>
                </CardTitle>
                <CardDescription>
                  Standard calculator with manual result application using Apply
                  button
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Input */}
                <div className="space-y-2">
                  <Label htmlFor="basic-input">Target Input Field</Label>
                  <Input
                    id="basic-input"
                    type="number"
                    value={basicValue}
                    onChange={(e) =>
                      setBasicValue(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Enter value or use calculator..."
                    className="text-lg"
                  />
                </div>

                {/* Calculator */}
                <div className="flex items-center justify-between">
                  <Calculator
                    variant="inline"
                    triggerText="Open Calculator"
                    triggerVariant="default"
                    showIcon={true}
                    onValueChange={(value) => setBasicValue(value)}
                    onCalculationComplete={(_result, expression) => {
                      setLastCalculation(expression);
                    }}
                    showExpression={true}
                  />
                  <div className="text-sm text-muted-foreground">
                    Current Value:{" "}
                    <span className="font-mono">{basicValue}</span>
                  </div>
                </div>

                {/* Last Calculation Display */}
                {lastCalculation && (
                  <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    Last Calculation: {lastCalculation}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto-Apply Calculator Mode */}
          <TabsContent value="auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Auto-Apply Calculator Mode
                  <Badge variant="default">Auto Apply</Badge>
                </CardTitle>
                <CardDescription>
                  Calculator with automatic result application on calculation
                  completion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Input */}
                <div className="space-y-2">
                  <Label htmlFor="auto-input">Auto-Updated Input Field</Label>
                  <Input
                    id="auto-input"
                    type="number"
                    value={autoValue}
                    onChange={(e) =>
                      setAutoValue(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Automatically updated from calculator..."
                    className="text-lg"
                  />
                </div>

                {/* Calculator with Auto-Apply */}
                <div className="flex items-center justify-between">
                  <Calculator
                    variant="inline"
                    triggerText="Auto Calculator"
                    triggerVariant="default"
                    autoApply={true}
                    onValueChange={(value) => setAutoValue(value)}
                    decimalPlaces={2}
                    showIcon={true}
                  />
                  <div className="text-sm text-muted-foreground">
                    Auto-Updated:{" "}
                    <span className="font-mono">{autoValue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Binding Mode */}
          <TabsContent value="binding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Smart Focus Binding Mode
                  <Badge variant="outline">Smart Binding</Badge>
                </CardTitle>
                <CardDescription>
                  Calculator automatically detects and applies to focused input
                  fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multiple Input Fields */}
                <div className="space-y-2">
                  <Label>
                    Multiple Input Fields (Click to focus, then use calculator)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="binding-input-1">Field 1 (Number)</Label>
                      <Input
                        id="binding-input-1"
                        type="number"
                        placeholder="Focus me and use calculator..."
                        className="focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="binding-input-2">Field 2 (Number)</Label>
                      <Input
                        id="binding-input-2"
                        type="number"
                        placeholder="Or focus me instead..."
                        className="focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="binding-input-3">Field 3 (Text)</Label>
                      <Input
                        id="binding-input-3"
                        type="text"
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        placeholder="Text input also works..."
                        className="focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Smart Calculator */}
                <div className="flex items-center justify-between">
                  <Calculator
                    variant="inline"
                    triggerText="Smart Calculator"
                    triggerVariant="secondary"
                    bindToFocusedInput={true}
                    showIcon={true}
                  />
                  <div className="text-sm text-muted-foreground">
                    💡 Focus any input above, then use the calculator
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Features Mode */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Features & Customization</CardTitle>
                <CardDescription>
                  Explore advanced calculator features and customization options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Real-time Calculator */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="realtime-input">Real-time Updates</Label>
                      <Input
                        id="realtime-input"
                        type="number"
                        placeholder="Updates as you type in calculator..."
                        className="bg-muted/50"
                        readOnly
                      />
                    </div>
                    <Calculator
                      variant="inline"
                      triggerText="Live Calculator"
                      triggerVariant="destructive"
                      triggerSize="sm"
                      bindToFocusedInput={true}
                      realTimeBinding={true}
                      decimalPlaces={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Focus input above, then type in calculator for live
                      updates
                    </p>
                  </div>

                  {/* Minimal Style */}
                  <div className="space-y-3">
                    <Label>Minimal Style</Label>
                    <Calculator
                      variant="inline"
                      showIcon={false}
                      triggerText="Minimal"
                      triggerSize="sm"
                      triggerVariant="ghost"
                    />
                    <p className="text-xs text-muted-foreground">
                      Clean, minimal button style
                    </p>
                  </div>

                  {/* Icon Only */}
                  <div className="space-y-3">
                    <Label>Icon Only</Label>
                    <Calculator
                      variant="inline"
                      triggerText=""
                      triggerSize="icon"
                      triggerVariant="outline"
                    />
                    <p className="text-xs text-muted-foreground">
                      Compact icon-only button
                    </p>
                  </div>

                  {/* Custom Position */}
                  <div className="space-y-3">
                    <Label>Custom Position</Label>
                    <Calculator
                      variant="inline"
                      triggerText="Top Aligned"
                      popoverSide="top"
                      popoverAlign="start"
                      triggerVariant="secondary"
                      triggerSize="sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Calculator opens above button
                    </p>
                  </div>

                  {/* High Precision */}
                  <div className="space-y-3">
                    <Label>High Precision</Label>
                    <Calculator
                      variant="inline"
                      triggerText="Precision"
                      triggerVariant="outline"
                      triggerSize="sm"
                      decimalPlaces={6}
                      autoApply={true}
                    />
                    <p className="text-xs text-muted-foreground">
                      6 decimal places precision
                    </p>
                  </div>

                  {/* Expression Display */}
                  <div className="space-y-3">
                    <Label>With Expression</Label>
                    <Calculator
                      variant="inline"
                      triggerText="Expression"
                      triggerVariant="default"
                      triggerSize="sm"
                      showExpression={true}
                    />
                    <p className="text-xs text-muted-foreground">
                      Shows calculation expressions
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Usage Examples */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Integration Examples
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Basic Usage</h4>
                      <code className="text-sm bg-muted p-2 rounded block break-all">
                        {`<Calculator variant="inline" onValueChange={(value) => setValue(value)} />`}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Auto-Apply Mode</h4>
                      <code className="text-sm bg-muted p-2 rounded block break-all">
                        {`<Calculator variant="inline" autoApply={true} onValueChange={setValue} />`}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Focus Binding</h4>
                      <code className="text-sm bg-muted p-2 rounded block break-all">
                        {`<Calculator variant="inline" bindToFocusedInput={true} />`}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Real-time Updates</h4>
                      <code className="text-sm bg-muted p-2 rounded block break-all">
                        {`<Calculator variant="inline" bindToFocusedInput realTimeBinding />`}
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolWrapper>
  );
}
