import { ScrollArea } from "@/components/ui/scroll-area";
import { TreePine, Loader2 } from "lucide-react";
import type { XMLElement } from "../types";

interface TreeViewProps {
  elements: XMLElement[];
  expandedNodes: Set<string>;
  selectedElement: XMLElement | null;
  isLoading: boolean;
  onElementSelect: (element: XMLElement) => void;
  onNodeToggle: (elementId: string) => void;
}

export function TreeView({
  elements,
  expandedNodes,
  selectedElement,
  isLoading,
  onElementSelect,
  onNodeToggle,
}: TreeViewProps) {
  const renderTreeNode = (element: XMLElement, depth: number = 0) => {
    const isExpanded = expandedNodes.has(element.id);
    const hasChildren =
      element.hasChildren && element.children && element.children.length > 0;
    const isSelected = selectedElement?.id === element.id;

    return (
      <div key={element.id}>
        <div
          className={`flex items-center gap-2 py-1 px-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors ${
            isSelected ? "bg-primary/10 border-l-2 border-primary" : ""
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onElementSelect(element)}
        >
          {/* Tree expansion indicator */}
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren ? (
              <button
                className="w-3 h-3 flex items-center justify-center hover:bg-muted rounded-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeToggle(element.id);
                }}
              >
                {isExpanded ? "−" : "+"}
              </button>
            ) : (
              <span className="w-3 h-3 flex items-center justify-center text-muted-foreground">
                •
              </span>
            )}
          </div>

          {/* Element name */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span
              className={`truncate ${
                element.type === "ELEMENT"
                  ? "font-medium text-blue-600"
                  : "text-muted-foreground"
              }`}
            >
              {element.name}
            </span>

            {/* Children count for expanded nodes */}
            {hasChildren && (
              <span className="text-xs text-muted-foreground shrink-0">
                ({element.children?.length})
              </span>
            )}
          </div>

          {/* Element type indicator */}
          {element.type !== "ELEMENT" && (
            <span className="text-xs text-muted-foreground uppercase px-1 py-0.5 bg-muted/50 rounded">
              {element.type}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && element.children && (
          <div>
            {element.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (elements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Parsing XML file...</p>
          </div>
        ) : (
          <>
            <TreePine className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Parse the XML file to view tree structure</p>
          </>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 space-y-0">
        {elements.slice(0, 100).map((element) => renderTreeNode(element, 0))}
      </div>
    </ScrollArea>
  );
}
