/**
 * File Handler Utilities
 *
 * This module provides file handling functionality including
 * file validation, content reading, and file state management.
 */

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export interface FileUploadState {
  isDragOver: boolean;
  selectedFile: File | null;
  fileInfo: FileInfo | null;
  content: string;
  originalContent: string;
}

/**
 * Validate if a file is a supported XML file type
 */
export function isXMLFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const supportedExtensions = [".xml", ".arxml", ".xsd", ".svg"];

  return (
    supportedExtensions.some((ext) => fileName.endsWith(ext)) ||
    file.type === "text/xml" ||
    file.type === "application/xml"
  );
}

/**
 * Read file content as text
 */
export async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        resolve(event.target.result);
      } else {
        reject(new Error("Failed to read file content"));
      }
    };

    reader.onerror = () => {
      reject(new Error("File reading error"));
    };

    reader.readAsText(file);
  });
}

/**
 * Extract file information from a File object
 */
export function extractFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Check if auto-parse should be enabled for a file
 */
export function shouldAutoParseFile(
  file: File,
  autoParseEnabled: boolean
): boolean {
  // Only auto-parse if enabled and file is smaller than 10MB
  return autoParseEnabled && file.size < 10 * 1024 * 1024;
}

/**
 * Get files from drag event that are XML files
 */
export function getXMLFilesFromDragEvent(e: React.DragEvent): File[] {
  const files = Array.from(e.dataTransfer.files);
  return files.filter(isXMLFile);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
