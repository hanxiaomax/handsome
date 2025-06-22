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

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface LeftPanelToolbarProps {
  fileInfo?: FileInfo | null;
  parserState: {
    status: "idle" | "parsing" | "loading" | "complete" | "error";
    progress: number;
  };
  showLineNumbers: boolean;
  onToggleLineNumbers: (value: boolean) => void;
  autoParseEnabled: boolean;
  onToggleAutoParse: (value: boolean) => void;
  canParse: boolean;
  onParse: () => void;
  onCopy: () => void;
  onDownload: () => void;
  canClear: boolean;
  onClear: () => void;
  hasContent: boolean;
  inputMode: "file" | "text";
}

export function LeftPanelToolbar({
  fileInfo,
  parserState,
  showLineNumbers,
  onToggleLineNumbers,
  autoParseEnabled,
  onToggleAutoParse,
  canParse,
  onParse,
  onCopy,
  onDownload,
  canClear,
  onClear,
  hasContent,
  inputMode,
}: LeftPanelToolbarProps) {
  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex items-center gap-2">
        {fileInfo ? (
          <>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{fileInfo.name}</span>
            </div>

            {parserState.status === "parsing" && (
              <div className="flex items-center gap-2 ml-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Parsing... {Math.round(parserState.progress)}%
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Upload className="w-4 h-4" />
            <span className="text-sm">
              {inputMode === "file" ? "No file selected" : "No content"}
            </span>
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={showLineNumbers}
                onPressedChange={onToggleLineNumbers}
                size="sm"
                className={`h-7 w-7 p-0 ${
                  showLineNumbers
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={autoParseEnabled}
                onPressedChange={onToggleAutoParse}
                size="sm"
                className={`h-7 w-7 p-0 ${
                  autoParseEnabled
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }`}
              >
                <Zap className="w-3 h-3" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Auto parse on file load</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
                <p>Parse XML {inputMode === "file" ? "file" : "text"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Separator orientation="vertical" className="h-6" />

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
              <p>Copy source</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
              <p>Download source</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {canClear && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onClear}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-muted/50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear {inputMode === "file" ? "file" : "text"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
    </div>
  );
}
