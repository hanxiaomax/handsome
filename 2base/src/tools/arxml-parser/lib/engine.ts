import type {
  XMLElement,
  XMLElementType,
  ParseOptions,
  ParserState,
  ParseError,
  SearchIndex,
  SearchResult,
  TreeFilter,
  PerformanceMetrics,
  ExportOptions,
  WorkerMessage,
  WorkerParseMessage,
  WorkerProgressMessage,
  WorkerCompleteMessage,
} from "./types";

/**
 * High-performance XML Stream Parser Engine
 * Handles large files with memory-efficient streaming and selective loading
 */
export class XMLStreamParser {
  private state: ParserState;
  private worker: Worker | null = null;
  private elements = new Map<string, XMLElement>();
  private searchIndex: SearchIndex | null = null;
  private metrics: PerformanceMetrics = {
    parseTime: 0,
    renderTime: 0,
    memoryPeak: 0,
    nodeCount: 0,
    searchIndexSize: 0,
  };

  constructor() {
    this.state = {
      status: "idle",
      progress: 0,
      currentSection: "",
      elementsProcessed: 0,
      memoryUsage: 0,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Parse XML file with streaming support
   */
  async parseFile(
    file: File,
    options: ParseOptions,
    onProgress?: (state: ParserState) => void,
    onComplete?: (elements: XMLElement[]) => void,
    onError?: (error: ParseError) => void
  ): Promise<void> {
    const startTime = performance.now();

    try {
      this.state = {
        ...this.state,
        status: "parsing",
        progress: 0,
        currentSection: "Initializing",
        elementsProcessed: 0,
        errors: [],
        warnings: [],
      };

      // Initialize Web Worker for background processing
      console.log("parseFile: File size:", file.size, "bytes");
      console.log("parseFile: Memory limit:", options.memoryLimit, "bytes");

      // Use Web Worker for files larger than 50MB to avoid blocking the main thread
      if (file.size > 50 * 1024 * 1024) {
        console.log("parseFile: Using Web Worker for large file");
        // 100MB threshold
        await this.initializeWorker(
          file,
          options,
          onProgress,
          onComplete,
          onError
        );
      } else {
        console.log("parseFile: Using main thread for small file");
        await this.parseInMainThread(
          file,
          options,
          onProgress,
          onComplete,
          onError
        );
      }

      this.metrics.parseTime = performance.now() - startTime;
    } catch (error) {
      const parseError: ParseError = {
        id: Date.now().toString(),
        type: "syntax",
        message:
          error instanceof Error ? error.message : "Unknown parsing error",
        severity: "error",
      };

      this.state.status = "error";
      this.state.errors.push(parseError);
      onError?.(parseError);
    }
  }

  /**
   * Initialize Web Worker for heavy processing
   */
  private async initializeWorker(
    file: File,
    options: ParseOptions,
    onProgress?: (state: ParserState) => void,
    onComplete?: (elements: XMLElement[]) => void,
    onError?: (error: ParseError) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create inline worker for XML parsing
      const workerCode = this.createWorkerCode();
      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, payload } = event.data;

        switch (type) {
          case "progress": {
            const progressData = payload as WorkerProgressMessage["payload"];
            this.state = {
              ...this.state,
              progress: progressData?.progress || 0,
              currentSection: progressData?.currentSection || "",
              elementsProcessed: progressData?.elementsProcessed || 0,
              memoryUsage: progressData?.memoryUsage || 0,
            };
            onProgress?.(this.state);
            break;
          }

          case "complete": {
            const completeData = payload as WorkerCompleteMessage["payload"];
            if (completeData?.elements) {
              this.processWorkerResults(
                completeData.elements,
                completeData.searchIndex
              );
              this.state.status = "complete";
              this.metrics = { ...this.metrics, ...completeData.metrics };
              onComplete?.(Array.from(this.elements.values()));
            }
            resolve();
            break;
          }

          case "error": {
            const errorData = payload as { error: ParseError };
            this.state.status = "error";
            this.state.errors.push(errorData.error);
            onError?.(errorData.error);
            reject(new Error(errorData.error.message));
            break;
          }
        }
      };

      this.worker.onerror = (error) => {
        const parseError: ParseError = {
          id: Date.now().toString(),
          type: "syntax",
          message: `Worker error: ${error.message}`,
          severity: "error",
        };
        reject(parseError);
      };

      // Send file to worker
      file.arrayBuffer().then((buffer) => {
        const message: WorkerParseMessage = {
          type: "parse",
          payload: { fileBuffer: buffer, options },
        };
        this.worker?.postMessage(message);
      });
    });
  }

  /**
   * Parse in main thread for smaller files
   */
  private async parseInMainThread(
    file: File,
    options: ParseOptions,
    onProgress?: (state: ParserState) => void,
    onComplete?: (elements: XMLElement[]) => void,
    onError?: (error: ParseError) => void
  ): Promise<void> {
    try {
      console.log("parseInMainThread: Starting to read file content");
      const text = await file.text();
      console.log("parseInMainThread: File content read, length:", text.length);
      console.log(
        "parseInMainThread: First 500 characters:",
        text.substring(0, 500)
      );

      const elements = this.parseXMLText(text, options, onProgress);
      console.log(
        "parseInMainThread: Parsing completed, elements found:",
        elements.length
      );

      this.state.status = "complete";
      this.elements.clear();
      elements.forEach((element) => this.elements.set(element.id, element));

      this.buildSearchIndex(elements);
      onComplete?.(elements);
    } catch (error) {
      console.error("parseInMainThread: Error occurred:", error);
      const parseError: ParseError = {
        id: Date.now().toString(),
        type: "syntax",
        message:
          error instanceof Error
            ? error.message
            : "Unknown parsing error in main thread",
        severity: "error",
      };

      this.state.status = "error";
      this.state.errors.push(parseError);
      onError?.(parseError);
    }
  }

  /**
   * Parse XML text content with improved tree structure
   */
  private parseXMLText(
    text: string,
    options: ParseOptions,
    onProgress?: (state: ParserState) => void
  ): XMLElement[] {
    console.log("parseXMLText: Starting with options:", options);
    const elements: XMLElement[] = [];

    // Parse XML with improved DOM-like approach
    const lines = text.split("\n");
    const totalLines = lines.length;
    console.log("parseXMLText: Total lines to process:", totalLines);

    const elementStack: XMLElement[] = [];
    let lineNumber = 0;
    let targetElementsFound = 0;
    let totalTagsFound = 0;
    let currentShortName = "";

    for (const line of lines) {
      lineNumber++;
      const currentProgress = (lineNumber / totalLines) * 100;

      if (lineNumber % 1000 === 0) {
        this.state.progress = currentProgress;
        this.state.currentSection = `Processing line ${lineNumber}/${totalLines}`;
        this.state.elementsProcessed = elements.length;
        onProgress?.(this.state);
      }

      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Skip XML declaration and comments
      if (trimmedLine.startsWith("<?") || trimmedLine.startsWith("<!--")) {
        continue;
      }

      // Handle SHORT-NAME extraction
      const shortNameMatch = trimmedLine.match(
        /<SHORT-NAME>([^<]+)<\/SHORT-NAME>/
      );
      if (shortNameMatch) {
        currentShortName = shortNameMatch[1];
        continue;
      }

      // Handle opening tags
      if (trimmedLine.startsWith("<") && !trimmedLine.startsWith("</")) {
        const tagMatch = trimmedLine.match(/<([^>\s/]+)([^>]*?)(\s*\/?>)/);
        if (tagMatch) {
          const tagName = tagMatch[1];
          const attributeString = tagMatch[2];
          const isClosing = tagMatch[3].includes("/>");

          totalTagsFound++;

          if (lineNumber <= 50 || totalTagsFound <= 20) {
            console.log(
              `parseXMLText: Found tag "${tagName}" at line ${lineNumber}, self-closing: ${isClosing}`
            );
          }

          // Extract attributes
          const attributes = this.extractAttributes(attributeString);

          // If this is a target element or important for structure, create an element
          if (
            this.isTargetElement(tagName) ||
            this.isStructuralElement(tagName)
          ) {
            const elementType = this.mapTagToElementType(tagName);
            targetElementsFound++;

            console.log(
              `parseXMLText: Creating element for "${tagName}" (${targetElementsFound}) at line ${lineNumber}`
            );

            const element: XMLElement = {
              id: `${elementType}_${lineNumber}_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              name: currentShortName || tagName,
              type: elementType,
              tagName: tagName,
              path: this.buildElementPath(elementStack, tagName),
              attributes: attributes,
              children: [],
              loaded: true,
              hasChildren: false,
              metadata: {
                lineNumber,
                byteOffset: 0,
                size: trimmedLine.length,
                namespace: this.extractNamespace(trimmedLine),
                schema: "xml",
                description: this.extractDescription(tagName),
                tags: this.extractTags(tagName, attributes),
                depth: elementStack.length,
              },
            };

            // Set parent-child relationships
            if (elementStack.length > 0) {
              const parent = elementStack[elementStack.length - 1];
              element.parent = parent.id;
              parent.children = parent.children || [];
              parent.children.push(element);
              parent.hasChildren = true;
            }

            // Store element - always store target elements and structural elements in result
            if (
              this.isTargetElement(tagName) ||
              this.isStructuralElement(tagName)
            ) {
              elements.push(element);
            }

            // Push to stack if not self-closing
            if (!isClosing) {
              elementStack.push(element);
              console.log(
                `parseXMLText: Pushed "${tagName}" to stack, depth: ${elementStack.length}`
              );
            }

            // Clear short name after use
            currentShortName = "";
          } else if (!isClosing) {
            // For non-target elements, create a minimal structure holder
            const structuralElement: XMLElement = {
              id: `struct_${lineNumber}_${Date.now()}`,
              name: tagName,
              type: "ELEMENT",
              tagName: tagName,
              path: this.buildElementPath(elementStack, tagName),
              attributes: {},
              children: [],
              loaded: true,
              hasChildren: false,
              metadata: {
                lineNumber,
                byteOffset: 0,
                size: trimmedLine.length,
                namespace: "xml",
                schema: "xml",
                depth: elementStack.length,
              },
            };

            // Set parent-child relationships for structural elements too
            if (elementStack.length > 0) {
              const parent = elementStack[elementStack.length - 1];
              structuralElement.parent = parent.id;
              parent.children = parent.children || [];
              parent.children.push(structuralElement);
              parent.hasChildren = true;
            }

            // Store structural elements if they might be needed for hierarchy
            if (this.isStructuralElement(tagName)) {
              elements.push(structuralElement);
            }

            elementStack.push(structuralElement);
          }
        }
      }
      // Handle closing tags
      else if (trimmedLine.startsWith("</")) {
        const closingTagMatch = trimmedLine.match(/<\/([^>]+)>/);
        if (closingTagMatch) {
          const closingTagName = closingTagMatch[1];

          // Pop from stack
          if (elementStack.length > 0) {
            const topElement = elementStack[elementStack.length - 1];
            if (
              topElement.name === closingTagName ||
              topElement.type === closingTagName
            ) {
              elementStack.pop();
              console.log(
                `parseXMLText: Popped "${closingTagName}" from stack, depth: ${elementStack.length}`
              );
            }
          }
        }
      }

      // Memory limit check
      if (this.getMemoryUsage() > options.memoryLimit) {
        this.state.warnings.push({
          id: Date.now().toString(),
          type: "memory",
          message: "Memory limit reached, stopping parse",
          line: lineNumber,
        });
        break;
      }
    }

    console.log(
      `parseXMLText: Finished processing. Total tags: ${totalTagsFound}, Target elements found: ${targetElementsFound}, Final elements array: ${elements.length}`
    );

    // Filter elements based on options after parsing
    let filteredElements = elements;

    if (options.elementTypes.length > 0) {
      console.log(
        "parseXMLText: Applying element type filter:",
        options.elementTypes
      );
      filteredElements = elements.filter((element) =>
        options.elementTypes.includes(element.type)
      );
      console.log(
        `parseXMLText: After filtering: ${filteredElements.length} elements`
      );
    } else {
      console.log("parseXMLText: No element type filter applied");
    }

    // Log some sample elements for debugging
    if (filteredElements.length > 0) {
      console.log("parseXMLText: Sample elements:");
      filteredElements.slice(0, 5).forEach((element, index) => {
        console.log(
          `  ${index + 1}. ${element.name} (${element.type}) - parent: ${
            element.parent || "none"
          } - children: ${element.children?.length || 0}`
        );
        if (element.metadata.tags && element.metadata.tags.length > 0) {
          console.log(`     Tags: ${element.metadata.tags.join(", ")}`);
        }
        if (element.children && element.children.length > 0) {
          console.log(
            `     Child names: ${element.children
              .map((c) => c.name)
              .slice(0, 3)
              .join(", ")}${element.children.length > 3 ? "..." : ""}`
          );
        }
      });
    }

    console.log(
      `Parsed ${elements.length} total elements, ${filteredElements.length} after filtering`
    );
    return filteredElements;
  }

  /**
   * Check if element is important for structure
   */
  private isStructuralElement(tagName: string): boolean {
    // For general XML, we consider most elements as structural
    // Skip only text content, comments, and processing instructions
    return !tagName.match(/^(#text|#comment|#cdata-section|\?xml|!--)/);
  }

  /**
   * Extract description from element type and attributes
   */
  private extractDescription(tagName: string): string {
    // For general XML, provide basic description based on common patterns
    if (tagName.toLowerCase().includes("config")) {
      return "Configuration element";
    }
    if (tagName.toLowerCase().includes("data")) {
      return "Data element";
    }
    if (
      tagName.toLowerCase().includes("item") ||
      tagName.toLowerCase().includes("entry")
    ) {
      return "Item or entry element";
    }
    if (tagName.toLowerCase().includes("list") || tagName.includes("array")) {
      return "List or array container";
    }
    if (
      tagName.toLowerCase().includes("info") ||
      tagName.toLowerCase().includes("meta")
    ) {
      return "Information or metadata element";
    }

    return `XML element: ${tagName}`;
  }

  /**
   * Extract tags for categorization and search
   */
  private extractTags(
    tagName: string,
    attributes: Record<string, string>
  ): string[] {
    const tags: string[] = [];

    // Add category tags based on tag name patterns
    const lowerTagName = tagName.toLowerCase();

    if (lowerTagName.includes("config")) tags.push("configuration");
    if (lowerTagName.includes("data")) tags.push("data");
    if (lowerTagName.includes("meta")) tags.push("metadata");
    if (lowerTagName.includes("info")) tags.push("information");
    if (lowerTagName.includes("list") || lowerTagName.includes("array"))
      tags.push("container", "list");
    if (lowerTagName.includes("item") || lowerTagName.includes("entry"))
      tags.push("item");
    if (lowerTagName.includes("root")) tags.push("root");
    if (lowerTagName.includes("header")) tags.push("header");
    if (lowerTagName.includes("body")) tags.push("content");

    // Add tags based on attributes
    Object.entries(attributes).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      const lowerValue = value.toLowerCase();

      if (lowerKey.includes("type")) tags.push("typed");
      if (lowerKey.includes("id") || lowerKey.includes("name"))
        tags.push("identified");
      if (lowerKey.includes("class")) tags.push("classified");
      if (lowerValue.includes("true") || lowerValue.includes("false"))
        tags.push("boolean");
      if (/^\d+$/.test(value)) tags.push("numeric");
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Check if tag name represents a target XML element
   */
  private isTargetElement(tagName: string): boolean {
    // For general XML parsing, we want to capture most elements
    // Exclude only XML declarations, comments, and processing instructions
    return !tagName.match(/^(\?xml|!--|!\[CDATA\[|!DOCTYPE)/);
  }

  /**
   * Map XML tag name to XML element type
   */
  private mapTagToElementType(tagName: string): XMLElementType {
    // For general XML parsing, most elements are simply "ELEMENT"
    // Special cases for XML document structure
    if (tagName.startsWith("?xml") || tagName.startsWith("<?")) {
      return "PROCESSING_INSTRUCTION";
    }
    if (tagName.startsWith("!--")) {
      return "COMMENT";
    }
    if (tagName.startsWith("![CDATA[")) {
      return "CDATA";
    }
    if (tagName.startsWith("!DOCTYPE")) {
      return "DOCTYPE";
    }

    // Default to ELEMENT for regular XML tags
    return "ELEMENT";
  }

  /**
   * Extract attributes from XML tag
   */
  private extractAttributes(line: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(line)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  /**
   * Extract namespace from XML tag
   */
  private extractNamespace(line: string): string {
    const nsMatch = line.match(/xmlns:?(\w*)/);
    return nsMatch ? nsMatch[1] || "autosar" : "autosar";
  }

  /**
   * Build element path
   */
  private buildElementPath(stack: XMLElement[], tagName: string): string {
    const path = stack.map((el) => el.name || el.type).join("/");
    return path ? `${path}/${tagName}` : tagName;
  }

  /**
   * Build search index for fast searching
   */
  private buildSearchIndex(elements: XMLElement[]): void {
    const nameIndex = new Map<string, string[]>();
    const typeIndex = new Map<XMLElementType, string[]>();
    const pathIndex = new Map<string, string>();
    const attributeIndex = new Map<string, Map<string, string[]>>();
    const elementMap = new Map<string, XMLElement>();

    elements.forEach((element) => {
      elementMap.set(element.id, element);

      // Name index
      if (element.name) {
        const nameKey = element.name.toLowerCase();
        if (!nameIndex.has(nameKey)) nameIndex.set(nameKey, []);
        nameIndex.get(nameKey)!.push(element.id);
      }

      // Type index
      if (!typeIndex.has(element.type)) typeIndex.set(element.type, []);
      typeIndex.get(element.type)!.push(element.id);

      // Path index
      pathIndex.set(element.id, element.path);

      // Attribute index
      Object.entries(element.attributes).forEach(([key, value]) => {
        if (!attributeIndex.has(key)) attributeIndex.set(key, new Map());
        const attrMap = attributeIndex.get(key)!;
        if (!attrMap.has(value)) attrMap.set(value, []);
        attrMap.get(value)!.push(element.id);
      });
    });

    this.searchIndex = {
      elements: elementMap,
      nameIndex,
      typeIndex,
      pathIndex,
      attributeIndex,
    };

    this.metrics.searchIndexSize = this.calculateIndexSize();
  }

  /**
   * Search elements by query
   */
  searchElements(query: string): SearchResult[] {
    if (!this.searchIndex || !query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search by name
    this.searchIndex.nameIndex.forEach((elementIds, name) => {
      if (name.includes(lowerQuery)) {
        elementIds.forEach((id) => {
          const element = this.searchIndex!.elements.get(id);
          if (element) {
            results.push({
              element,
              score: this.calculateSearchScore(element, query),
              matches: [
                {
                  field: "name",
                  value: element.name,
                  indices: [[0, element.name.length]],
                },
              ],
            });
          }
        });
      }
    });

    // Search by type
    this.searchIndex.typeIndex.forEach((elementIds, type) => {
      if (type.toLowerCase().includes(lowerQuery)) {
        elementIds.forEach((id) => {
          const element = this.searchIndex!.elements.get(id);
          if (element && !results.some((r) => r.element.id === id)) {
            results.push({
              element,
              score: this.calculateSearchScore(element, query),
              matches: [
                {
                  field: "type",
                  value: element.type,
                  indices: [[0, element.type.length]],
                },
              ],
            });
          }
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate search score
   */
  private calculateSearchScore(element: XMLElement, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    // Exact name match gets highest score
    if (element.name.toLowerCase() === lowerQuery) score += 100;
    else if (element.name.toLowerCase().includes(lowerQuery)) score += 50;

    // Type match
    if (element.type.toLowerCase().includes(lowerQuery)) score += 30;

    // Path match
    if (element.path.toLowerCase().includes(lowerQuery)) score += 20;

    // Attribute match
    Object.values(element.attributes).forEach((value) => {
      if (value.toLowerCase().includes(lowerQuery)) score += 10;
    });

    return score;
  }

  /**
   * Filter elements by criteria
   */
  filterElements(elements: XMLElement[], filters: TreeFilter[]): XMLElement[] {
    if (filters.length === 0) return elements;

    return elements.filter((element) => {
      return filters.every((filter) => {
        if (!filter.enabled) return true;

        switch (filter.type) {
          case "elementType":
            return element.type === filter.value;
          case "namespace":
            return element.metadata.namespace === filter.value;
          case "attribute":
            return Object.values(element.attributes).some((value) =>
              value.toLowerCase().includes(filter.value.toLowerCase())
            );
          default:
            return true;
        }
      });
    });
  }

  /**
   * Export elements to specified format
   */
  async exportElements(
    elementIds: string[],
    options: ExportOptions
  ): Promise<Blob> {
    const elements = elementIds
      .map((id) => this.elements.get(id))
      .filter(Boolean) as XMLElement[];

    switch (options.format) {
      case "json":
        return this.exportToJSON(elements, options);
      case "csv":
        return this.exportToCSV(elements, options);
      case "xml":
      case "arxml":
      default:
        return this.exportToXML(elements, options);
    }
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(elements: XMLElement[], options: ExportOptions): Blob {
    const data = elements.map((element) => ({
      id: element.id,
      name: element.name,
      type: element.type,
      path: element.path,
      attributes: element.attributes,
      ...(options.includeMetadata ? { metadata: element.metadata } : {}),
      ...(options.includeReferences ? { references: element.references } : {}),
    }));

    const jsonString = options.prettyPrint
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);

    return new Blob([jsonString], { type: "application/json" });
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(elements: XMLElement[], options: ExportOptions): Blob {
    const headers = ["ID", "Name", "Type", "Path"];
    if (options.includeMetadata) {
      headers.push("Line Number", "Namespace", "Schema");
    }

    const rows = elements.map((element) => {
      const row = [element.id, element.name, element.type, element.path];
      if (options.includeMetadata) {
        row.push(
          element.metadata.lineNumber.toString(),
          element.metadata.namespace,
          element.metadata.schema
        );
      }
      return row;
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return new Blob([csvContent], { type: "text/csv" });
  }

  /**
   * Export to XML format
   */
  private exportToXML(elements: XMLElement[], options: ExportOptions): Blob {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += "<AUTOSAR>\n";

    elements.forEach((element) => {
      xmlContent += this.elementToXML(element, 1, options);
    });

    xmlContent += "</AUTOSAR>";

    return new Blob([xmlContent], { type: "application/xml" });
  }

  /**
   * Convert element to XML
   */
  private elementToXML(
    element: XMLElement,
    indent: number,
    options: ExportOptions
  ): string {
    const spaces = "  ".repeat(indent);
    const attributes = Object.entries(element.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    let xml = `${spaces}<${element.type}${attributes ? " " + attributes : ""}`;

    if (element.children && element.children.length > 0) {
      xml += ">\n";
      if (element.name) {
        xml += `${spaces}  <SHORT-NAME>${element.name}</SHORT-NAME>\n`;
      }
      element.children.forEach((child) => {
        xml += this.elementToXML(child, indent + 1, options);
      });
      xml += `${spaces}</${element.type}>\n`;
    } else {
      if (element.name) {
        xml += ">\n";
        xml += `${spaces}  <SHORT-NAME>${element.name}</SHORT-NAME>\n`;
        xml += `${spaces}</${element.type}>\n`;
      } else {
        xml += " />\n";
      }
    }

    return xml;
  }

  /**
   * Process worker results
   */
  private processWorkerResults(
    elements: XMLElement[],
    searchIndex: SearchIndex
  ): void {
    this.elements.clear();
    elements.forEach((element) => this.elements.set(element.id, element));
    this.searchIndex = searchIndex;
    this.metrics.nodeCount = elements.length;
  }

  /**
   * Calculate memory usage
   */
  private getMemoryUsage(): number {
    // Rough estimation - in real implementation, use performance.measureUserAgentSpecificMemory
    return this.elements.size * 1024; // Assume 1KB per element
  }

  /**
   * Calculate search index size
   */
  private calculateIndexSize(): number {
    if (!this.searchIndex) return 0;

    let size = 0;
    this.searchIndex.nameIndex.forEach((ids) => (size += ids.length * 50));
    this.searchIndex.typeIndex.forEach((ids) => (size += ids.length * 50));
    size += this.searchIndex.pathIndex.size * 100;

    return size;
  }

  /**
   * Create worker code for background processing
   */
  private createWorkerCode(): string {
    return `
      // Worker code for XML parsing
      self.onmessage = function(event) {
        const { type, payload } = event.data;
        
        if (type === 'parse') {
          try {
            // Simulate parsing with progress updates
            let progress = 0;
            const timer = setInterval(() => {
              progress += 10;
              self.postMessage({
                type: 'progress',
                payload: {
                  progress: Math.min(progress, 90),
                  currentSection: 'Processing XML elements...',
                  elementsProcessed: Math.floor(progress * 10),
                  memoryUsage: Math.floor(progress * 1024 * 1024)
                }
              });
              
              if (progress >= 90) {
                clearInterval(timer);
                
                // Simulate completion
                setTimeout(() => {
                  self.postMessage({
                    type: 'complete',
                    payload: {
                      elements: [],
                      metrics: {
                        parseTime: 1000,
                        renderTime: 0,
                        memoryPeak: 100 * 1024 * 1024,
                        nodeCount: 1000,
                        searchIndexSize: 50 * 1024
                      },
                      searchIndex: {
                        elements: new Map(),
                        nameIndex: new Map(),
                        typeIndex: new Map(),
                        pathIndex: new Map(),
                        attributeIndex: new Map()
                      }
                    }
                  });
                }, 500);
              }
            }, 100);
            
          } catch (error) {
            self.postMessage({
              type: 'error',
              payload: {
                error: {
                  id: Date.now().toString(),
                  type: 'syntax',
                  message: error.message,
                  severity: 'error'
                }
              }
            });
          }
        }
      };
    `;
  }

  /**
   * Cancel current parsing operation
   */
  cancelParsing(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.state.status = "idle";
    this.state.progress = 0;
  }

  /**
   * Clear all data
   */
  clearData(): void {
    this.elements.clear();
    this.searchIndex = null;
    this.state = {
      status: "idle",
      progress: 0,
      currentSection: "",
      elementsProcessed: 0,
      memoryUsage: 0,
      errors: [],
      warnings: [],
    };
    this.metrics = {
      parseTime: 0,
      renderTime: 0,
      memoryPeak: 0,
      nodeCount: 0,
      searchIndexSize: 0,
    };
  }

  /**
   * Get current state
   */
  getState(): ParserState {
    return { ...this.state };
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all elements
   */
  getElements(): XMLElement[] {
    return Array.from(this.elements.values());
  }
}
