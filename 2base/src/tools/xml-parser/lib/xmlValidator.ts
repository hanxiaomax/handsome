/**
 * XML Format Validator
 *
 * Provides comprehensive XML format validation before parsing
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  id: string;
  type: "syntax" | "structure" | "encoding" | "wellformed";
  message: string;
  line?: number;
  column?: number;
  severity: "error" | "warning";
}

export interface ValidationWarning {
  id: string;
  type: "format" | "recommendation" | "performance";
  message: string;
  line?: number;
  column?: number;
}

export class XMLValidator {
  /**
   * Validate XML content format
   */
  validateXML(xmlContent: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic content checks
    if (!xmlContent || xmlContent.trim().length === 0) {
      errors.push({
        id: "empty-content",
        type: "structure",
        message: "XML content is empty",
        severity: "error",
      });
      return { isValid: false, errors, warnings };
    }

    const trimmedContent = xmlContent.trim();

    // Check if content looks like XML
    if (!this.looksLikeXML(trimmedContent)) {
      errors.push({
        id: "not-xml",
        type: "structure",
        message: "Content does not appear to be XML format",
        severity: "error",
      });
      return { isValid: false, errors, warnings };
    }

    // Perform detailed validation
    this.validateBasicStructure(trimmedContent, errors, warnings);
    this.validateWellFormedness(trimmedContent, errors);
    this.validateEncoding(trimmedContent, warnings);
    this.validatePerformance(trimmedContent, warnings);

    const isValid = errors.length === 0;
    return { isValid, errors, warnings };
  }

  /**
   * Quick check if content looks like XML
   */
  private looksLikeXML(content: string): boolean {
    // Must start with < and contain >
    if (!content.startsWith("<") || !content.includes(">")) {
      return false;
    }

    // Check for basic XML patterns
    const xmlPatterns = [
      /^<\?xml/i, // XML declaration
      /^<[a-zA-Z]/, // Starts with element
      /^<!\[CDATA\[/, // CDATA section
      /^<!--/, // Comment
    ];

    return xmlPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Validate basic XML structure
   */
  private validateBasicStructure(
    content: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Check for XML declaration
    if (!content.match(/^<\?xml/i)) {
      warnings.push({
        id: "missing-declaration",
        type: "format",
        message: "XML declaration is recommended but not required",
        line: 1,
      });
    }

    // Check for root element
    const rootElementMatch = content.match(/<([a-zA-Z][a-zA-Z0-9:_-]*)/);
    if (!rootElementMatch) {
      errors.push({
        id: "no-root-element",
        type: "structure",
        message: "No valid root element found",
        severity: "error",
      });
      return;
    }

    // Check for multiple root elements
    const rootElements = this.findRootElements(content);
    if (rootElements.length > 1) {
      errors.push({
        id: "multiple-roots",
        type: "structure",
        message: "XML document can only have one root element",
        severity: "error",
      });
    }
  }

  /**
   * Validate XML well-formedness
   */
  private validateWellFormedness(
    content: string,
    errors: ValidationError[]
  ): void {
    // Check for unmatched tags
    const tagMatches = this.validateTagMatching(content);
    if (!tagMatches.isValid) {
      errors.push(...tagMatches.errors);
    }

    // Check for proper attribute quoting
    const attrMatches = this.validateAttributeQuoting(content);
    if (!attrMatches.isValid) {
      errors.push(...attrMatches.errors);
    }

    // Check for invalid characters
    const charValidation = this.validateCharacters(content);
    if (!charValidation.isValid) {
      errors.push(...charValidation.errors);
    }

    // Check for proper CDATA sections
    this.validateCDATA(content, errors);
  }

  /**
   * Validate tag matching
   */
  private validateTagMatching(content: string): {
    isValid: boolean;
    errors: ValidationError[];
  } {
    const errors: ValidationError[] = [];
    const tagStack: Array<{ name: string; line: number }> = [];
    const lines = content.split("\n");

    let lineNumber = 0;
    for (const line of lines) {
      lineNumber++;

      // Find all tags in this line
      const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9:_-]*)[^>]*>/g;
      let match;

      while ((match = tagRegex.exec(line)) !== null) {
        const fullTag = match[0];
        const tagName = match[1];

        if (fullTag.startsWith("</")) {
          // Closing tag
          if (tagStack.length === 0) {
            errors.push({
              id: `unmatched-closing-${tagName}`,
              type: "syntax",
              message: `Unmatched closing tag: </${tagName}>`,
              line: lineNumber,
              severity: "error",
            });
          } else {
            const lastOpen = tagStack.pop();
            if (lastOpen && lastOpen.name !== tagName) {
              errors.push({
                id: `mismatched-tags-${tagName}`,
                type: "syntax",
                message: `Mismatched tags: expected </${lastOpen.name}> but found </${tagName}>`,
                line: lineNumber,
                severity: "error",
              });
            }
          }
        } else if (!fullTag.endsWith("/>")) {
          // Opening tag (not self-closing)
          tagStack.push({ name: tagName, line: lineNumber });
        }
        // Self-closing tags (ending with />) are automatically balanced
      }
    }

    // Check for unclosed tags
    for (const unclosed of tagStack) {
      errors.push({
        id: `unclosed-tag-${unclosed.name}`,
        type: "syntax",
        message: `Unclosed tag: <${unclosed.name}>`,
        line: unclosed.line,
        severity: "error",
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate attribute quoting
   */
  private validateAttributeQuoting(content: string): {
    isValid: boolean;
    errors: ValidationError[];
  } {
    const errors: ValidationError[] = [];
    const lines = content.split("\n");

    let lineNumber = 0;
    for (const line of lines) {
      lineNumber++;

      // Check for unquoted attributes
      const unquotedAttrRegex =
        /\s+([a-zA-Z][a-zA-Z0-9:_-]*)\s*=\s*([^"'\s>]+)/g;
      let match;

      while ((match = unquotedAttrRegex.exec(line)) !== null) {
        const attrName = match[1];
        const attrValue = match[2];

        // Skip if it's properly quoted
        if (attrValue.startsWith('"') || attrValue.startsWith("'")) {
          continue;
        }

        errors.push({
          id: `unquoted-attribute-${attrName}`,
          type: "syntax",
          message: `Attribute value must be quoted: ${attrName}="${attrValue}"`,
          line: lineNumber,
          severity: "error",
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate characters
   */
  private validateCharacters(content: string): {
    isValid: boolean;
    errors: ValidationError[];
  } {
    const errors: ValidationError[] = [];
    const lines = content.split("\n");

    let lineNumber = 0;
    for (const line of lines) {
      lineNumber++;

      // Check for invalid XML characters
      // eslint-disable-next-line no-control-regex
      const invalidChars = line.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g);
      if (invalidChars) {
        errors.push({
          id: `invalid-characters-line-${lineNumber}`,
          type: "encoding",
          message: `Invalid XML characters found on line ${lineNumber}`,
          line: lineNumber,
          severity: "error",
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate CDATA sections
   */
  private validateCDATA(content: string, errors: ValidationError[]): void {
    const cdataRegex = /<!\[CDATA\[(.*?)\]\]>/gs;
    let match;

    while ((match = cdataRegex.exec(content)) !== null) {
      const cdataContent = match[1];

      // Check for nested CDATA (not allowed)
      if (cdataContent.includes("<![CDATA[")) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        errors.push({
          id: `nested-cdata-${lineNumber}`,
          type: "syntax",
          message: "Nested CDATA sections are not allowed",
          line: lineNumber,
          severity: "error",
        });
      }

      // Check for ]]> inside CDATA
      if (cdataContent.includes("]]>")) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        errors.push({
          id: `invalid-cdata-end-${lineNumber}`,
          type: "syntax",
          message: 'CDATA section cannot contain "]]>"',
          line: lineNumber,
          severity: "error",
        });
      }
    }
  }

  /**
   * Validate encoding
   */
  private validateEncoding(
    content: string,
    warnings: ValidationWarning[]
  ): void {
    // Check encoding declaration
    const encodingMatch = content.match(/encoding\s*=\s*["']([^"']+)["']/i);
    if (encodingMatch) {
      const encoding = encodingMatch[1].toLowerCase();
      const supportedEncodings = ["utf-8", "utf-16", "iso-8859-1", "us-ascii"];

      if (!supportedEncodings.includes(encoding)) {
        warnings.push({
          id: "unsupported-encoding",
          type: "format",
          message: `Encoding "${encoding}" may not be supported by all parsers`,
          line: 1,
        });
      }
    }

    // Check for BOM
    if (content.charCodeAt(0) === 0xfeff) {
      warnings.push({
        id: "bom-detected",
        type: "format",
        message: "Byte Order Mark (BOM) detected - may cause parsing issues",
        line: 1,
      });
    }
  }

  /**
   * Validate performance considerations
   */
  private validatePerformance(
    content: string,
    warnings: ValidationWarning[]
  ): void {
    // Check file size
    const sizeInMB = new Blob([content]).size / (1024 * 1024);
    if (sizeInMB > 10) {
      warnings.push({
        id: "large-file",
        type: "performance",
        message: `Large XML file (${sizeInMB.toFixed(
          1
        )}MB) may affect performance`,
        line: 1,
      });
    }

    // Check nesting depth
    const maxDepth = this.calculateMaxDepth(content);
    if (maxDepth > 20) {
      warnings.push({
        id: "deep-nesting",
        type: "performance",
        message: `Deep nesting (${maxDepth} levels) may affect performance`,
        line: 1,
      });
    }

    // Check for excessive attributes
    const maxAttributes = this.findMaxAttributes(content);
    if (maxAttributes > 50) {
      warnings.push({
        id: "many-attributes",
        type: "performance",
        message: `Element with ${maxAttributes} attributes may affect performance`,
        line: 1,
      });
    }
  }

  /**
   * Find root elements
   */
  private findRootElements(content: string): string[] {
    const rootElements: string[] = [];

    // Remove XML declaration and comments
    const cleanContent = content
      .replace(/<\?xml[^>]*\?>/i, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();

    // Find top-level elements
    const elementRegex = /<([a-zA-Z][a-zA-Z0-9:_-]*)[^>]*>/g;
    let match;
    let depth = 0;

    while ((match = elementRegex.exec(cleanContent)) !== null) {
      const fullTag = match[0];
      const tagName = match[1];

      if (fullTag.startsWith("</")) {
        depth--;
      } else {
        if (depth === 0) {
          rootElements.push(tagName);
        }
        if (!fullTag.endsWith("/>")) {
          depth++;
        }
      }
    }

    return rootElements;
  }

  /**
   * Calculate maximum nesting depth
   */
  private calculateMaxDepth(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9:_-]*)[^>]*>/g;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      const fullTag = match[0];

      if (fullTag.startsWith("</")) {
        currentDepth--;
      } else if (!fullTag.endsWith("/>")) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
    }

    return maxDepth;
  }

  /**
   * Find maximum number of attributes in any element
   */
  private findMaxAttributes(content: string): number {
    let maxAttributes = 0;

    const elementRegex = /<[a-zA-Z][a-zA-Z0-9:_-]*([^>]*)>/g;
    let match;

    while ((match = elementRegex.exec(content)) !== null) {
      const attributesString = match[1];
      const attributeCount = (
        attributesString.match(/\s+[a-zA-Z][a-zA-Z0-9:_-]*\s*=/g) || []
      ).length;
      maxAttributes = Math.max(maxAttributes, attributeCount);
    }

    return maxAttributes;
  }
}

// Create singleton instance
export const xmlValidator = new XMLValidator();
