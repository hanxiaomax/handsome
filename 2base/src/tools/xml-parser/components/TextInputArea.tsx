import { Play, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface TextInputAreaProps {
  textInput: string;
  onTextInputChange: (value: string) => void;
  onParse: () => void;
  isParsingMode: boolean;
  isLoading: boolean;
}

export function TextInputArea({
  textInput,
  onTextInputChange,
  onParse,
  isParsingMode,
  isLoading,
}: TextInputAreaProps) {
  // Check if content looks like XML for real-time feedback
  const looksLikeXML =
    textInput.trim().startsWith("<") && textInput.includes(">");
  const hasContent = textInput.trim().length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Compact status indicator for real-time parsing */}
      {!isParsingMode && hasContent && (
        <div className="flex items-center gap-2 mb-2 text-xs px-1">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-muted-foreground">Real-time parsing</span>
          {looksLikeXML && (
            <Badge variant="outline" className="text-xs py-0 px-1 h-4">
              XML
            </Badge>
          )}
        </div>
      )}

      {/* Full height text input area */}
      <div className="flex-1 relative">
        <Textarea
          placeholder='Paste or type your XML content here...

Examples:
<?xml version="1.0"?>
&lt;root&gt;
  &lt;element&gt;content&lt;/element&gt;
&lt;/root&gt;

Real-time parsing will start automatically when auto-parse is enabled.'
          value={textInput}
          onChange={(e) => onTextInputChange(e.target.value)}
          className="absolute inset-0 font-mono text-sm border-border resize-none focus-visible:ring-1 focus-visible:ring-primary"
          style={{
            minHeight: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Compact parse button for manual mode */}
      {textInput.trim() && isParsingMode && (
        <div className="flex justify-between items-center mt-2 pt-2 border-t flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {looksLikeXML ? (
              <span>✓ XML content detected</span>
            ) : (
              <span>⚠ Not valid XML</span>
            )}
          </div>
          <Button
            onClick={onParse}
            size="sm"
            className="flex items-center gap-1 h-7"
            disabled={isLoading || !looksLikeXML}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            Parse
          </Button>
        </div>
      )}

      {/* Compact real-time parsing feedback */}
      {!isParsingMode && isLoading && (
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground px-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Parsing...</span>
        </div>
      )}
    </div>
  );
}
