import { useMemo } from "react";
import type { ToolInfo } from "@/types/tool";
import type { FilterOptions } from "@/components/layout/tool-filters";
import { getToolVersionInfo } from "@/lib/tool-utils";

interface UseToolSearchOptions {
  tools: ToolInfo[];
  searchQuery: string;
  filters: FilterOptions;
}

export function useToolSearch({
  tools,
  searchQuery,
  filters,
}: UseToolSearchOptions) {
  const filteredTools = useMemo(() => {
    let result = tools;

    // Apply text search first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((tool) => {
        return (
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          tool.category.toLowerCase().includes(query)
        );
      });
    }

    // Apply category filters
    if (filters.categories.length > 0) {
      result = result.filter((tool) =>
        filters.categories.includes(tool.category)
      );
    }

    // Apply pricing filters
    if (filters.pricing.length > 0) {
      result = result.filter((tool) => filters.pricing.includes(tool.pricing));
    }

    // Apply new status filter
    if (filters.isNew !== null) {
      result = result.filter((tool) => {
        const versionInfo = getToolVersionInfo(tool);
        return versionInfo.isNew === filters.isNew;
      });
    }

    // Apply backend requirement filter
    if (filters.requiresBackend !== null) {
      result = result.filter(
        (tool) => tool.requiresBackend === filters.requiresBackend
      );
    }

    return result;
  }, [tools, searchQuery, filters]);

  const hasQuery = searchQuery.trim().length > 0;
  const hasFilters =
    filters.categories.length > 0 ||
    filters.pricing.length > 0 ||
    filters.isNew !== null ||
    filters.requiresBackend !== null;

  return {
    results: filteredTools,
    hasQuery,
    hasFilters,
    totalCount: tools.length,
    filteredCount: filteredTools.length,
  };
}
