import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, Info, Star } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import type { ToolInfo } from "@/types/tool";

interface ToolDetailProps {
  tool: ToolInfo;
  onUseTool: (toolId: string) => void;
}

export function ToolDetail({ tool, onUseTool }: ToolDetailProps) {
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleToggleFavorite = () => {
    toggleFavorite(tool.id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tool Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <tool.icon className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{tool.name}</h1>
            {tool.requiresBackend && (
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-200"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Requires API
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg">{tool.description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => onUseTool(tool.id)}
          size="lg"
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Use Tool
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleToggleFavorite}
          className="flex items-center gap-2"
        >
          <Star
            className={`h-4 w-4 ${
              isFavorite(tool.id) ? "fill-current text-yellow-500" : ""
            }`}
          />
          {isFavorite(tool.id) ? "Remove from Favorites" : "Add to Favorites"}
        </Button>
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          View Documentation
        </Button>
      </div>

      {/* Tags */}
      {tool.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tool Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getToolFeatures(tool).map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">
                Category:
              </span>
              <p className="capitalize">{tool.category}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Processing:
              </span>
              <p>{tool.requiresBackend ? "Server-side" : "Client-side"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Privacy:
              </span>
              <p>
                {tool.requiresBackend
                  ? "Data sent to server"
                  : "All data stays local"}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Offline Support:
              </span>
              <p>
                {tool.requiresBackend ? "Requires internet" : "Works offline"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getUseCases(tool).map((useCase, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm">{useCase}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get tool-specific features
function getToolFeatures(tool: ToolInfo): string[] {
  switch (tool.id) {
    case "programmer-calculator":
      return [
        "Multi-base conversion (Binary, Octal, Decimal, Hexadecimal)",
        "Bitwise operations (AND, OR, XOR, NOT, Shift)",
        "Interactive bit visualization and manipulation",
        "Scientific functions (trigonometry, logarithms)",
        "Memory operations (M+, M-, MR, MC)",
        "Keyboard shortcuts for efficient input",
        "Support for different bit widths (8, 16, 32, 64)",
        "Real-time conversion between number bases",
      ];
    default:
      return [
        "Fast and efficient processing",
        "User-friendly interface",
        "Cross-platform compatibility",
        "No installation required",
      ];
  }
}

// Helper function to get tool-specific use cases
function getUseCases(tool: ToolInfo): string[] {
  switch (tool.id) {
    case "programmer-calculator":
      return [
        "Converting between different number systems for programming",
        "Performing bitwise operations for low-level programming",
        "Debugging binary data and bit manipulation",
        "Learning computer science concepts",
        "Working with embedded systems and hardware",
        "Analyzing memory layouts and data structures",
      ];
    default:
      return [
        "Daily development tasks",
        "Data processing and analysis",
        "Learning and experimentation",
        "Professional workflows",
      ];
  }
}
