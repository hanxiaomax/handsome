import { useState, useCallback, useMemo } from "react";
import React from "react";

// Dialog 配置接口
export interface DialogConfig {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

// 预设的 Dialog 类型
export type PresetDialogType =
  | "info"
  | "settings"
  | "confirm"
  | "warning"
  | "error"
  | "success"
  | "form"
  | "preview"
  | "help";

// 预设 Dialog 的默认配置
const PRESET_DIALOG_CONFIGS: Record<PresetDialogType, Partial<DialogConfig>> = {
  info: {
    size: "md",
    closeOnOverlayClick: true,
    showCloseButton: true,
  },
  settings: {
    size: "lg",
    closeOnOverlayClick: false,
    showCloseButton: true,
  },
  confirm: {
    size: "sm",
    closeOnOverlayClick: false,
    showCloseButton: false,
  },
  warning: {
    size: "md",
    closeOnOverlayClick: false,
    showCloseButton: true,
  },
  error: {
    size: "md",
    closeOnOverlayClick: true,
    showCloseButton: true,
  },
  success: {
    size: "sm",
    closeOnOverlayClick: true,
    showCloseButton: true,
  },
  form: {
    size: "lg",
    closeOnOverlayClick: false,
    showCloseButton: true,
  },
  preview: {
    size: "xl",
    closeOnOverlayClick: true,
    showCloseButton: true,
  },
  help: {
    size: "lg",
    closeOnOverlayClick: true,
    showCloseButton: true,
  },
};

// Dialog 状态接口
interface DialogState extends DialogConfig {
  isOpen: boolean;
}

// Dialog 管理 hook
export function useToolDialogs() {
  const [dialogs, setDialogs] = useState<Record<string, DialogState>>({});

  // 打开 Dialog
  const openDialog = useCallback((config: DialogConfig) => {
    setDialogs((prev) => ({
      ...prev,
      [config.id]: {
        ...config,
        isOpen: true,
      },
    }));
  }, []);

  // 关闭 Dialog
  const closeDialog = useCallback((dialogId: string) => {
    setDialogs((prev) => {
      const dialog = prev[dialogId];
      if (dialog?.onClose) {
        dialog.onClose();
      }
      return {
        ...prev,
        [dialogId]: {
          ...prev[dialogId],
          isOpen: false,
        },
      };
    });
  }, []);

  // 关闭所有 Dialog
  const closeAllDialogs = useCallback(() => {
    setDialogs((prev) => {
      const newDialogs = { ...prev };
      Object.keys(newDialogs).forEach((id) => {
        const dialog = newDialogs[id];
        if (dialog?.onClose) {
          dialog.onClose();
        }
        newDialogs[id] = { ...dialog, isOpen: false };
      });
      return newDialogs;
    });
  }, []);

  // 更新 Dialog 配置
  const updateDialog = useCallback(
    (dialogId: string, updates: Partial<DialogConfig>) => {
      setDialogs((prev) => ({
        ...prev,
        [dialogId]: {
          ...prev[dialogId],
          ...updates,
        },
      }));
    },
    []
  );

  // 移除 Dialog
  const removeDialog = useCallback((dialogId: string) => {
    setDialogs((prev) => {
      const newDialogs = { ...prev };
      delete newDialogs[dialogId];
      return newDialogs;
    });
  }, []);

  // 检查 Dialog 是否打开
  const isDialogOpen = useCallback(
    (dialogId: string) => {
      return dialogs[dialogId]?.isOpen || false;
    },
    [dialogs]
  );

  // 获取 Dialog 配置
  const getDialog = useCallback(
    (dialogId: string) => {
      return dialogs[dialogId];
    },
    [dialogs]
  );

  // 创建预设 Dialog
  const createPresetDialog = useCallback(
    (
      type: PresetDialogType,
      id: string,
      title: string,
      content: React.ReactNode,
      overrides?: Partial<DialogConfig>
    ): DialogConfig => {
      return {
        ...PRESET_DIALOG_CONFIGS[type],
        id,
        title,
        content,
        ...overrides,
      };
    },
    []
  );

  // 打开预设 Dialog
  const openPresetDialog = useCallback(
    (
      type: PresetDialogType,
      id: string,
      title: string,
      content: React.ReactNode,
      overrides?: Partial<DialogConfig>
    ) => {
      const config = createPresetDialog(type, id, title, content, overrides);
      openDialog(config);
    },
    [createPresetDialog, openDialog]
  );

  // 便捷方法：信息 Dialog
  const showInfo = useCallback(
    (title: string, content: React.ReactNode, id: string = "info") => {
      openPresetDialog("info", id, title, content);
    },
    [openPresetDialog]
  );

  // 便捷方法：设置 Dialog
  const showSettings = useCallback(
    (title: string, content: React.ReactNode, id: string = "settings") => {
      openPresetDialog("settings", id, title, content);
    },
    [openPresetDialog]
  );

  // 便捷方法：确认 Dialog
  const showConfirm = useCallback(
    (
      title: string,
      content: React.ReactNode,
      onConfirm: () => void,
      onCancel?: () => void,
      id: string = "confirm"
    ) => {
      const confirmFooter = React.createElement(
        "div",
        { className: "flex justify-end gap-2" },
        React.createElement(
          "button",
          {
            className: "px-4 py-2 text-sm border rounded-md hover:bg-gray-50",
            onClick: () => {
              if (onCancel) onCancel();
              closeDialog(id);
            },
          },
          "Cancel"
        ),
        React.createElement(
          "button",
          {
            className:
              "px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90",
            onClick: () => {
              onConfirm();
              closeDialog(id);
            },
          },
          "Confirm"
        )
      );

      openPresetDialog("confirm", id, title, content, {
        footer: confirmFooter,
      });
    },
    [openPresetDialog, closeDialog]
  );

  // 便捷方法：错误 Dialog
  const showError = useCallback(
    (title: string, content: React.ReactNode, id: string = "error") => {
      openPresetDialog("error", id, title, content);
    },
    [openPresetDialog]
  );

  // 便捷方法：成功 Dialog
  const showSuccess = useCallback(
    (title: string, content: React.ReactNode, id: string = "success") => {
      openPresetDialog("success", id, title, content);
    },
    [openPresetDialog]
  );

  // 获取所有打开的 Dialog
  const openDialogs = useMemo(() => {
    return Object.values(dialogs).filter((dialog) => dialog.isOpen);
  }, [dialogs]);

  // 获取所有 Dialog 状态
  const allDialogs = useMemo(() => {
    return Object.values(dialogs);
  }, [dialogs]);

  return {
    // 基本操作
    openDialog,
    closeDialog,
    closeAllDialogs,
    updateDialog,
    removeDialog,
    isDialogOpen,
    getDialog,

    // 预设 Dialog
    createPresetDialog,
    openPresetDialog,

    // 便捷方法
    showInfo,
    showSettings,
    showConfirm,
    showError,
    showSuccess,

    // 状态
    dialogs,
    openDialogs,
    allDialogs,
  };
}

// 获取 Dialog 尺寸类名的工具函数
export function getDialogSizeClass(
  size?: "sm" | "md" | "lg" | "xl" | "full"
): string {
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    full: "sm:max-w-full",
  };
  return sizeClasses[size || "md"];
}
