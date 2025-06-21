import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMinimizedToolsActions,
  useIsToolMinimized,
  useToolState,
} from "@/stores/minimized-tools-store";
import { useFavoriteActions, useIsFavorite } from "@/stores/favorites-store";
import type { CustomToolButton } from "@/components/layout/tool-layout";
import type { ToolInfo } from "@/types/tool";
import type { LucideIcon } from "lucide-react";

// 预定义的常用按钮类型
export type PresetButtonType =
  | "info"
  | "settings"
  | "refresh"
  | "download"
  | "share"
  | "copy"
  | "edit"
  | "delete"
  | "add"
  | "search"
  | "filter"
  | "sort"
  | "export"
  | "import"
  | "help"
  | "fullscreen"
  | "preview"
  | "save"
  | "reset";

// 按钮配置接口
export interface ButtonConfig {
  id: string;
  type?: PresetButtonType;
  icon?: LucideIcon;
  title?: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary";
  shortcut?: string; // 键盘快捷键
}

// 预设按钮的默认配置
const PRESET_BUTTON_CONFIGS: Record<PresetButtonType, Partial<ButtonConfig>> = {
  info: { title: "Show Info", variant: "ghost" },
  settings: { title: "Settings", variant: "ghost" },
  refresh: { title: "Refresh", variant: "ghost" },
  download: { title: "Download", variant: "ghost" },
  share: { title: "Share", variant: "ghost" },
  copy: { title: "Copy", variant: "ghost" },
  edit: { title: "Edit", variant: "ghost" },
  delete: { title: "Delete", variant: "destructive" },
  add: { title: "Add", variant: "default" },
  search: { title: "Search", variant: "ghost" },
  filter: { title: "Filter", variant: "ghost" },
  sort: { title: "Sort", variant: "ghost" },
  export: { title: "Export", variant: "ghost" },
  import: { title: "Import", variant: "ghost" },
  help: { title: "Help", variant: "ghost" },
  fullscreen: { title: "Fullscreen", variant: "ghost" },
  preview: { title: "Preview", variant: "ghost" },
  save: { title: "Save", variant: "default" },
  reset: { title: "Reset", variant: "outline" },
};

// 预设图标映射
const getPresetIcon = async (type: PresetButtonType): Promise<LucideIcon> => {
  const iconMap: Record<
    PresetButtonType,
    () => Promise<{ [key: string]: LucideIcon }>
  > = {
    info: () => import("lucide-react").then((m) => ({ Info: m.Info })),
    settings: () =>
      import("lucide-react").then((m) => ({ Settings: m.Settings })),
    refresh: () =>
      import("lucide-react").then((m) => ({ RefreshCw: m.RefreshCw })),
    download: () =>
      import("lucide-react").then((m) => ({ Download: m.Download })),
    share: () => import("lucide-react").then((m) => ({ Share2: m.Share2 })),
    copy: () => import("lucide-react").then((m) => ({ Copy: m.Copy })),
    edit: () => import("lucide-react").then((m) => ({ Edit: m.Edit })),
    delete: () => import("lucide-react").then((m) => ({ Trash2: m.Trash2 })),
    add: () => import("lucide-react").then((m) => ({ Plus: m.Plus })),
    search: () => import("lucide-react").then((m) => ({ Search: m.Search })),
    filter: () => import("lucide-react").then((m) => ({ Filter: m.Filter })),
    sort: () =>
      import("lucide-react").then((m) => ({ ArrowUpDown: m.ArrowUpDown })),
    export: () =>
      import("lucide-react").then((m) => ({ FileDown: m.FileDown })),
    import: () => import("lucide-react").then((m) => ({ FileUp: m.FileUp })),
    help: () =>
      import("lucide-react").then((m) => ({ HelpCircle: m.HelpCircle })),
    fullscreen: () =>
      import("lucide-react").then((m) => ({ Maximize: m.Maximize })),
    preview: () => import("lucide-react").then((m) => ({ Eye: m.Eye })),
    save: () => import("lucide-react").then((m) => ({ Save: m.Save })),
    reset: () =>
      import("lucide-react").then((m) => ({ RotateCcw: m.RotateCcw })),
  };

  const iconModule = await iconMap[type]();
  return Object.values(iconModule)[0];
};

