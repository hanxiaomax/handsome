/**
 * XML Formatter Utilities
 *
 * This module provides various XML formatting functions including
 * beautification, compression, and JSON conversion.
 */

/**
 * Beautify XML content with proper indentation and formatting
 */
export function beautifyXML(content: string): string {
  try {
    const normalized = content
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n\s*\n/g, "\n")
      .trim();
    return formatXMLManually(normalized);
  } catch (error) {
    console.warn("XML beautification error:", error);
    return content.replace(/></g, ">\n<");
  }
}

/**
 * Manual XML formatting with proper indentation
 */
function formatXMLManually(content: string): string {
  let formatted = content.replace(/></g, ">\n<").replace(/^\s+|\s+$/g, "");
  formatted = formatted.replace(/>\s*([^<>\s][^<]*?)\s*</g, ">$1<");

  const lines = formatted.split("\n");
  let indentLevel = 0;
  const indentSize = 2;
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    const isClosingTag = trimmed.startsWith("</");
    const isSelfClosingTag = trimmed.match(/^<[^>]+\/>$/);
    const isProcessingInstruction = trimmed.startsWith("<?");
    const isComment = trimmed.startsWith("<!--");
    const isDTD =
      trimmed.startsWith("<!DOCTYPE") ||
      trimmed.startsWith("<!ELEMENT") ||
      trimmed.startsWith("<!ATTLIST");
    const isOpeningTag =
      trimmed.startsWith("<") &&
      !isClosingTag &&
      !isSelfClosingTag &&
      !isProcessingInstruction &&
      !isComment &&
      !isDTD;

    const mixedContentMatch = trimmed.match(/^(<[^>]+>)([^<]+)(<\/[^>]+>)$/);
    if (mixedContentMatch) {
      result.push(" ".repeat(indentLevel * indentSize) + trimmed);
      continue;
    }

    if (isClosingTag) {
      indentLevel = Math.max(0, indentLevel - 1);
      result.push(" ".repeat(indentLevel * indentSize) + trimmed);
      continue;
    }

    if (isSelfClosingTag || isProcessingInstruction || isComment || isDTD) {
      result.push(" ".repeat(indentLevel * indentSize) + trimmed);
      continue;
    }

    if (isOpeningTag) {
      result.push(" ".repeat(indentLevel * indentSize) + trimmed);
      indentLevel++;
      continue;
    }

    if (trimmed.length > 0) {
      result.push(" ".repeat(indentLevel * indentSize) + trimmed);
    }
  }

  return result.join("\n");
}

/**
 * Compress XML content by removing unnecessary whitespace
 */
export function compressXML(content: string): string {
  const compressed = content
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();

  const maxLineLength = 120;
  const lines: string[] = [];
  let currentLine = "";

  const parts = compressed.split(/(<[^>]*>)/);

  for (const part of parts) {
    if (!part) continue;

    if (currentLine.length + part.length > maxLineLength) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = part;
      } else {
        lines.push(part);
      }
    } else {
      currentLine += part;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join("\n");
}

/**
 * Convert XML content to JSON format
 */
export function convertXMLToJSON(content: string): string {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");

    const xmlToJson = (node: Node): Record<string, unknown> => {
      const result: Record<string, unknown> = {};

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.attributes && element.attributes.length > 0) {
          const attrs: Record<string, string> = {};
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[`@${attr.name}`] = attr.value;
          }
          result.attributes = attrs;
        }
      }

      const children: Record<string, unknown> = {};

      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];

        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim();
          if (text) {
            result.text = text;
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const childName = child.nodeName;
          const childValue = xmlToJson(child);

          if (children[childName]) {
            if (!Array.isArray(children[childName])) {
              children[childName] = [children[childName]];
            }
            (children[childName] as unknown[]).push(childValue);
          } else {
            children[childName] = childValue;
          }
        }
      }

      if (Object.keys(children).length > 0) {
        result.children = children;
      }

      return result;
    };

    const json = xmlToJson(xmlDoc.documentElement);
    return JSON.stringify(json, null, 2);
  } catch {
    return JSON.stringify({ error: "Failed to convert XML to JSON" }, null, 2);
  }
}
