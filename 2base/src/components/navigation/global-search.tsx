import { useState, useEffect } from "react";
import { Search, Wrench, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { tools } from "@/data/tools";
import { documents } from "@/data/documents";
import type { ToolInfo } from "@/types/tool";
import type { DocumentInfo } from "@/data/documents";

interface GlobalSearchProps {
  className?: string;
  width?: "sm" | "md" | "lg" | "xl" | "full" | string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  showShortcut?: boolean;
}

export function GlobalSearch({
  className,
  width = "md",
  size = "sm",
  placeholder,
  showShortcut = true,
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const searchResults = useGlobalSearch(tools, documents, query, {
    threshold: 0.4,
    limit: 8,
  });

  // 监听快捷键
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleToolSelect = (tool: ToolInfo) => {
    setOpen(false);
    setQuery("");
    navigate(tool.path);
  };

  const handleDocumentSelect = (document: DocumentInfo) => {
    setOpen(false);
    setQuery("");
    // 在新标签页打开文档
    window.open(document.path, "_blank");
  };

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  // 根据 width 属性生成宽度类名
  const getWidthClass = () => {
    if (typeof width === "string" && width.includes("w-")) {
      // 如果是自定义宽度类，直接返回
      return width;
    }

    switch (width) {
      case "sm":
        return "w-48";
      case "md":
        return "w-64";
      case "lg":
        return "w-80";
      case "xl":
        return "w-96";
      case "full":
        return "w-full";
      default:
        // 如果是自定义值（如 "70%"），作为内联样式
        return "";
    }
  };

  // 根据 size 属性生成尺寸类名
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 text-sm";
      case "md":
        return "h-10 text-base";
      case "lg":
        return "h-12 text-lg";
      default:
        return "h-8 text-sm";
    }
  };

  // 将自定义 size 映射到 Button 组件支持的 size
  const getButtonSize = () => {
    switch (size) {
      case "lg":
        return "lg";
      case "md":
        return "default";
      case "sm":
      default:
        return "sm";
    }
  };

  // 生成占位符文本
  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    switch (size) {
      case "lg":
        return "Search tools and documentation...";
      case "md":
        return "Search tools & docs...";
      default:
        return "Search...";
    }
  };

  const widthClass = getWidthClass();
  const sizeClasses = getSizeClasses();
  const buttonSize = getButtonSize();
  const dynamicPlaceholder = getPlaceholder();

  // 处理自定义宽度（百分比或其他CSS值）
  const customStyle = !widthClass && typeof width === "string" ? { width } : {};

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        size={buttonSize}
        className={`relative ${widthClass} ${sizeClasses} justify-start rounded-md bg-background font-normal text-muted-foreground shadow-none ${
          showShortcut ? "sm:pr-12" : "pr-4"
        } ${className || ""}`}
        style={customStyle}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span
          className={`${
            size === "lg" ? "inline-flex" : "hidden lg:inline-flex"
          }`}
        >
          {dynamicPlaceholder}
        </span>
        {size !== "lg" && (
          <span className="inline-flex lg:hidden">Search...</span>
        )}
        {showShortcut && (
          <kbd className="pointer-events-none absolute right-1.5 top-1/2 transform -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </Button>

      {/* Search Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search tools and documentation..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query
              ? "No results found."
              : "Type to search tools and documentation..."}
          </CommandEmpty>

          {/* Tools Results */}
          {searchResults.tools.length > 0 && (
            <>
              <CommandGroup heading="Tools">
                {searchResults.tools.map((result) => {
                  const tool = result.item as ToolInfo;
                  return (
                    <CommandItem
                      key={tool.id}
                      value={`tool-${tool.id}`}
                      onSelect={() => runCommand(() => handleToolSelect(tool))}
                      className="flex items-center gap-2 px-4 py-3"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-sm border bg-background">
                        <tool.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tool.name}</span>
                          {tool.version && (
                            <Badge variant="secondary" className="text-xs">
                              v{tool.version}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {tool.description}
                        </p>
                      </div>
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {searchResults.documents.length > 0 && <CommandSeparator />}
            </>
          )}

          {/* Documents Results */}
          {searchResults.documents.length > 0 && (
            <CommandGroup heading="Documentation">
              {searchResults.documents.map((result) => {
                const doc = result.item as DocumentInfo;
                return (
                  <CommandItem
                    key={doc.id}
                    value={`doc-${doc.id}`}
                    onSelect={() => runCommand(() => handleDocumentSelect(doc))}
                    className="flex items-center gap-2 px-4 py-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-sm border bg-background">
                      <doc.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{doc.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {doc.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.description}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Quick Actions */}
          {!query && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Quick Actions">
                <CommandItem
                  onSelect={() => runCommand(() => navigate("/"))}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse All Tools</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => navigate("/favorites"))}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Search className="h-4 w-4" />
                  <span>View Favorites</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
