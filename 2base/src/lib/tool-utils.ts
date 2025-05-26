import type { ToolInfo } from "@/types/tool";

/**
 * Check if a tool is new (released within the last 3 months)
 * @param releaseDate Release date in YYYY-MM-DD format
 * @returns Whether the tool is new
 */
export function isNewTool(releaseDate: string): boolean {
  const release = new Date(releaseDate);
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  return release >= threeMonthsAgo;
}

/**
 * Format version number for display
 * @param version Version number
 * @returns Formatted version string
 */
export function formatVersion(version: string): string {
  return `v${version}`;
}

/**
 * Format release date for display
 * @param releaseDate Release date in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatReleaseDate(releaseDate: string): string {
  const date = new Date(releaseDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format pricing for display
 * @param pricing Pricing type
 * @returns Formatted pricing text
 */
export function formatPricing(pricing: "free" | "paid"): string {
  return pricing === "free" ? "Free" : "Paid";
}

/**
 * Get complete tool version information
 * @param tool Tool information
 * @returns Object containing version, date, pricing and new status
 */
export function getToolVersionInfo(tool: ToolInfo) {
  return {
    version: formatVersion(tool.version),
    releaseDate: formatReleaseDate(tool.releaseDate),
    pricing: formatPricing(tool.pricing),
    isNew: isNewTool(tool.releaseDate),
    rawReleaseDate: tool.releaseDate,
    isPaid: tool.pricing === "paid",
  };
}
