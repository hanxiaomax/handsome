import { Search, Wrench, Home, Star, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { tools, categories } from "@/data/tools";
import { useFavorites } from "@/contexts/favorites-context";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import type { ToolInfo } from "@/types/tool";
import { getToolVersionInfo } from "@/lib/tool-utils";

interface AppSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTool: string | null;
  onToolSelect: (toolId: string) => void;
  onNavigateHome: () => void;
}

export function AppSidebar({
  searchQuery,
  onSearchChange,
  selectedTool,
  onToolSelect,
  onNavigateHome,
}: AppSidebarProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const { results: filteredTools, hasQuery } = useFuzzySearch(
    tools,
    searchQuery
  );

  // Get favorite tools
  const favoriteTools = tools.filter((tool) => favorites.includes(tool.id));

  // Group tools by category
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

  const handleToolClick = (toolId: string, event: React.MouseEvent) => {
    // Prevent event bubbling to collapsible trigger
    event.stopPropagation();
    onToolSelect(toolId);
  };

  const handleRemoveFromFavorites = (
    toolId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    toggleFavorite(toolId);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary rounded-lg">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Tool Suite</h1>
            <p className="text-xs text-muted-foreground">Developer Tools</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasQuery && (
          <p className="text-xs text-muted-foreground mt-1">
            Found {filteredTools.length} tool
            {filteredTools.length !== 1 ? "s" : ""}
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Favorites Group */}
        {favoriteTools.length > 0 && (
          <Collapsible defaultOpen>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group/collapsible hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer">
                  <Star className="h-4 w-4 mr-2" />
                  Favorites ({favoriteTools.length})
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {favoriteTools.map((tool) => {
                      const versionInfo = getToolVersionInfo(tool);
                      return (
                        <SidebarMenuItem key={`fav-${tool.id}`}>
                          <SidebarMenuButton
                            onClick={(e) => handleToolClick(tool.id, e)}
                            isActive={selectedTool === tool.id}
                            className="w-full justify-start group"
                          >
                            <tool.icon className="h-4 w-4 mr-2" />
                            <span className="truncate flex-1">{tool.name}</span>
                            {versionInfo.isNew && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-700 border-green-200 font-medium mr-1"
                              >
                                NEW
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) =>
                                handleRemoveFromFavorites(tool.id, e)
                              }
                            >
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                            </Button>
                            {tool.requiresBackend && (
                              <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                                API
                              </span>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Category Groups */}
        {Object.entries(groupedTools).map(([categoryId, categoryData]) => (
          <Collapsible key={categoryId} defaultOpen>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group/collapsible hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer">
                  {categoryData.name} ({categoryData.count})
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {categoryData.tools.map((tool) => {
                      const versionInfo = getToolVersionInfo(tool);
                      return (
                        <SidebarMenuItem key={tool.id}>
                          <SidebarMenuButton
                            onClick={(e) => handleToolClick(tool.id, e)}
                            isActive={selectedTool === tool.id}
                            className="w-full justify-start"
                          >
                            <tool.icon className="h-4 w-4 mr-2" />
                            <span className="truncate flex-1">{tool.name}</span>
                            {versionInfo.isNew && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-700 border-green-200 font-medium mr-1"
                              >
                                NEW
                              </Badge>
                            )}
                            {tool.requiresBackend && (
                              <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                                API
                              </span>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}

        {/* Show message when no tools found */}
        {Object.keys(groupedTools).length === 0 && favoriteTools.length === 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="p-4 text-center text-muted-foreground text-sm">
                {searchQuery
                  ? `No tools found for "${searchQuery}"`
                  : "No tools available"}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          onClick={onNavigateHome}
          className="w-full justify-start"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