// 工具按钮管理 hook
export function useToolButtons(
  toolInfo: ToolInfo,
  toolState?: Record<string, unknown>
) {
  const navigate = useNavigate();

  // 标准化的存储 hooks
  const { minimizeTool, restoreTool } = useMinimizedToolsActions();
  const { toggleFavorite } = useFavoriteActions();
  const isFavorite = useIsFavorite(toolInfo.id);
  const isMinimized = useIsToolMinimized(toolInfo.id);
  const savedState = useToolState(toolInfo.id);

  // 按钮状态管理
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);
  const [loadedIcons, setLoadedIcons] = useState<Record<string, LucideIcon>>(
    {}
  );

  // 标准按钮处理函数
  const handleMinimize = useCallback(() => {
    const stateToSave = toolState || {};
    minimizeTool(toolInfo, stateToSave);
    navigate("/tools");
  }, [toolState, minimizeTool, navigate, toolInfo]);

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(toolInfo.id);
  }, [toggleFavorite, toolInfo.id]);

  // 恢复工具状态
  const restoreToolState = useCallback(
    (onStateRestore?: (state: Record<string, unknown>) => void) => {
      if (isMinimized && savedState && onStateRestore) {
        onStateRestore(savedState);
        restoreTool(toolInfo.id);
      }
    },
    [isMinimized, savedState, restoreTool, toolInfo.id]
  );

  // 添加按钮
  const addButton = useCallback(async (config: ButtonConfig) => {
    let icon = config.icon;

    // 如果是预设类型且没有提供图标，加载预设图标
    if (config.type && !icon) {
      try {
        const presetIcon = await getPresetIcon(config.type);
        icon = presetIcon;
        setLoadedIcons((prev) => ({ ...prev, [config.id]: presetIcon }));
      } catch (error) {
        console.warn(
          `Failed to load preset icon for type: ${config.type}`,
          error
        );
      }
    }

    const buttonConfig: ButtonConfig = {
      ...PRESET_BUTTON_CONFIGS[config.type || "info"],
      ...config,
      icon,
    };

    setButtons((prev) => {
      const existingIndex = prev.findIndex((btn) => btn.id === config.id);
      if (existingIndex >= 0) {
        // 更新现有按钮
        const newButtons = [...prev];
        newButtons[existingIndex] = buttonConfig;
        return newButtons;
      } else {
        // 添加新按钮
        return [...prev, buttonConfig];
      }
    });
  }, []);

  // 移除按钮
  const removeButton = useCallback((buttonId: string) => {
    setButtons((prev) => prev.filter((btn) => btn.id !== buttonId));
  }, []);

  // 更新按钮状态
  const updateButton = useCallback(
    (buttonId: string, updates: Partial<ButtonConfig>) => {
      setButtons((prev) =>
        prev.map((btn) => (btn.id === buttonId ? { ...btn, ...updates } : btn))
      );
    },
    []
  );

  // 清空所有按钮
  const clearButtons = useCallback(() => {
    setButtons([]);
  }, []);

  // 批量添加按钮
  const addButtons = useCallback(
    async (configs: ButtonConfig[]) => {
      for (const config of configs) {
        await addButton(config);
      }
    },
    [addButton]
  );

  // 转换为 ToolLayout 需要的格式
  const customButtons: CustomToolButton[] = useMemo(() => {
    return buttons.map((btn) => ({
      id: btn.id,
      icon: btn.icon || loadedIcons[btn.id] || (() => null),
      title: btn.title || "Button",
      onClick: btn.onClick,
      isActive: btn.isActive,
      disabled: btn.disabled,
      variant: btn.variant,
    }));
  }, [buttons, loadedIcons]);

  // 预设按钮快速添加方法
  const addPresetButton = useCallback(
    async (
      type: PresetButtonType,
      onClick: () => void,
      overrides?: Partial<ButtonConfig>
    ) => {
      await addButton({
        id: `preset-${type}`,
        type,
        onClick,
        ...overrides,
      });
    },
    [addButton]
  );

  return {
    // 按钮管理
    buttons,
    customButtons,
    addButton,
    removeButton,
    updateButton,
    clearButtons,
    addButtons,
    addPresetButton,

    // 标准功能
    handleMinimize,
    handleToggleFavorite,
    restoreToolState,
    isFavorite,
    isMinimized,
    savedState,

    // 状态
    loadedIcons,
  };
}

// 便捷的预设按钮集合
export const createCommonButtons = {
  info: (onClick: () => void) => ({
    id: "info",
    type: "info" as PresetButtonType,
    onClick,
  }),
  settings: (onClick: () => void) => ({
    id: "settings",
    type: "settings" as PresetButtonType,
    onClick,
  }),
  refresh: (onClick: () => void) => ({
    id: "refresh",
    type: "refresh" as PresetButtonType,
    onClick,
  }),
  download: (onClick: () => void) => ({
    id: "download",
    type: "download" as PresetButtonType,
    onClick,
  }),
  copy: (onClick: () => void) => ({
    id: "copy",
    type: "copy" as PresetButtonType,
    onClick,
  }),
  save: (onClick: () => void) => ({
    id: "save",
    type: "save" as PresetButtonType,
    onClick,
  }),
  reset: (onClick: () => void) => ({
    id: "reset",
    type: "reset" as PresetButtonType,
    onClick,
  }),
};
