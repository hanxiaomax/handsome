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
}

export function GlobalSearch({ className }: GlobalSearchProps) {
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

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        className={`relative h-8 w-full justify-start rounded-md bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64 ${className}`}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search tools & docs...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
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
