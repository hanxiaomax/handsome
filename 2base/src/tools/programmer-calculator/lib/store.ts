import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMemo } from "react";
import type { Base, BitWidth, Operation } from "../types";

// 更新来源类型
type UpdateSource = "calculator" | "visualization" | "external" | "init";

// Store 状态接口
interface CalculatorState {
  // 核心计算状态
  currentValue: string;
  previousValue: string;
  operation: Operation | null;
  base: Base;
  bitWidth: BitWidth;

  // 防循环机制
  lastUpdateSource: UpdateSource;
  updateCounter: number;
  isUpdating: boolean;

  // Actions
  setValue: (value: string, source: UpdateSource) => void;
  setBase: (base: Base, source: UpdateSource) => void;
  setBitWidth: (bitWidth: BitWidth, source: UpdateSource) => void;
  setOperation: (operation: Operation | null, source: UpdateSource) => void;
  setPreviousValue: (value: string, source: UpdateSource) => void;

  // 批量更新（原子操作）
  batchUpdate: (
    updates: {
      currentValue?: string;
      previousValue?: string;
      operation?: Operation | null;
      base?: Base;
      bitWidth?: BitWidth;
    },
    source: UpdateSource
  ) => void;

  // 重置状态
  reset: (source: UpdateSource) => void;

  // 获取完整状态快照
  getSnapshot: () => {
    currentValue: string;
    previousValue: string;
    operation: Operation | null;
    base: Base;
    bitWidth: BitWidth;
  };
}

// 默认状态
const defaultState = {
  currentValue: "0",
  previousValue: "",
  operation: null as Operation | null,
  base: 10 as Base,
  bitWidth: 32 as BitWidth,
  lastUpdateSource: "init" as UpdateSource,
  updateCounter: 0,
  isUpdating: false,
};

// 创建 Zustand store
export const useCalculatorStore = create<CalculatorState>()(
  subscribeWithSelector((set, get) => ({
    ...defaultState,

    // 设置当前值
    setValue: (value, source) => {
      const state = get();

      // 防循环检查：相同来源的相同值忽略
      if (state.lastUpdateSource === source && state.currentValue === value) {
        return;
      }

      // 防止更新中的重复调用
      if (state.isUpdating && source !== "external") {
        return;
      }

      set({
        currentValue: value,
        lastUpdateSource: source,
        updateCounter: state.updateCounter + 1,
        isUpdating: true,
      });

      // 异步重置更新标志
      setTimeout(() => {
        set({ isUpdating: false });
      }, 0);
    },

    // 设置进制
    setBase: (base, source) => {
      const state = get();

      if (state.lastUpdateSource === source && state.base === base) {
        return;
      }

      if (state.isUpdating && source !== "external") {
        return;
      }

      set({
        base,
        lastUpdateSource: source,
        updateCounter: state.updateCounter + 1,
        isUpdating: true,
      });

      setTimeout(() => {
        set({ isUpdating: false });
      }, 0);
    },

    // 设置位宽
    setBitWidth: (bitWidth, source) => {
      const state = get();

      if (state.lastUpdateSource === source && state.bitWidth === bitWidth) {
        return;
      }

      if (state.isUpdating && source !== "external") {
        return;
      }

      set({
        bitWidth,
        lastUpdateSource: source,
        updateCounter: state.updateCounter + 1,
        isUpdating: true,
      });

      setTimeout(() => {
        set({ isUpdating: false });
      }, 0);
    },

    // 设置运算符
    setOperation: (operation, source) => {
      const state = get();

      if (state.lastUpdateSource === source && state.operation === operation) {
        return;
      }

      set({
        operation,
        lastUpdateSource: source,
        updateCounter: state.updateCounter + 1,
      });
    },

    // 设置前值
    setPreviousValue: (value, source) => {
      const state = get();

      if (state.lastUpdateSource === source && state.previousValue === value) {
        return;
      }

      set({
        previousValue: value,
        lastUpdateSource: source,
        updateCounter: state.updateCounter + 1,
      });
    },

    // 批量更新（原子操作，避免多次渲染）
    batchUpdate: (updates, source) => {
      const state = get();

      // 检查是否有实际变化
      const hasChanges = Object.entries(updates).some(([key, value]) => {
        return state[key as keyof typeof state] !== value;
      });

      if (!hasChanges) {
        return;
      }

      if (state.isUpdating && source !== "external") {
        return;
      }

      set((currentState) => ({
        ...currentState,
        ...updates,
        lastUpdateSource: source,
        updateCounter: currentState.updateCounter + 1,
        isUpdating: true,
      }));

      setTimeout(() => {
        set({ isUpdating: false });
      }, 0);
    },

    // 重置状态
    reset: (source) => {
      set({
        ...defaultState,
        lastUpdateSource: source,
        updateCounter: get().updateCounter + 1,
      });
    },

    // 获取状态快照
    getSnapshot: () => {
      const state = get();
      return {
        currentValue: state.currentValue,
        previousValue: state.previousValue,
        operation: state.operation,
        base: state.base,
        bitWidth: state.bitWidth,
      };
    },
  }))
);

// 选择器 hooks（性能优化）
export const useCurrentValue = () =>
  useCalculatorStore((state) => state.currentValue);
export const usePreviousValue = () =>
  useCalculatorStore((state) => state.previousValue);
export const useOperation = () =>
  useCalculatorStore((state) => state.operation);
export const useBase = () => useCalculatorStore((state) => state.base);
export const useBitWidth = () => useCalculatorStore((state) => state.bitWidth);
export const useLastUpdateSource = () =>
  useCalculatorStore((state) => state.lastUpdateSource);

// 缓存的复合选择器 - 修复无限循环问题
export const useCalculatorSnapshot = () => {
  const currentValue = useCalculatorStore((state) => state.currentValue);
  const previousValue = useCalculatorStore((state) => state.previousValue);
  const operation = useCalculatorStore((state) => state.operation);
  const base = useCalculatorStore((state) => state.base);
  const bitWidth = useCalculatorStore((state) => state.bitWidth);

  // 使用 useMemo 缓存结果，只有当实际值发生变化时才返回新对象
  return useMemo(
    () => ({
      currentValue,
      previousValue,
      operation,
      base,
      bitWidth,
    }),
    [currentValue, previousValue, operation, base, bitWidth]
  );
};

// Actions 选择器（使用 useMemo 缓存，防止无限循环）
export const useCalculatorActions = () => {
  const setValue = useCalculatorStore((state) => state.setValue);
  const setBase = useCalculatorStore((state) => state.setBase);
  const setBitWidth = useCalculatorStore((state) => state.setBitWidth);
  const setOperation = useCalculatorStore((state) => state.setOperation);
  const setPreviousValue = useCalculatorStore(
    (state) => state.setPreviousValue
  );
  const batchUpdate = useCalculatorStore((state) => state.batchUpdate);
  const reset = useCalculatorStore((state) => state.reset);
  const getSnapshot = useCalculatorStore((state) => state.getSnapshot);

  return useMemo(
    () => ({
      setValue,
      setBase,
      setBitWidth,
      setOperation,
      setPreviousValue,
      batchUpdate,
      reset,
      getSnapshot,
    }),
    [
      setValue,
      setBase,
      setBitWidth,
      setOperation,
      setPreviousValue,
      batchUpdate,
      reset,
      getSnapshot,
    ]
  );
};
