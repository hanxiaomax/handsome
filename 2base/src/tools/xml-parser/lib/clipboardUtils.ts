/**
 * Clipboard and Download Utilities
 *
 * This module provides clipboard operations and file download functionality.
 */

import { toast } from "sonner";
import type { XMLElement } from "../types";

export type ContentFormat = "beautified" | "compressed" | "json" | "tree";

/**
 * Copy content to clipboard with fallback support
 */
export async function copyToClipboard(
  content: string,
  format: string
): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (!successful) {
        throw new Error("Fallback copy failed");
      }
    }

    toast.success("Content copied to clipboard!", {
      description: `${
        format.charAt(0).toUpperCase() + format.slice(1)
      } format copied successfully`,
    });
  } catch (error) {
    console.error("Copy failed:", error);
    toast.error("Failed to copy content", {
      description: "Please try again or check your browser permissions",
    });
    throw error;
  }
}

/**
 * Download content as a file
 */
export function downloadAsFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("File downloaded successfully!", {
      description: `${filename} has been saved to your downloads`,
    });
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download file", {
      description: "Please try again",
    });
    throw error;
  }
}

/**
 * Generate filename based on original file and format
 */
export function generateFilename(
  originalFilename: string | undefined,
  format: ContentFormat
): string {
  const baseName = originalFilename || "xml-content";
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "");

  switch (format) {
    case "beautified":
      return `${nameWithoutExt}_beautified.xml`;
    case "compressed":
      return `${nameWithoutExt}_compressed.xml`;
    case "json":
      return `${nameWithoutExt}.json`;
    case "tree":
      return `${nameWithoutExt}_tree.json`;
    default:
      return `${nameWithoutExt}.xml`;
  }
}

/**
 * Get MIME type based on format
 */
export function getMimeType(format: ContentFormat): string {
  switch (format) {
    case "json":
    case "tree":
      return "application/json";
    default:
      return "text/xml";
  }
}

/**
 * Prepare content for copy/download based on format
 */
export function prepareContentForExport(
  format: ContentFormat,
  sourceContent: string,
  elements: XMLElement[],
  formatters: {
    beautify: (content: string) => string;
    compress: (content: string) => string;
    convertToJSON: (content: string) => string;
  }
): string {
  switch (format) {
    case "beautified":
      return formatters.beautify(sourceContent);
    case "compressed":
      return formatters.compress(sourceContent);
    case "json":
      return formatters.convertToJSON(sourceContent);
    case "tree":
      return JSON.stringify(elements, null, 2);
    default:
      return sourceContent;
  }
}
