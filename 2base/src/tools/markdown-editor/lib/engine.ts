import type {
  MarkdownParseResult,
  TextSelection,
  TextEditResult,
  EditorStats,
  TableData,
  LinkData,
  ImageData,
  CodeBlockData,
  FileImportResult,
  ExportOptions,
  ValidationResult,
} from "./types";

export class MarkdownEngine {
  private readonly readingWordsPerMinute = 200;

  /**
   * Parse Markdown content and return structured result
   */
  parseMarkdown(content: string): MarkdownParseResult {
    // Simple Markdown parsing (in real implementation, use remark/rehype)
    const lines = content.split("\n");
    const headings: MarkdownParseResult["headings"] = [];
    let html = "";

    // Extract headings
    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        headings.push({ level, text, id, line: index + 1 });
      }
    });

    // Generate HTML (simplified)
    html = this.generateHTML(content);

    // Calculate statistics
    const words = content.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const charCount = content.length;
    const readingTime = Math.ceil(wordCount / this.readingWordsPerMinute);

    // Generate table of contents
    const tableOfContents = this.generateTOC(headings);

    return {
      html,
      headings,
      wordCount,
      charCount,
      readingTime,
      tableOfContents,
    };
  }

  /**
   * Generate HTML from Markdown (simplified implementation)
   */
  private generateHTML(content: string): string {
    let html = content;

    // Headers
    html = html.replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>");
    html = html.replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>");

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Code
    html = html.replace(/`(.+?)`/g, "<code>$1</code>");

    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, "<br>");

    return html;
  }

  /**
   * Generate table of contents from headings
   */
  private generateTOC(headings: MarkdownParseResult["headings"]): string {
    if (headings.length === 0) return "";

    let toc = "";
    headings.forEach((heading) => {
      const indent = "  ".repeat(heading.level - 1);
      toc += `${indent}- [${heading.text}](#${heading.id})\n`;
    });

    return toc;
  }

  /**
   * Calculate editor statistics
   */
  calculateStats(content: string, cursorPosition: number): EditorStats {
    const lines = content.split("\n");
    const beforeCursor = content.substring(0, cursorPosition);
    const beforeCursorLines = beforeCursor.split("\n");

    const words = content.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const charCount = content.length;
    const lineCount = lines.length;
    const readingTime = Math.ceil(wordCount / this.readingWordsPerMinute);
    const currentLine = beforeCursorLines.length;
    const currentColumn =
      beforeCursorLines[beforeCursorLines.length - 1].length + 1;

    return {
      wordCount,
      charCount,
      lineCount,
      readingTime,
      currentLine,
      currentColumn,
    };
  }

  /**
   * Format selection with bold
   */
  formatBold(content: string, selection: TextSelection): TextEditResult {
    if (selection.start === selection.end) {
      // No selection, insert bold markers
      const newContent =
        content.substring(0, selection.start) +
        "****" +
        content.substring(selection.start);
      return {
        content: newContent,
        cursorPosition: selection.start + 2,
        selectionStart: selection.start + 2,
        selectionEnd: selection.start + 2,
      };
    }

    // Has selection, wrap with bold
    const before = content.substring(0, selection.start);
    const after = content.substring(selection.end);
    const selectedText = selection.text;

    const newContent = `${before}**${selectedText}**${after}`;
    return {
      content: newContent,
      cursorPosition: selection.end + 4,
      selectionStart: selection.start + 2,
      selectionEnd: selection.end + 2,
    };
  }

  /**
   * Format selection with italic
   */
  formatItalic(content: string, selection: TextSelection): TextEditResult {
    if (selection.start === selection.end) {
      const newContent =
        content.substring(0, selection.start) +
        "**" +
        content.substring(selection.start);
      return {
        content: newContent,
        cursorPosition: selection.start + 1,
      };
    }

    const before = content.substring(0, selection.start);
    const after = content.substring(selection.end);
    const selectedText = selection.text;

    const newContent = `${before}*${selectedText}*${after}`;
    return {
      content: newContent,
      cursorPosition: selection.end + 2,
    };
  }

  /**
   * Insert heading
   */
  insertHeading(
    content: string,
    selection: TextSelection,
    level: number
  ): TextEditResult {
    const headingMarker = "#".repeat(level);
    const lines = content.split("\n");
    const beforeCursor = content.substring(0, selection.start);
    const lineNumber = beforeCursor.split("\n").length - 1;

    lines[lineNumber] = `${headingMarker} ${lines[lineNumber].replace(
      /^#+\s*/,
      ""
    )}`;

    const newContent = lines.join("\n");
    return {
      content: newContent,
      cursorPosition: selection.start + headingMarker.length + 1,
    };
  }

  /**
   * Insert link
   */
  insertLink(
    content: string,
    selection: TextSelection,
    linkData: LinkData
  ): TextEditResult {
    const linkText = linkData.text || selection.text || "Link text";
    const linkUrl = linkData.url || "https://";
    const linkMarkdown = `[${linkText}](${linkUrl})`;

    const before = content.substring(0, selection.start);
    const after = content.substring(selection.end);
    const newContent = `${before}${linkMarkdown}${after}`;

    return {
      content: newContent,
      cursorPosition: selection.start + linkMarkdown.length,
    };
  }

  /**
   * Insert image
   */
  insertImage(
    content: string,
    selection: TextSelection,
    imageData: ImageData
  ): TextEditResult {
    const imageMarkdown = `![${imageData.alt}](${imageData.src}${
      imageData.title ? ` "${imageData.title}"` : ""
    })`;

    const before = content.substring(0, selection.start);
    const after = content.substring(selection.end);
    const newContent = `${before}${imageMarkdown}${after}`;

    return {
      content: newContent,
      cursorPosition: selection.start + imageMarkdown.length,
    };
  }

  /**
   * Insert table
   */
  insertTable(
    content: string,
    selection: TextSelection,
    tableData: TableData
  ): TextEditResult {
    const { headers, rows, alignment } = tableData;

    let tableMarkdown = "| " + headers.join(" | ") + " |\n";

    // Add separator row
    const separators = headers.map((_, index) => {
      const align = alignment?.[index] || "left";
      switch (align) {
        case "center":
          return ":---:";
        case "right":
          return "---:";
        default:
          return "---";
      }
    });
    tableMarkdown += "| " + separators.join(" | ") + " |\n";

    // Add data rows
    rows.forEach((row) => {
      tableMarkdown += "| " + row.join(" | ") + " |\n";
    });

    const before = content.substring(0, selection.start);
    const after = content.substring(selection.end);
    const newContent = `${before}${tableMarkdown}${after}`;

    return {
      content: newContent,
      cursorPosition: selection.start + tableMarkdown.length,
    };
  }

  /**
   * Insert code block
   */
  insertCodeBlock(
    content: string,
    selection: TextSelection,
    codeData: CodeBlockData
  ): TextEditResult {
    const codeBlockMarkdown = `\`\`\`${codeData.language}\n${codeData.code}\n\`\`\`\n`;

    const before = content.substring(0, selection.start);
    const after = content.substring(selection.end);
    const newContent = `${before}${codeBlockMarkdown}${after}`;

    return {
      content: newContent,
      cursorPosition: selection.start + codeBlockMarkdown.length,
    };
  }

  /**
   * Import file content
   */
  async importFile(file: File): Promise<FileImportResult> {
    const content = await file.text();
    const fileName = file.name;
    const size = file.size;

    let type: FileImportResult["type"] = "unknown";
    if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
      type = "markdown";
    } else if (fileName.endsWith(".txt")) {
      type = "text";
    }

    return {
      content,
      fileName,
      type,
      size,
    };
  }

  /**
   * Export content
   */
  exportContent(content: string, options: ExportOptions): void {
    const { format, fileName = "document", includeTOC, includeCSS } = options;

    let exportContent = content;
    let mimeType = "text/plain";
    let fileExtension = ".txt";

    switch (format) {
      case "markdown": {
        if (includeTOC) {
          const parsed = this.parseMarkdown(content);
          exportContent = `${parsed.tableOfContents}\n\n${content}`;
        }
        mimeType = "text/markdown";
        fileExtension = ".md";
        break;
      }

      case "html": {
        const parsed = this.parseMarkdown(content);
        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>`;

        if (includeCSS) {
          htmlContent += `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; }
    code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; margin: 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #dfe2e5; padding: 8px 16px; text-align: left; }
    th { background: #f6f8fa; }
  </style>`;
        }

        htmlContent += `
</head>
<body>
${parsed.html}
</body>
</html>`;
        exportContent = htmlContent;
        mimeType = "text/html";
        fileExtension = ".html";
        break;
      }

      case "pdf": {
        // PDF export would require a library like jsPDF
        console.warn("PDF export not implemented in this demo");
        return;
      }
    }

    // Create download
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validate Markdown syntax
   */
  validateMarkdown(content: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Check for unmatched brackets in links
      const linkBrackets =
        (line.match(/\[/g) || []).length - (line.match(/\]/g) || []).length;
      if (linkBrackets !== 0) {
        results.push({
          line: index + 1,
          column: 1,
          message: "Unmatched brackets in link syntax",
          type: "warning",
        });
      }

      // Check for unmatched code block markers
      const codeBlocks = (line.match(/```/g) || []).length;
      if (codeBlocks % 2 !== 0) {
        results.push({
          line: index + 1,
          column: 1,
          message: "Unmatched code block markers",
          type: "warning",
        });
      }
    });

    return results;
  }

  /**
   * Get default templates
   */
  getTemplates(): Record<string, string> {
    return {
      empty: "",
      readme: `# Project Name

## Description

A brief description of your project.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
// Example usage
console.log('Hello, World!');
\`\`\`

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License.`,

      blog: `# Blog Post Title

*Published on ${new Date().toLocaleDateString()}*

## Introduction

Your introduction goes here...

## Main Content

### Section 1

Content for section 1.

### Section 2

Content for section 2.

## Conclusion

Your conclusion goes here...

---

*Tags: #tag1 #tag2 #tag3*`,

      documentation: `# API Documentation

## Overview

This document describes the API endpoints.

## Authentication

All API requests require authentication:

\`\`\`http
Authorization: Bearer YOUR_TOKEN
\`\`\`

## Endpoints

### GET /api/users

Retrieve a list of users.

**Parameters:**
- \`limit\` (optional): Maximum number of users to return
- \`offset\` (optional): Number of users to skip

**Response:**
\`\`\`json
{
  "users": [],
  "total": 0
}
\`\`\`

### POST /api/users

Create a new user.

**Request Body:**
\`\`\`json
{
  "name": "string",
  "email": "string"
}
\`\`\``,
    };
  }
}
