import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { categories } from "@/data/tools";

export interface FilterOptions {
  categories: string[];
  pricing: string[];
  isNew: boolean | null;
  requiresBackend: boolean | null;
}

interface ToolFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function ToolFilters({ filters, onFiltersChange }: ToolFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCategories = categories.filter(
    (cat) => cat.id !== "all" && cat.count > 0
  );

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter((id) => id !== categoryId);

    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handlePricingChange = (pricing: string, checked: boolean) => {
    const newPricing = checked
      ? [...filters.pricing, pricing]
      : filters.pricing.filter((p) => p !== pricing);

    onFiltersChange({
      ...filters,
      pricing: newPricing,
    });
  };

  const handleNewStatusChange = (value: string) => {
    let isNew: boolean | null = null;
    if (value === "new") isNew = true;
    else if (value === "existing") isNew = false;

    onFiltersChange({
      ...filters,
      isNew,
    });
  };

  const handleBackendChange = (value: string) => {
    let requiresBackend: boolean | null = null;
    if (value === "offline") requiresBackend = false;
    else if (value === "online") requiresBackend = true;

    onFiltersChange({
      ...filters,
      requiresBackend,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      pricing: [],
      isNew: null,
      requiresBackend: null,
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.pricing.length > 0 ||
    filters.isNew !== null ||
    filters.requiresBackend !== null;

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.categories.length;
    count += filters.pricing.length;
    if (filters.isNew !== null) count++;
    if (filters.requiresBackend !== null) count++;
    return count;
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-auto">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Tools</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <Separator />

            {/* Category Filter */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Categories</h5>
              <div className="space-y-2">
                {activeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {category.name} ({category.count})
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pricing Filter */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Pricing</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pricing-free"
                    checked={filters.pricing.includes("free")}
                    onCheckedChange={(checked) =>
                      handlePricingChange("free", checked as boolean)
                    }
                  />
                  <label
                    htmlFor="pricing-free"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Free Tools
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pricing-paid"
                    checked={filters.pricing.includes("paid")}
                    onCheckedChange={(checked) =>
                      handlePricingChange("paid", checked as boolean)
                    }
                  />
                  <label
                    htmlFor="pricing-paid"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Paid Tools
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* New Status Filter */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Status</h5>
              <Select
                value={
                  filters.isNew === true
                    ? "new"
                    : filters.isNew === false
                    ? "existing"
                    : "all"
                }
                onValueChange={handleNewStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tools</SelectItem>
                  <SelectItem value="new">New Tools Only</SelectItem>
                  <SelectItem value="existing">Existing Tools Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Backend Requirement Filter */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Availability</h5>
              <Select
                value={
                  filters.requiresBackend === false
                    ? "offline"
                    : filters.requiresBackend === true
                    ? "online"
                    : "all"
                }
                onValueChange={handleBackendChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tools</SelectItem>
                  <SelectItem value="offline">Offline Tools</SelectItem>
                  <SelectItem value="online">Online Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.categories.map((categoryId) => {
            const category = activeCategories.find((c) => c.id === categoryId);
            return (
              <Badge key={categoryId} variant="secondary" className="text-xs">
                {category?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleCategoryChange(categoryId, false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
          {filters.pricing.map((pricing) => (
            <Badge key={pricing} variant="secondary" className="text-xs">
              {pricing === "free" ? "Free" : "Paid"}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handlePricingChange(pricing, false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.isNew !== null && (
            <Badge variant="secondary" className="text-xs">
              {filters.isNew ? "New" : "Existing"}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleNewStatusChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.requiresBackend !== null && (
            <Badge variant="secondary" className="text-xs">
              {filters.requiresBackend ? "Online" : "Offline"}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleBackendChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
