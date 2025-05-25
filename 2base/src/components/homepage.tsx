import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ToolCard } from "@/components/tool-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { tools } from "@/data/tools";

export function Homepage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    let filtered = tools;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((tool) => tool.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleUseTool = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    if (tool) {
      navigate(tool.path);
    }
  };

  const handleToolInfo = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    if (tool) {
      // Show tool info modal or navigate to info page
      console.log("Show info for tool:", tool.name);
      // TODO: Implement tool info display
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {selectedCategory === "all"
                    ? "All Tools"
                    : selectedCategory.charAt(0).toUpperCase() +
                      selectedCategory.slice(1) +
                      " Tools"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredTools.length} tool
                  {filteredTools.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {filteredTools.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-muted-foreground mb-2">
                  <svg
                    className="h-12 w-12 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No tools found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `No tools match "${searchQuery}"`
                    : "No tools available in this category"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onUse={handleUseTool}
                    onInfo={handleToolInfo}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
