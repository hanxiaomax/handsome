import { useState, useCallback } from "react";

// Cookie管理工具函数
const COOKIE_NAME = "tools2go_viewed_tools";
const COOKIE_EXPIRES_DAYS = 365; // 1年

/**
 * 获取已查看过的工具列表
 */
function getViewedTools(): string[] {
  if (typeof document === "undefined") return [];

  try {
    const cookies = document.cookie.split(";");
    const toolsCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );

    if (toolsCookie) {
      const value = toolsCookie.split("=")[1];
      return JSON.parse(decodeURIComponent(value));
    }
  } catch (error) {
    console.warn("Failed to parse viewed tools cookie:", error);
  }

  return [];
}

/**
 * 保存已查看过的工具列表
 */
function saveViewedTools(toolIds: string[]): void {
  if (typeof document === "undefined") return;

  try {
    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_EXPIRES_DAYS);

    const value = encodeURIComponent(JSON.stringify(toolIds));
    document.cookie = `${COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.warn("Failed to save viewed tools cookie:", error);
  }
}

/**
 * 工具介绍管理Hook
 */
export function useToolIntro() {
  const [viewedTools, setViewedTools] = useState<string[]>(() =>
    getViewedTools()
  );

  /**
   * 检查工具是否已被查看过
   */
  const isToolViewed = useCallback(
    (toolId: string): boolean => {
      return viewedTools.includes(toolId);
    },
    [viewedTools]
  );

  /**
   * 标记工具为已查看
   */
  const markToolAsViewed = useCallback((toolId: string): void => {
    setViewedTools((prev) => {
      if (prev.includes(toolId)) {
        return prev;
      }

      const updated = [...prev, toolId];
      saveViewedTools(updated);
      return updated;
    });
  }, []);

  /**
   * 检查是否应该显示工具介绍dialog
   * 只有在工具未被查看过时才显示
   */
  const shouldShowIntro = useCallback(
    (toolId: string): boolean => {
      return !isToolViewed(toolId);
    },
    [isToolViewed]
  );

  /**
   * 清除所有已查看记录 (用于调试或重置)
   */
  const clearViewedTools = useCallback((): void => {
    setViewedTools([]);
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }, []);

  /**
   * 处理工具点击事件
   * 返回是否应该显示介绍dialog
   */
  const handleToolClick = useCallback(
    (toolId: string): boolean => {
      const shouldShow = shouldShowIntro(toolId);
      if (shouldShow) {
        markToolAsViewed(toolId);
      }
      return shouldShow;
    },
    [shouldShowIntro, markToolAsViewed]
  );

  return {
    isToolViewed,
    markToolAsViewed,
    shouldShowIntro,
    clearViewedTools,
    handleToolClick,
    viewedToolsCount: viewedTools.length,
  };
}
