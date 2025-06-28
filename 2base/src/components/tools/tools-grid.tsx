import { useState } from "react";
import { Search, Star, Grid3X3, List } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tools, categories } from "@/data/tools";
import { useToolSearch } from "@/hooks/use-tool-search";
import { useToolIntro } from "@/hooks/use-tool-intro";
import type { ToolInfo } from "@/types/tool";
import { getToolVersionInfo } from "@/lib/tool-utils";
import { useFavoritesList, useFavoriteActions } from "@/stores/favorites-store";

interface ToolsGridProps {
  onUseTool: (toolId: string) => void;
  selectedTool?: string | null;
}

export function ToolsGrid({ onUseTool, selectedTool }: ToolsGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDialogTool, setSelectedDialogTool] = useState<ToolInfo | null>(
    null
  );

  const favorites = useFavoritesList();
  const { toggleFavorite } = useFavoriteActions();
  const { handleToolClick: handleToolIntroClick } = useToolIntro();

  const {
    results: filteredTools,
    hasQuery,
    filteredCount,
  } = useToolSearch({
    tools,
    searchQuery,
    filters: {
      categories: selectedCategory === "all" ? [] : [selectedCategory],
      pricing: [],
      isNew: null,
      requiresBackend: null,
    },
  });

  // Group tools by category for layout
  const groupedTools = categories.reduce((acc, category) => {
    if (category.id === "all") return acc;

    const categoryTools = filteredTools.filter(
      (tool) => tool.category === category.id
    );
    if (categoryTools.length > 0) {
      acc[category.id] = {
        name: category.name,
        tools: categoryTools,
        count: categoryTools.length,
      };
    }
    return acc;
  }, {} as Record<string, { name: string; tools: ToolInfo[]; count: number }>);

  const handleToolClick = (tool: ToolInfo) => {
    const shouldShowIntro = handleToolIntroClick(tool.id);

    if (shouldShowIntro) {
      setSelectedDialogTool(tool);
    } else {
      onUseTool(tool.id);
    }
  };

  const handleFavoriteClick = (tool: ToolInfo, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleFavorite(tool.id);
  };

  const renderGridView = (tools: ToolInfo[]) => (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(min(350px, 100%), 1fr))",
      }}
    >
      {tools.map((tool) => {
        const versionInfo = getToolVersionInfo(tool);
        const isFavorite = favorites.includes(tool.id);
        const isSelected = selectedTool === tool.id;

        return (
          <Card
            key={tool.id}
            className={`relative cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 ${
              isSelected ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleToolClick(tool)}
          >
            {/* Corner Status Badge */}
            <div className="absolute top-3 right-3 z-10">
              {versionInfo.isNew && (
                <Badge className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1">
                  New
                </Badge>
              )}
              {tool.requiresBackend && !versionInfo.isNew && (
                <Badge className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1">
                  API
                </Badge>
              )}
            </div>

            {/* Horizontal Layout Content */}
            <div className="flex items-start gap-3 p-4 min-h-[120px]">
              {/* Tool Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* Tool Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                      {tool.name}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleFavoriteClick(tool, e)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        isFavorite
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderListView = (tools: ToolInfo[]) => (
    <div className="space-y-2">
      {tools.map((tool) => {
        const versionInfo = getToolVersionInfo(tool);
        const isFavorite = favorites.includes(tool.id);
        const isSelected = selectedTool === tool.id;

        return (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
              isSelected ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleToolClick(tool)}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Tool Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* Tool Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-sm break-words leading-tight">
                    {tool.name}
                  </h3>
                  {versionInfo.isNew && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                      Live
                    </Badge>
                  )}
                  {tool.requiresBackend && !versionInfo.isNew && (
                    <Badge className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5">
                      API
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {tool.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleFavoriteClick(tool, e)}
                  className="h-8 w-8 p-0"
                >
                  <Star
                    className={`h-4 w-4 ${
                      isFavorite
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Tools Grid Header */}
      <div id="tools-grid-header" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {filteredCount} tool{filteredCount !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div id="search-filter-bar" className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Select */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                  {category.id !== "all" && ` (${category.count})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => {
              if (value && (value === "grid" || value === "list")) {
                setViewMode(value);
              }
            }}
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" size="sm">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Search Results Summary */}
        {(hasQuery || selectedCategory !== "all") && (
          <div className="text-sm text-muted-foreground">
            {hasQuery && `Results for "${searchQuery}"`}
            {selectedCategory !== "all" &&
              ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
          </div>
        )}
      </div>

      {/* Tools by Category */}
      <div id="tools-by-category" className="space-y-8">
        {Object.entries(groupedTools).map(([categoryId, categoryData]) => (
          <div key={categoryId} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-foreground">
                {categoryData.name}
              </h3>
              <Badge variant="outline" className="text-sm">
                {categoryData.count} tool{categoryData.count !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Category Tools Display */}
            {viewMode === "grid"
              ? renderGridView(categoryData.tools)
              : renderListView(categoryData.tools)}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(groupedTools).length === 0 && (
        <div id="empty-state" className="text-center py-12">
          <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No tools found</h3>
          <p className="text-muted-foreground mb-4">
            {hasQuery
              ? `No tools match "${searchQuery}"`
              : "Try adjusting your search or filters"}
          </p>
          {(hasQuery || selectedCategory !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Tool Details Dialog */}
      <Dialog
        open={!!selectedDialogTool}
        onOpenChange={() => setSelectedDialogTool(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedDialogTool && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <selectedDialogTool.icon className="h-6 w-6 text-primary" />
                  </div>
                  {selectedDialogTool.name}
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {selectedDialogTool.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Tool Tags */}
                {selectedDialogTool.tags && selectedDialogTool.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDialogTool.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tool Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="text-muted-foreground capitalize">
                      {selectedDialogTool.category}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Availability:</span>
                    <p className="text-muted-foreground">
                      {selectedDialogTool.requiresBackend
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      onUseTool(selectedDialogTool.id);
                      setSelectedDialogTool(null);
                    }}
                    className="flex-1"
                  >
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDialogTool(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
