import {
  TreePine,
  Brackets,
  Minimize2,
  FileJson,
  Search,
  ExpandIcon,
  ShrinkIcon,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DisplayMode = "beautified" | "tree" | "compressed" | "json";

interface RightPanelToolbarProps {
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onCopy: () => void;
  onDownload: () => void;
  hasContent: boolean;
  disabled?: boolean;
}

export function RightPanelToolbar({
  displayMode,
  onDisplayModeChange,
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
  onCopy,
  onDownload,
  hasContent,
  disabled = false,
}: RightPanelToolbarProps) {
  return (
    <div className="flex items-center gap-2 h-full">
      <div className="flex items-center border rounded-md p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={displayMode === "beautified"}
                onPressedChange={() =>
                  !disabled && onDisplayModeChange("beautified")
                }
                size="sm"
                disabled={disabled}
                className={`h-6 w-6 p-0 ${
                  displayMode === "beautified"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }`}
              >
                <Brackets className="w-3 h-3" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Beautified XML</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={displayMode === "tree"}
                onPressedChange={() => !disabled && onDisplayModeChange("tree")}
                size="sm"
                disabled={disabled}
                className={`h-6 w-6 p-0 ${
                  displayMode === "tree"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }`}
              >
                <TreePine className="w-3 h-3" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tree structure</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={displayMode === "compressed"}
                onPressedChange={() =>
                  !disabled && onDisplayModeChange("compressed")
                }
                size="sm"
                disabled={disabled}
                className={`h-6 w-6 p-0 ${
                  displayMode === "compressed"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }`}
              >
                <Minimize2 className="w-3 h-3" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compressed XML (with wrapping)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={displayMode === "json"}
                onPressedChange={() => !disabled && onDisplayModeChange("json")}
                size="sm"
                disabled={disabled}
                className={`h-6 w-6 p-0 ${
                  displayMode === "json"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }`}
              >
                <FileJson className="w-3 h-3" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>JSON format</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {displayMode === "tree" && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="relative flex-1 max-w-48">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={disabled}
              className="pl-6 h-7 text-xs"
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExpandAll}
                  disabled={disabled}
                  className="h-7 w-7 p-0"
                >
                  <ExpandIcon className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand all</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCollapseAll}
                  disabled={disabled}
                  className="h-7 w-7 p-0"
                >
                  <ShrinkIcon className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Collapse all</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      {/* Add Copy/Download buttons to the right side */}
      <div className="flex items-center gap-1 ml-auto">
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
              <p>Copy result</p>
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
              <p>Download result</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
