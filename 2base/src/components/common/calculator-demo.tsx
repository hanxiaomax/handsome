import { useState } from "react";
import { Calculator } from "./calculator";
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

/**
 * Calculator Demo Component
 * Demonstrates various usage patterns of the Calculator component
 */
export function CalculatorDemo() {
  const [basicValue, setBasicValue] = useState(0);
  const [realtimeValue, setRealtimeValue] = useState(0);
  const [lastCalculation, setLastCalculation] = useState("");
  const [textValue, setTextValue] = useState("");

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Calculator Component Demo</h2>
        <p className="text-muted-foreground">
          Explore different Calculator component configurations and data binding
          options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Basic Calculator
              <Badge variant="secondary">Manual Apply</Badge>
            </CardTitle>
            <CardDescription>
              Standard calculator with manual result application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="basic-input">Target Input</Label>
              <Input
                id="basic-input"
                type="number"
                value={basicValue}
                onChange={(e) => setBasicValue(parseFloat(e.target.value) || 0)}
                placeholder="Enter value or use calculator..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Calculator
                triggerText="Open Calculator"
                onValueChange={(value) => {
                  setBasicValue(value);
                }}
                onCalculationComplete={(_result, expression) => {
                  setLastCalculation(expression);
                }}
                showExpression={true}
              />
              <span className="text-sm text-muted-foreground">
                Current: {basicValue}
              </span>
            </div>

            {lastCalculation && (
              <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                Last: {lastCalculation}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto-Apply Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Auto-Apply Calculator
              <Badge variant="default">Auto Apply</Badge>
            </CardTitle>
            <CardDescription>
              Calculator with automatic result application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auto-input">Target Input</Label>
              <Input
                id="auto-input"
                type="number"
                value={realtimeValue}
                onChange={(e) =>
                  setRealtimeValue(parseFloat(e.target.value) || 0)
                }
                placeholder="Auto-updated from calculator..."
              />
            </div>

            <Calculator
              triggerText="Auto Calculator"
              triggerVariant="default"
              autoApply={true}
              onValueChange={(value) => setRealtimeValue(value)}
              decimalPlaces={2}
            />
          </CardContent>
        </Card>

        {/* Focused Input Binding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Focus Binding Calculator
              <Badge variant="outline">Smart Binding</Badge>
            </CardTitle>
            <CardDescription>
              Automatically detects and applies to focused input fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Multiple Input Fields</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Focus me and use calculator..."
                  className="focus:border-primary"
                />
                <Input
                  type="number"
                  placeholder="Or focus me instead..."
                  className="focus:border-primary"
                />
                <Input
                  type="text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Text input also works..."
                  className="focus:border-primary"
                />
              </div>
            </div>

            <Calculator
              triggerText="Smart Calculator"
              triggerVariant="secondary"
              bindToFocusedInput={true}
              showIcon={true}
            />

            <div className="text-xs text-muted-foreground">
              Focus any input above, then use the calculator to apply results
              directly
            </div>
          </CardContent>
        </Card>

        {/* Real-time Binding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Real-time Calculator
              <Badge variant="destructive">Live Updates</Badge>
            </CardTitle>
            <CardDescription>
              Real-time value updates as you type in calculator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realtime-input">Live Target</Label>
              <Input
                id="realtime-input"
                type="number"
                placeholder="Updates in real-time..."
                readOnly
                className="bg-muted"
              />
            </div>

            <Calculator
              triggerText="Live Calculator"
              triggerVariant="destructive"
              bindToFocusedInput={true}
              realTimeBinding={true}
              decimalPlaces={3}
            />

            <div className="text-xs text-muted-foreground">
              Focus the input above, then start typing in the calculator
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Advanced Features Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
          <CardDescription>
            Customization options and advanced configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Minimal Calculator */}
            <div className="space-y-2">
              <Label>Minimal Style</Label>
              <Calculator
                showIcon={false}
                triggerText="Minimal"
                triggerSize="sm"
                triggerVariant="ghost"
              />
            </div>

            {/* Icon Only */}
            <div className="space-y-2">
              <Label>Icon Only</Label>
              <Calculator
                triggerText=""
                triggerSize="icon"
                triggerVariant="outline"
              />
            </div>

            {/* Custom Position */}
            <div className="space-y-2">
              <Label>Custom Position</Label>
              <Calculator
                triggerText="Top Aligned"
                popoverSide="top"
                popoverAlign="start"
                triggerVariant="secondary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Basic Usage</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              {`<Calculator onValueChange={(value) => setValue(value)} />`}
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Auto-Apply Mode</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              {`<Calculator autoApply={true} onValueChange={(value) => setValue(value)} />`}
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Focus Binding</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              {`<Calculator bindToFocusedInput={true} />`}
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Real-time Updates</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              {`<Calculator bindToFocusedInput={true} realTimeBinding={true} />`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
