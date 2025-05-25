import { useMemo } from "react";
import Fuse from "fuse.js";
import type { ToolInfo } from "@/types/tool";

interface UseFuzzySearchOptions {
  threshold?: number;
  keys?: string[];
}

export function useFuzzySearch(
  items: ToolInfo[],
  query: string,
  options: UseFuzzySearchOptions = {}
) {
  const {
    threshold = 0.3, // Lower threshold = more strict matching
    keys = ["name", "description", "tags", "category"],
  } = options;

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys,
      threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
      findAllMatches: true,
    });
  }, [items, threshold, keys]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return items.map((item) => ({
        item,
        score: 0,
        matches: [],
      }));
    }

    return fuse.search(query).map((result) => ({
      item: result.item,
      score: result.score || 0,
      matches: result.matches || [],
    }));
  }, [fuse, query, items]);

  return {
    results: results.map((r) => r.item),
    detailedResults: results,
    hasQuery: query.trim().length > 0,
  };
}
