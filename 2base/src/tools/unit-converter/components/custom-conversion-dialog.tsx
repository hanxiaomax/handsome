import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { Plus, Code, Sparkles, Crown, Save, Play } from "lucide-react";
import { toast } from "sonner";

interface CustomConversionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (conversion: CustomConversion) => void;
}

export interface CustomConversion {
  id: string;
  name: string;
  symbol: string;
  description: string;
  formula: string; // JavaScript expression
  isJavaScript: boolean;
  createdAt: Date;
}

export function CustomConversionDialog({
  isOpen,
  onOpenChange,
  onSave,
}: CustomConversionDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    formula: "",
    isJavaScript: false,
  });

  const [jsCode, setJsCode] = useState(`// Custom conversion function
// Input: value (number) - the value to convert
// Output: number - the converted value

function convert(value) {
  // Example: Convert to custom unit
  // return value * 2.54; // cm to inches
  
  return value;
}`);

  const [aiPrompt, setAiPrompt] = useState("");

  const handleSave = () => {
    if (!formData.name || !formData.symbol) {
      toast.error("Please fill in name and symbol");
      return;
    }

    const finalFormula = activeTab === "javascript" ? jsCode : formData.formula;

    const customConversion: CustomConversion = {
      id: Date.now().toString(),
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      formula: finalFormula,
      isJavaScript: activeTab === "javascript",
      createdAt: new Date(),
    };

    onSave(customConversion);
    onOpenChange(false);

    // Reset form
    setFormData({
      name: "",
      symbol: "",
      description: "",
      formula: "",
      isJavaScript: false,
    });
    setJsCode(`// Custom conversion function
function convert(value) {
  return value;
}`);
    setAiPrompt("");

    toast.success("Custom conversion created!");
  };

  const handleTestCode = () => {
    try {
      // Simple test with value 1
      const testFunction = new Function(
        "value",
        jsCode + "\nreturn convert(value);"
      );
      const result = testFunction(1);
      toast.success(`Test result: convert(1) = ${result}`);
    } catch (error) {
      toast.error(`JavaScript error: ${(error as Error).message}`);
    }
  };

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a description for AI generation");
      return;
    }

    // Mock AI generation (UI only)
    toast.info("AI generation is a Pro feature - upgrade to unlock!");

    // Simulate AI response after delay
    setTimeout(() => {
      setJsCode(`// AI Generated conversion for: ${aiPrompt}
// This is a mock AI-generated response
function convert(value) {
  // AI would generate actual conversion logic here
  return value * 1.5; // Example conversion
}`);
      toast.success("AI conversion generated! (Mock response)");
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[70vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Custom Conversion
          </DialogTitle>
          <DialogDescription>
            Create your own conversion unit with custom formulas or JavaScript
            logic
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Formula</TabsTrigger>
            <TabsTrigger value="javascript" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              JavaScript
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Generate
              <Crown className="h-3 w-3 text-primary" />
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Custom Length"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g., cl"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, symbol: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of this unit"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* Tab content with fixed height and increased top margin */}
          <div className="min-h-[300px] mt-8">
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="formula">Conversion Formula</Label>
                <Input
                  id="formula"
                  placeholder="e.g., x * 2.54 (where x is the input value)"
                  value={formData.formula}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      formula: e.target.value,
                    }))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Use 'x' to represent the input value. Example: x * 2.54, x /
                  100, x + 273.15
                </p>
              </div>
            </TabsContent>

            <TabsContent value="javascript" className="space-y-4 mt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="js-code">JavaScript Code</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestCode}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Test Code
                  </Button>
                </div>
                <Textarea
                  id="js-code"
                  className="font-mono text-sm min-h-[200px] resize-none"
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-primary" />
                </Badge>
                <span className="text-sm text-muted-foreground">
                  AI-powered conversion generation requires a Pro subscription
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Describe Your Conversion</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="e.g., Convert cooking measurements from cups to milliliters, or convert old British units to metric..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <Button
                  onClick={handleGenerateAI}
                  className="w-full flex items-center gap-2"
                  disabled={!aiPrompt.trim()}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Conversion with AI
                </Button>
              </div>

              {/* Preview of generated code */}
              {jsCode && jsCode.includes("AI Generated") && (
                <div className="space-y-2">
                  <Label>Generated Code Preview</Label>
                  <Textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="font-mono text-sm min-h-[120px] resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    You can edit the generated code before saving
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Conversion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
