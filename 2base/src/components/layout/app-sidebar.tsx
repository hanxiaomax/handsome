import { Search, Wrench } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { tools, categories } from "@/data/tools";
import type { ToolInfo } from "@/types/tool";

interface AppSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTool: string | null;
  onToolSelect: (toolId: string) => void;
}

export function AppSidebar({
  searchQuery,
  onSearchChange,
  selectedTool,
  onToolSelect,
}: AppSidebarProps) {
  // Filter tools based on search query
  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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
      };
    }
    return acc;
  }, {} as Record<string, { name: string; tools: ToolInfo[] }>);

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
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(groupedTools).map(([categoryId, categoryData]) => (
          <SidebarGroup key={categoryId}>
            <SidebarGroupLabel>{categoryData.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {categoryData.tools.map((tool) => (
                  <SidebarMenuItem key={tool.id}>
                    <SidebarMenuButton
                      onClick={() => onToolSelect(tool.id)}
                      isActive={selectedTool === tool.id}
                      className="w-full justify-start"
                    >
                      <tool.icon className="h-4 w-4 mr-2" />
                      <span className="truncate">{tool.name}</span>
                      {tool.requiresBackend && (
                        <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                          API
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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
    </Sidebar>
  );
}
