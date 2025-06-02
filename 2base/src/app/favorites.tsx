"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { GlobalSearch } from "@/components/navigation/global-search";
import { ToolDetail } from "@/components/tools/tool-detail";
import { ToolInfoCard } from "@/components/tools/tool-info-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { tools } from "@/data/tools";
import { useFavorites } from "@/contexts/favorites-context";
import { Link } from "react-router-dom";

function FavoritesContent() {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const { favorites } = useFavorites();

  const handleUseTool = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    if (tool) {
      // Close mobile sidebar when navigating to tool
      if (isMobile) {
        setOpenMobile(false);
      }
      navigate(tool.path);
    }
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  const favoriteTools = tools.filter((tool) => favorites.includes(tool.id));

  return (
    <>
      <AppSidebar
        selectedTool={selectedTool}
        onNavigateHome={handleNavigateHome}
      />
      <SidebarInset>
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {selectedToolData ? selectedToolData.name : "Favorite Tools"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedToolData
                  ? "Tool Details"
                  : favoriteTools.length > 0
                  ? `${favoriteTools.length} favorite tool${
                      favoriteTools.length !== 1 ? "s" : ""
                    }`
                  : "No favorite tools yet"}
              </p>
            </div>
            {/* Global Search - 全局搜索框 */}
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {selectedToolData ? (
            <ToolDetail tool={selectedToolData} onUseTool={handleUseTool} />
          ) : (
            <div className="container mx-auto px-4 py-8">
              {favoriteTools.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Favorite Tools
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start exploring tools and add them to your favorites by
                      clicking the heart icon.
                    </p>
                    <Link to="/">
                      <Button>Browse Tools</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favoriteTools.map((tool) => (
                    <ToolInfoCard
                      key={tool.id}
                      tool={tool}
                      onUseTool={handleUseTool}
                      showFavoriteButton={true}
                      compact={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </>
  );
}

export default function FavoritesPage() {
  return (
    <SidebarProvider>
      <div
        className="flex min-h-svh w-full"
        style={
          {
            "--sidebar-width": "20rem",
          } as React.CSSProperties
        }
      >
        <FavoritesContent />
      </div>
    </SidebarProvider>
  );
}
