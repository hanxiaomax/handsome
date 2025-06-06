import { Heart, Home, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tools } from "@/data/tools";
import { getToolVersionInfo } from "@/lib/tool-utils";
import { useFavorites } from "@/contexts/favorites-context";

interface AppSidebarProps {
  selectedTool: string | null;
  onNavigateHome: () => void;
}

export function AppSidebar({ selectedTool, onNavigateHome }: AppSidebarProps) {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const { favorites } = useFavorites();

  // Get favorite tools
  const favoriteTools = tools.filter((tool) => favorites.includes(tool.id));

  const handleToolClick = (toolId: string, event: React.MouseEvent) => {
    // Prevent event bubbling
    event.stopPropagation();

    // Find the tool and navigate directly to its page
    const tool = tools.find((t) => t.id === toolId);
    if (tool) {
      navigate(tool.path);
    }

    // Close mobile sidebar when tool is selected
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r">
      {/* Sidebar Header - App Logo and Title */}
      <SidebarHeader id="sidebar-header" className="p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1
              className="font-bold text-lg cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate("/")}
              title="回到首页"
            >
              Vibe Tools
            </h1>
            <p className="text-xs text-muted-foreground">
              Vibe once runs anytime
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content - Favorite Tools */}
      <SidebarContent id="sidebar-content">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium">
            My Favorites
            {favoriteTools.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {favoriteTools.length}
              </Badge>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {favoriteTools.length > 0 ? (
              <SidebarMenu>
                {favoriteTools.map((tool) => {
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
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No favorites yet</p>
                <p className="text-xs mt-1">
                  Browse tools and add your favorites by clicking the heart icon
                </p>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer - Navigation Buttons */}
      <SidebarFooter id="sidebar-footer" className="p-4"></SidebarFooter>
    </Sidebar>
  );
}
