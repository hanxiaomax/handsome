import { XMLParser, XMLBuilder } from "fast-xml-parser";
import type { XMLElement } from "../types";

// Fast XML Parser configuration
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  ignoreNameSpace: false,
  parseTagValue: false,
  parseNodeValue: false,
  parseAttributeValue: false,
  trimValues: true,
  cdataPropName: "#cdata",
  commentPropName: "#comment",
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
};

// Builder options for converting back to XML
const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  cdataPropName: "#cdata",
  commentPropName: "#comment",
  format: true,
  indentBy: "  ",
  suppressEmptyNode: false,
  suppressBooleanAttributes: false,
};

export interface ParsedXMLNode {
  tagName: string;
  attributes: Record<string, string>;
  children: ParsedXMLNode[];
  textContent?: string;
  path: string;
  depth: number;
  uuid?: string;
}

export class FastXMLParser {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    this.parser = new XMLParser(parserOptions);
    this.builder = new XMLBuilder(builderOptions);
  }

  /**
   * Parse XML content and convert to tree structure
   */
  parseXMLToTree(xmlContent: string): ParsedXMLNode[] {
    try {
      // Parse XML content
      const parsed = this.parser.parse(xmlContent);

      // Convert to our tree structure
      const treeNodes = this.convertToTreeNodes(parsed, "", 0);

      return treeNodes;
    } catch (error) {
      console.error("XML parsing error:", error);
      throw new Error(
        `Failed to parse XML: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Convert parsed JSON structure to tree nodes
   */
  private convertToTreeNodes(
    obj: Record<string, unknown>,
    parentPath: string = "",
    depth: number = 0
  ): ParsedXMLNode[] {
    const nodes: ParsedXMLNode[] = [];

    if (typeof obj !== "object" || obj === null) {
      return nodes;
    }

    for (const [key, value] of Object.entries(obj)) {
      // Skip special properties
      if (key.startsWith("#") || key.startsWith("?")) {
        continue;
      }

      const currentPath = parentPath ? `${parentPath}/${key}` : key;

      if (Array.isArray(value)) {
        // Handle array of elements with same tag name
        value.forEach((item, index) => {
          const node = this.createTreeNode(
            key,
            item,
            `${currentPath}[${index}]`,
            depth
          );
          if (node) {
            nodes.push(node);
          }
        });
      } else {
        const node = this.createTreeNode(key, value, currentPath, depth);
        if (node) {
          nodes.push(node);
        }
      }
    }

    return nodes;
  }

  /**
   * Create a single tree node
   */
  private createTreeNode(
    tagName: string,
    value: unknown,
    path: string,
    depth: number
  ): ParsedXMLNode | null {
    if (typeof value !== "object" || value === null) {
      // Simple text node
      return {
        tagName,
        attributes: {},
        children: [],
        textContent: String(value),
        path,
        depth,
      };
    }

    const attributes: Record<string, string> = {};
    let textContent: string | undefined;
    const childNodes: ParsedXMLNode[] = [];

    // Extract attributes and text content
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("@")) {
        // Attribute
        attributes[key.substring(1)] = String(val);
      } else if (key === "#text") {
        // Text content
        textContent = String(val).trim();
      } else if (key === "#cdata") {
        // CDATA content
        textContent = String(val);
      } else {
        // Child elements
        if (Array.isArray(val)) {
          val.forEach((item, index) => {
            const childNode = this.createTreeNode(
              key,
              item,
              `${path}/${key}[${index}]`,
              depth + 1
            );
            if (childNode) {
              childNodes.push(childNode);
            }
          });
        } else {
          const childNode = this.createTreeNode(
            key,
            val,
            `${path}/${key}`,
            depth + 1
          );
          if (childNode) {
            childNodes.push(childNode);
          }
        }
      }
    }

    // Extract UUID from attributes if present
    const uuid = attributes.UUID || attributes.uuid || attributes.id;

    return {
      tagName,
      attributes,
      children: childNodes,
      textContent: textContent || undefined,
      path,
      depth,
      uuid,
    };
  }

  /**
   * Convert tree nodes back to XML format
   */
  convertTreeToXML(nodes: ParsedXMLNode[]): string {
    try {
      const xmlObj = this.convertTreeNodesToObject(nodes);
      return this.builder.build(xmlObj);
    } catch (error) {
      console.error("XML building error:", error);
      throw new Error(
        `Failed to build XML: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Convert tree nodes back to object structure for XML builder
   */
  private convertTreeNodesToObject(
    nodes: ParsedXMLNode[]
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const node of nodes) {
      const nodeObj: Record<string, unknown> = {};

      // Add attributes
      for (const [key, value] of Object.entries(node.attributes)) {
        nodeObj[`@${key}`] = value;
      }

      // Add text content
      if (node.textContent) {
        nodeObj["#text"] = node.textContent;
      }

      // Add children
      if (node.children.length > 0) {
        const childrenObj = this.convertTreeNodesToObject(node.children);
        Object.assign(nodeObj, childrenObj);
      }

      // Handle multiple elements with same tag name
      if (result[node.tagName]) {
        if (!Array.isArray(result[node.tagName])) {
          result[node.tagName] = [result[node.tagName]];
        }
        result[node.tagName].push(nodeObj);
      } else {
        result[node.tagName] = nodeObj;
      }
    }

    return result;
  }

  /**
   * Convert ParsedXMLNode to XMLElement format (for compatibility)
   */
  convertToXMLElements(nodes: ParsedXMLNode[]): XMLElement[] {
    const elements: XMLElement[] = [];

    const convertNode = (
      node: ParsedXMLNode,
      parent?: XMLElement
    ): XMLElement => {
      const element: XMLElement = {
        id: `${node.tagName}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        name: node.tagName,
        type: this.getElementType(node.tagName),
        tagName: node.tagName,
        path: node.path,
        attributes: node.attributes,
        children: [],
        loaded: true,
        hasChildren: node.children.length > 0,
        parent: parent?.id,
        metadata: {
          lineNumber: 0, // Not available from fast-xml-parser
          byteOffset: 0,
          size: 0,
          namespace: this.extractNamespace(node.attributes),
          schema: "xml",
          description: this.getDescription(node.tagName),
          tags: this.getTags(node.tagName, node.attributes),
          depth: node.depth,
        },
      };

      // Convert children
      if (element.children) {
        for (const childNode of node.children) {
          const childElement = convertNode(childNode, element);
          element.children.push(childElement);
        }
      }

      return element;
    };

    for (const node of nodes) {
      elements.push(convertNode(node));
    }

    return elements;
  }

  private getElementType(tagName: string): any {
    // Map tag names to element types (simplified)
    if (tagName.includes("PACKAGE")) return "PACKAGE";
    if (tagName.includes("COMPONENT")) return "COMPONENT";
    if (tagName.includes("INTERFACE")) return "INTERFACE";
    if (tagName.includes("PORT")) return "PORT";
    return "ELEMENT";
  }

  private extractNamespace(attributes: Record<string, string>): string {
    return attributes.xmlns || attributes["xmlns:"] || "";
  }

  private getDescription(tagName: string): string {
    // Provide descriptions based on tag names
    const descriptions: Record<string, string> = {
      AUTOSAR: "Root AUTOSAR element",
      "AR-PACKAGES": "AUTOSAR packages container",
      "AR-PACKAGE": "AUTOSAR package",
      "SHORT-NAME": "Short name identifier",
      ELEMENTS: "Elements container",
      "APPLICATION-SW-COMPONENT-TYPE": "Application software component type",
      PORTS: "Ports container",
      "P-PORT-PROTOTYPE": "Provided port prototype",
      "R-PORT-PROTOTYPE": "Required port prototype",
    };
    return descriptions[tagName] || `${tagName} element`;
  }

  private getTags(
    tagName: string,
    attributes: Record<string, string>
  ): string[] {
    const tags: string[] = [tagName.toLowerCase()];

    if (attributes.UUID) tags.push("uuid");
    if (attributes.DEST) tags.push("reference");
    if (tagName.includes("COMPONENT")) tags.push("component");
    if (tagName.includes("INTERFACE")) tags.push("interface");
    if (tagName.includes("PORT")) tags.push("port");

    return tags;
  }
}

// Export singleton instance
export const xmlParser = new FastXMLParser();
