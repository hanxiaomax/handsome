import {
  FileText,
  Upload,
  Play,
  Copy,
  Download,
  Trash2,
  Loader2,
  Hash as LineNumbers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeftPanelToolbarProps {
  parserState: {
    status: "idle" | "parsing" | "loading" | "complete" | "error";
    progress: number;
  };
  showLineNumbers: boolean;
  onToggleLineNumbers: (value: boolean) => void;
  autoParseEnabled: boolean;
  onToggleAutoParse: (value: boolean) => void;
  autoParseDisabled?: boolean;
  canParse: boolean;
  onParse: () => void;
  onCopy: () => void;
  onDownload: () => void;
  canClear: boolean;
  onClear: () => void;
  hasContent: boolean;
  onFileSelect: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LeftPanelToolbar({
  parserState,
  showLineNumbers,
  onToggleLineNumbers,
  autoParseEnabled,
  onToggleAutoParse,
  autoParseDisabled,
  canParse,
  onParse,
  onCopy,
  onDownload,
  canClear,
  onClear,
  hasContent,
  onFileSelect,
  onFileInputChange,
}: LeftPanelToolbarProps) {
  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span className="text-sm">XML Editor</span>
        </div>

        {parserState.status === "parsing" && (
          <div className="flex items-center gap-2 ml-4">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Parsing... {Math.round(parserState.progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-1">
        {/* File upload button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <input
                  id="file-input"
                  type="file"
                  accept=".xml,.arxml,.xsd,.svg"
                  onChange={onFileInputChange}
                  className="hidden"
                />
                <Button
                  onClick={onFileSelect}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <Upload className="w-3 h-3" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload XML file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6" />

        {/* Line numbers toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={showLineNumbers}
                onPressedChange={onToggleLineNumbers}
                size="sm"
                className={`h-7 w-7 p-0 ${
                  showLineNumbers
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : ""
                }`}
              >
                <LineNumbers className="w-3 h-3" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle line numbers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Auto parse toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={autoParseEnabled}
                onPressedChange={onToggleAutoParse}
                disabled={autoParseDisabled}
                size="sm"
                className={`h-7 w-7 p-0 ${
                  autoParseEnabled
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : ""
                }`}
              >
                <Zap className="w-3 h-3" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {autoParseDisabled
                  ? "Auto parse disabled (content edited)"
                  : "Auto parse on text change"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Manual parse button */}
        {!autoParseEnabled && canParse && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onParse}
                  size="sm"
                  className="h-7 px-2"
                  disabled={parserState.status === "parsing"}
                >
                  {parserState.status === "parsing" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Parse XML text</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Separator orientation="vertical" className="h-6" />

        {/* Copy button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onCopy}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={!hasContent}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Download button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onDownload}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={!hasContent}
              >
                <Download className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6" />

        {/* Clear button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onClear}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={!canClear}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
