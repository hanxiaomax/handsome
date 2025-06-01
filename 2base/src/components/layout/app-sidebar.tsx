import { useState } from "react";
import { Search, Wrench, Home, Heart, ChevronRight } from "lucide-react";
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
  useSidebar,
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
import { useToolSearch } from "@/hooks/use-tool-search";
import { ToolFilters, type FilterOptions } from "@/components/layout/tool-filters";
import type { ToolInfo } from "@/types/tool";
import { getToolVersionInfo } from "@/lib/tool-utils";
import { useFavorites } from "@/contexts/favorites-context";

interface AppSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTool: string | null;
  onToolSelect: (toolId: string) => void;
  onNavigateHome: () => void;
  onNavigateToFavorites: () => void;
}

export function AppSidebar({
  searchQuery,
  onSearchChange,
  selectedTool,
  onToolSelect,
  onNavigateHome,
  onNavigateToFavorites,
}: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { favorites } = useFavorites();
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    pricing: [],
    isNew: null,
    requiresBackend: null,
  });

  const { results: filteredTools, hasQuery, hasFilters, filteredCount } = useToolSearch({
    tools,
    searchQuery,
    filters,
  });

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
    
    // Close mobile sidebar when tool is selected
    if (isMobile) {
      setOpenMobile(false);
    }
  };



  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary rounded-lg">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
                          <h1 className="font-bold text-lg">Tools2Go</h1>
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

        {/* Filters */}
        <ToolFilters filters={filters} onFiltersChange={setFilters} />

        {(hasQuery || hasFilters) && (
          <p className="text-xs text-muted-foreground">
            Found {filteredCount} tool{filteredCount !== 1 ? "s" : ""}
            {hasFilters && !hasQuery && " matching filters"}
            {hasQuery && !hasFilters && ` for "${searchQuery}"`}
            {hasQuery && hasFilters && ` for "${searchQuery}" with filters`}
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>


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
        {Object.keys(groupedTools).length === 0 && (
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
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={onNavigateToFavorites}
            className="w-full justify-start"
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorites
            {favorites.length > 0 && (
              <Badge
                variant="destructive"
                className="ml-auto text-xs"
              >
                {favorites.length}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onNavigateHome}
            className="w-full justify-start"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
