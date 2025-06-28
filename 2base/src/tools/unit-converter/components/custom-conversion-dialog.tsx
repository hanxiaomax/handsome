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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Code,
  Sparkles,
  Crown,
  Save,
  Play,
  ArrowLeft,
  Calculator,
  Zap,
} from "lucide-react";
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

type ConversionMode = "selection" | "basic" | "javascript" | "ai";

export function CustomConversionDialog({
  isOpen,
  onOpenChange,
  onSave,
}: CustomConversionDialogProps) {
  const [mode, setMode] = useState<ConversionMode>("selection");
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    formula: "",
    isJavaScript: false,
  });

  const [jsCode, setJsCode] = useState(`function convert(value) {
  // Your conversion logic here
  return value * 2.54; // Example: inches to cm
}`);

  const [aiPrompt, setAiPrompt] = useState("");

  const handleSave = () => {
    if (!formData.name || !formData.symbol) {
      toast.error("Please fill in name and symbol");
      return;
    }

    let finalFormula = formData.formula;
    let isJavaScript = false;

    if (mode === "javascript") {
      finalFormula = jsCode;
      isJavaScript = true;
    } else if (mode === "ai" && jsCode.includes("AI Generated")) {
      finalFormula = jsCode;
      isJavaScript = true;
    }

    const customConversion: CustomConversion = {
      id: Date.now().toString(),
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      formula: finalFormula,
      isJavaScript,
      createdAt: new Date(),
    };

    onSave(customConversion);
    onOpenChange(false);

    // Reset form
    setMode("selection");
    setFormData({
      name: "",
      symbol: "",
      description: "",
      formula: "",
      isJavaScript: false,
    });
    setJsCode(`function convert(value) {
  return value * 2.54;
}`);
    setAiPrompt("");

    toast.success("Custom conversion created!");
  };

  const handleTestCode = () => {
    try {
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

    toast.info("AI generation is a Pro feature - upgrade to unlock!");

    setTimeout(() => {
      setJsCode(`// AI Generated conversion for: ${aiPrompt}
function convert(value) {
  // AI would generate actual conversion logic here
  return value * 1.5; // Example conversion
}`);
      toast.success("AI conversion generated! (Mock response)");
    }, 2000);
  };

  const handleBack = () => {
    setMode("selection");
  };

  const handleClose = () => {
    setMode("selection");
    onOpenChange(false);
  };

  const renderModeSelection = () => (
    <div className="space-y-6">
      <div className="flex justify-center gap-8">
        {/* Basic Formula */}
        <div
          className="cursor-pointer hover:scale-105 transition-transform text-center"
          onClick={() => setMode("basic")}
        >
          <div className="w-20 h-20 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center mb-3 mx-auto transition-colors">
            <Calculator className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm font-medium">Basic Formula</p>
        </div>

        {/* JavaScript */}
        <div
          className="cursor-pointer hover:scale-105 transition-transform text-center"
          onClick={() => setMode("javascript")}
        >
          <div className="w-20 h-20 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center mb-3 mx-auto transition-colors">
            <Code className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm font-medium">JavaScript</p>
        </div>

        {/* AI Generate */}
        <div
          className="cursor-pointer hover:scale-105 transition-transform text-center"
          onClick={() => setMode("ai")}
        >
          <div className="w-20 h-20 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center mb-3 mx-auto transition-colors">
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex items-center justify-center gap-1">
            <p className="text-sm font-medium">AI Generate</p>
            <Crown className="h-3 w-3 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBasicForm = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Basic Formula Conversion</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Brief description of this unit"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="formula">Conversion Formula *</Label>
        <Input
          id="formula"
          placeholder="e.g., x * 2.54 (where x is the input value)"
          value={formData.formula}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, formula: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Use 'x' to represent the input value. Examples: x * 2.54, x / 100, x +
          273.15
        </p>
      </div>
    </div>
  );

  const renderJavaScriptForm = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">JavaScript Conversion</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestCode}
          className="ml-auto"
        >
          <Play className="h-3 w-3 mr-1" />
          Test
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Brief description of this unit"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="js-code">JavaScript Code *</Label>
        <Textarea
          id="js-code"
          className="font-mono text-sm h-24 resize-none"
          value={jsCode}
          onChange={(e) => setJsCode(e.target.value)}
        />
      </div>
    </div>
  );

  const renderAIForm = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">AI Generate Conversion</h3>
        <Badge variant="secondary" className="ml-auto">
          <Crown className="h-3 w-3 mr-1" />
          Pro
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Brief description of this unit"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-prompt">Describe Your Conversion *</Label>
        <Textarea
          id="ai-prompt"
          placeholder="e.g., Convert cooking measurements from cups to milliliters..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          className="h-20 resize-none"
        />
        <Button
          onClick={handleGenerateAI}
          className="w-full"
          disabled={!aiPrompt.trim()}
        >
          <Zap className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      </div>

      {jsCode && jsCode.includes("AI Generated") && (
        <div className="space-y-2">
          <Label>Generated Code</Label>
          <Textarea
            value={jsCode}
            onChange={(e) => setJsCode(e.target.value)}
            className="font-mono text-sm h-20 resize-none"
          />
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Custom Conversion
          </DialogTitle>
          <DialogDescription>
            {mode === "selection"
              ? "Choose how you want to create your custom conversion unit"
              : "Fill in the details for your custom conversion unit"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {mode === "selection" && renderModeSelection()}
          {mode === "basic" && renderBasicForm()}
          {mode === "javascript" && renderJavaScriptForm()}
          {mode === "ai" && renderAIForm()}
        </div>

        {mode !== "selection" && (
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Conversion
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
