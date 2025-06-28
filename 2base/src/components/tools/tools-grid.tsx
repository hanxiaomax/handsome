import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Search,
  Star,
  ExternalLink,
  ArrowUpDown,
  ChevronDown,
  Settings2,
  Filter,
  X,
  Grid3X3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tools, categories } from "@/data/tools";
import { useToolIntro } from "@/hooks/use-tool-intro";
import type { ToolInfo } from "@/types/tool";
import { getToolVersionInfo } from "@/lib/tool-utils";
import { useFavoritesList, useFavoriteActions } from "@/stores/favorites-store";

interface ToolsGridProps {
  onUseTool: (toolId: string) => void;
  selectedTool?: string | null;
}

export function ToolsGrid({ onUseTool, selectedTool }: ToolsGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDialogTool, setSelectedDialogTool] = useState<ToolInfo | null>(
    null
  );

  const favorites = useFavoritesList();
  const { toggleFavorite } = useFavoriteActions();
  const { handleToolClick: handleToolIntroClick } = useToolIntro();

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

  const handleCategoryToggle = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newSelectedCategories);

    // Update table filter
    const column = table.getColumn("category");
    if (newSelectedCategories.length === 0) {
      column?.setFilterValue(undefined);
    } else {
      column?.setFilterValue(newSelectedCategories);
    }

    // Explicitly keep dropdown open for multi-selection
    setCategoryDropdownOpen(true);
  };

  const clearAllFilters = () => {
    setGlobalFilter("");
    setSelectedCategories([]);
    const column = table.getColumn("category");
    column?.setFilterValue(undefined);
    setCategoryDropdownOpen(false);
  };

  // Define columns for the data table
  const columns: ColumnDef<ToolInfo>[] = [
    {
      accessorKey: "icon",
      header: "",
      cell: ({ row }) => {
        const tool = row.original;
        return (
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <tool.icon className="h-4 w-4 text-primary" />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium"
          >
            Tool Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const tool = row.original;
        const versionInfo = getToolVersionInfo(tool);
        const isSelected = selectedTool === tool.id;

        return (
          <div className={`space-y-1 ${isSelected ? "font-medium" : ""}`}>
            <div className="font-medium text-sm">{tool.name}</div>
            <div className="text-xs text-muted-foreground">
              {versionInfo.isNew && "NEW"} {tool.requiresBackend && "API"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const tool = row.original;
        return (
          <div className="max-w-[300px]">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-medium"
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const tool = row.original;
        return (
          <span className="text-sm capitalize text-muted-foreground">
            {tool.category}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => {
        const tool = row.original;
        const versionInfo = getToolVersionInfo(tool);
        return (
          <span className="text-xs text-muted-foreground">
            v{versionInfo.version}
          </span>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tool = row.original;
        return (
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {tool.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{tool.tags.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const tool = row.original;
        const isFavorite = favorites.includes(tool.id);

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleFavoriteClick(tool, e)}
              className="h-7 w-7 p-0"
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  isFavorite
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUseTool(tool.id);
              }}
              className="h-7 w-7 p-0"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: tools,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  // Get filtered tools from table
  const filteredTools = table
    .getFilteredRowModel()
    .rows.map((row) => row.original);

  // Group tools by category for grid view
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

  // Grid view renderer
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
                    <div className="text-xs text-muted-foreground mt-1">
                      {versionInfo.isNew && "NEW"}{" "}
                      {tool.requiresBackend && "API"}
                    </div>
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

  // List view renderer (table)
  const renderListView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const tool = row.original;
              const isSelected = selectedTool === tool.id;

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    isSelected ? "bg-muted" : ""
                  }`}
                  onClick={() => handleToolClick(tool)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No tools found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Tools Table Header */}
      <div id="tools-table-header" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tools</h2>
            <p className="text-muted-foreground">
              {table.getFilteredRowModel().rows.length} tool
              {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Global Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
            />
          </div>

          {/* Clear All Filters Button */}
          {(globalFilter || selectedCategories.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}

          {/* Category Filter */}
          <DropdownMenu
            open={categoryDropdownOpen}
            onOpenChange={setCategoryDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-48 justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>
                    {selectedCategories.length === 0
                      ? "All Categories"
                      : selectedCategories.length === 1
                      ? categories.find(
                          (cat) => cat.id === selectedCategories[0]
                        )?.name
                      : `${selectedCategories.length} categories`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {categories
                .filter((cat) => cat.id !== "all")
                .map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category.id}
                    className="capitalize"
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    onSelect={(e) => {
                      // Prevent dropdown from closing on selection
                      e.preventDefault();
                    }}
                  >
                    {category.name}
                  </DropdownMenuCheckboxItem>
                ))}
              {categories.filter((cat) => cat.id !== "all").length > 0 && <></>}
            </DropdownMenuContent>
          </DropdownMenu>

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

          {/* Column Visibility Toggle (only show in list mode) */}
          {viewMode === "list" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto hidden h-8 lg:flex"
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  View
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Tools Display */}
      {viewMode === "grid" ? (
        /* Grid View by Category */
        <div id="tools-by-category" className="space-y-8">
          {Object.entries(groupedTools).map(([categoryId, categoryData]) => (
            <div key={categoryId} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-foreground">
                  {categoryData.name}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {categoryData.count} tool{categoryData.count !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Category Tools Grid */}
              {renderGridView(categoryData.tools)}
            </div>
          ))}

          {/* Empty State for Grid */}
          {Object.keys(groupedTools).length === 0 && (
            <div id="empty-state" className="text-center py-12">
              <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              {(globalFilter || selectedCategories.length > 0) && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* List View (Table) */
        renderListView()
      )}

      {/* Pagination (only in list mode) */}
      {viewMode === "list" && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} tool
            {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""} found
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
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
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
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
                    Open Tool
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
