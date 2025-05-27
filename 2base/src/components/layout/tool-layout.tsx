import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

import { useNavigate } from "react-router-dom";

interface ToolLayoutProps {
  toolName: string;
  toolDescription?: string;
  children: React.ReactNode;
}

export function ToolLayout({
  toolName,
  toolDescription,
  children,
}: ToolLayoutProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    // Navigate to the selected tool
    const toolPath = `/tools/${toolId}`;
    navigate(toolPath);
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  const handleNavigateToFavorites = () => {
    navigate("/favorites");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        <AppSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          onNavigateHome={handleNavigateHome}
          onNavigateToFavorites={handleNavigateToFavorites}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{toolName}</h2>
                {toolDescription && (
                  <p className="text-sm text-muted-foreground">
                    {toolDescription}
                  </p>
                )}
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-muted/30">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
