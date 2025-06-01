import { useMemo } from "react";
import Fuse, { type FuseResultMatch } from "fuse.js";
import type { ToolInfo } from "@/types/tool";
import type { DocumentInfo } from "@/data/documents";

export interface SearchResult {
  type: "tool" | "document";
  item: ToolInfo | DocumentInfo;
  score: number;
  matches: readonly FuseResultMatch[];
}

interface UseGlobalSearchOptions {
  threshold?: number;
  limit?: number;
}

export function useGlobalSearch(
  tools: ToolInfo[],
  documents: DocumentInfo[],
  query: string,
  options: UseGlobalSearchOptions = {}
) {
  const { threshold = 0.3, limit = 10 } = options;

  // 为工具创建Fuse实例
  const toolsFuse = useMemo(() => {
    return new Fuse(tools, {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "tags", weight: 0.2 },
        { name: "category", weight: 0.1 },
      ],
      threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
      findAllMatches: true,
    });
  }, [tools, threshold]);

  // 为文档创建Fuse实例
  const documentsFuse = useMemo(() => {
    return new Fuse(documents, {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "tags", weight: 0.2 },
        { name: "content", weight: 0.1 },
      ],
      threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
      findAllMatches: true,
    });
  }, [documents, threshold]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        tools: [],
        documents: [],
        all: [],
        hasQuery: false,
        totalCount: 0,
      };
    }

    // 搜索工具
    const toolResults = toolsFuse.search(query).map(
      (result): SearchResult => ({
        type: "tool",
        item: result.item,
        score: result.score || 0,
        matches: result.matches || [],
      })
    );

    // 搜索文档
    const documentResults = documentsFuse.search(query).map(
      (result): SearchResult => ({
        type: "document",
        item: result.item,
        score: result.score || 0,
        matches: result.matches || [],
      })
    );

    // 合并结果并按分数排序
    const allResults = [...toolResults, ...documentResults]
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);

    return {
      tools: toolResults.slice(0, Math.ceil(limit / 2)),
      documents: documentResults.slice(0, Math.ceil(limit / 2)),
      all: allResults,
      hasQuery: query.trim().length > 0,
      totalCount: allResults.length,
    };
  }, [toolsFuse, documentsFuse, query, limit]);

  return results;
}
