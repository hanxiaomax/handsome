import { useRef, useCallback } from 'react';
import { UnitConverter } from '../graph-engine';
import { createUnitConverter, categoryMapping, type CategoryId } from '../config';
import type { UnitConverterState, ConversionResult } from '../../types';

export function useUnitConverterLogic(
  state: UnitConverterState,
  setState: React.Dispatch<React.SetStateAction<UnitConverterState>>
) {
  const engine = useRef<UnitConverter>(createUnitConverter());

  const formatValue = useCallback((value: number): string => {
    if (value === 0) return '0';
    if (Math.abs(value) >= 1e15) return value.toExponential(6);
    if (Math.abs(value) >= 1e6) return value.toExponential(6);
    if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
    if (Math.abs(value) >= 1) return value.toFixed(6).replace(/\.?0+$/, '');
    if (Math.abs(value) >= 0.001) return value.toFixed(6).replace(/\.?0+$/, '');
    return value.toExponential(6);
  }, []);

  const performConversion = useCallback((value: number, unit: string, category: CategoryId): ConversionResult[] => {
    const standardResults: ConversionResult[] = engine.current.convertToAll(value, unit).map(result => ({
      unit: {
        id: result.unit,
        name: result.description,
        symbol: result.symbol,
        baseRatio: 1,
        isBaseUnit: false,
        precision: 6,
        description: result.description,
        context: ''
      },
      value: result.value,
      formattedValue: formatValue(result.value),
      isApproximate: false
    }));

    if (category !== 'timestamp') {
      return standardResults;
    }

    let msTimestamp = value;
    if (unit === 'second_timestamp') {
      msTimestamp = value * 1000;
    } else if (unit === 'microsecond_timestamp') {
      msTimestamp = value / 1000;
    } else if (unit === 'nanosecond_timestamp') {
      msTimestamp = value / 1e6;
    }

    const date = new Date(msTimestamp);

    if (isNaN(date.getTime())) {
      return standardResults;
    }

    const dateFormats = [
      { id: 'iso_8601', name: 'ISO 8601 (UTC)', symbol: 'ISO', value: date.toISOString()},
      { id: 'utc_string', name: 'UTC String', symbol: 'UTC', value: date.toUTCString()},
      { id: 'local_string', name: 'Local String', symbol: 'Local', value: date.toString()},
      { id: 'date_string', name: 'Local Date', symbol: 'Date', value: date.toDateString()},
      { id: 'time_string', name: 'Local Time', symbol: 'Time', value: date.toTimeString()},
    ];

    const formattedDateResults: ConversionResult[] = dateFormats.map(format => ({
      unit: {
        id: format.id,
        name: format.name,
        symbol: format.symbol,
        baseRatio: 0, isBaseUnit: false, precision: 0, description: format.name, context: ''
      },
      value: msTimestamp,
      formattedValue: format.value,
      isApproximate: false,
    }));

    return [...standardResults, ...formattedDateResults];
  }, [formatValue]);

  const handleCategoryChange = useCallback((categoryId: CategoryId) => {
    try {
      const units = engine.current.getUnitsInDimension(categoryId);
      
      if (units.length === 0) {
        setState(prev => ({
          ...prev,
          selectedCategory: categoryId,
          availableUnits: [],
          results: [],
          error: 'No units available for this category'
        }));
        return;
      }

      const firstUnit = engine.current.getUnit(units[0]);
      if (!firstUnit) {
        setState(prev => ({
            ...prev,
          selectedCategory: categoryId,
          availableUnits: [],
          results: [],
          error: 'Failed to load units'
        }));
        return;
      }

      const unitList = units.map(unitName => {
        const unit = engine.current.getUnit(unitName)!;
        return {
          id: unit.name,
          name: unit.description,
          symbol: unit.symbol
        };
      });

      const initialValue = categoryId === 'timestamp' ? Date.now() / 1000 : 1;
      const initialUnit = categoryId === 'timestamp' ? 'second_timestamp' : firstUnit.name;

      const results = performConversion(initialValue, initialUnit, categoryId);

      setState(prev => ({
              ...prev,
        selectedCategory: categoryId,
        availableUnits: unitList,
        inputValue: String(initialValue),
        inputUnit: initialUnit,
        results: results,
        isProcessing: false,
        error: null
            }));
          } catch (error) {
      setState(prev => ({
              ...prev,
        selectedCategory: categoryId,
        availableUnits: [],
        results: [],
        error: error instanceof Error ? error.message : 'Failed to change category'
            }));
        }
  }, [setState, performConversion]);

  const handleInputChange = useCallback((value: string, unitId?: string) => {
    const numericValue = parseFloat(value) || 0;
    const currentUnit = unitId || state.inputUnit;

    setState(prev => ({ ...prev, inputValue: value, isProcessing: true }));

    try {
      if (!currentUnit) {
        setState(prev => ({
          ...prev,
          results: [],
          isProcessing: false,
          error: 'No input unit selected'
        }));
        return;
      }

      const results = performConversion(numericValue, currentUnit, state.selectedCategory as CategoryId);

      setState(prev => ({
        ...prev,
        inputUnit: currentUnit,
        results: results,
        isProcessing: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        results: [],
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Conversion failed'
      }));
    }
  }, [state.inputUnit, state.selectedCategory, setState, performConversion]);

  const handleUnitChange = useCallback((unitId: string) => {
    handleInputChange(state.inputValue, unitId);
  }, [state.inputValue, handleInputChange]);

  const getCategories = useCallback(() => {
    return Object.entries(categoryMapping).map(([id, name]) => ({
      id: id as CategoryId,
      name,
      description: `Convert ${name.toLowerCase()} units`
    }));
  }, []);

  const convertValue = useCallback((value: number, fromUnit: string, toUnit: string): number => {
    return engine.current.convert(value, fromUnit, toUnit);
  }, []);

  return {
    handleCategoryChange,
    handleInputChange,
    handleUnitChange,
    getCategories,
    convertValue,
    formatValue
  };
}
