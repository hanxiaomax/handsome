import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Lightbulb } from "lucide-react";

export function KeyboardShortcuts() {
  const shortcuts = [
    { key: "Tab", description: "Navigate between inputs" },
    { key: "Enter", description: "Confirm selection in dropdowns" },
    { key: "Escape", description: "Close dropdowns/calculator" },
    { key: "Ctrl+C", description: "Copy focused result" },
    { key: "Space", description: "Open category/unit selector" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Keyboard className="h-4 w-4" />
          Keyboard Shortcuts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">
              {shortcut.description}
            </span>
            <Badge variant="secondary" className="font-mono text-xs">
              {shortcut.key}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function QuickTips() {
  const tips = [
    "Click swap button on any result to make it the input unit",
    "Use the calculator for complex calculations",
    "Focus units appear first with accent color",
    "Scientific notation appears for very large/small numbers",
    "Search units by name or symbol in dropdowns",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4" />
          Quick Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
            <span className="text-muted-foreground">{tip}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
