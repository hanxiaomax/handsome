// ARXML Element Types
export type ARXMLElementType =
  | "AR-PACKAGE"
  | "SW-COMPONENT-TYPE"
  | "APPLICATION-SW-COMPONENT-TYPE"
  | "COMPLEX-DEVICE-DRIVER-SW-COMPONENT-TYPE"
  | "ECU-ABSTRACTION-SW-COMPONENT-TYPE"
  | "SERVICE-SW-COMPONENT-TYPE"
  | "SENSOR-ACTUATOR-SW-COMPONENT-TYPE"
  | "COMPOSITION-SW-COMPONENT-TYPE"
  | "PORT-INTERFACE"
  | "SENDER-RECEIVER-INTERFACE"
  | "CLIENT-SERVER-INTERFACE"
  | "MODE-SWITCH-INTERFACE"
  | "NV-DATA-INTERFACE"
  | "PARAMETER-INTERFACE"
  | "TRIGGER-INTERFACE"
  | "DATA-TYPE"
  | "IMPLEMENTATION-DATA-TYPE"
  | "APPLICATION-PRIMITIVE-DATA-TYPE"
  | "APPLICATION-ARRAY-DATA-TYPE"
  | "APPLICATION-RECORD-DATA-TYPE"
  | "AUTOSAR-DATA-TYPE"
  | "PRIMITIVE-DATA-TYPE"
  | "ARRAY-DATA-TYPE"
  | "RECORD-DATA-TYPE"
  | "POINTER-DATA-TYPE"
  | "FUNCTION-POINTER-DATA-TYPE"
  | "CONSTANT-SPECIFICATION"
  | "VARIABLE-DATA-PROTOTYPE"
  | "OPERATION-PROTOTYPE"
  | "ARGUMENT-DATA-PROTOTYPE"
  | "FIELD-PROTOTYPE"
  | "MODE-DECLARATION-GROUP"
  | "MODE-DECLARATION"
  | "TRIGGER-PROTOTYPE"
  | "INTERNAL-BEHAVIOR"
  | "SWC-INTERNAL-BEHAVIOR"
  | "IMPLEMENTATION"
  | "SWC-IMPLEMENTATION"
  | "BSW-MODULE-DESCRIPTION"
  | "BSW-MODULE-ENTRY"
  | "COMMUNICATION-CLUSTER"
  | "CAN-CLUSTER"
  | "ETHERNET-CLUSTER"
  | "FLEXRAY-CLUSTER"
  | "LIN-CLUSTER"
  | "TTCAN-CLUSTER"
  | "NETWORK-ENDPOINT"
  | "APPLICATION-ENDPOINT"
  | "SERVICE-INSTANCE"
  | "PROVIDED-SERVICE-INSTANCE"
  | "REQUIRED-SERVICE-INSTANCE"
  | "EVENT-GROUP"
  | "SOMEIP-SERVICE-INTERFACE-DEPLOYMENT"
  | "SOMEIP-METHOD-DEPLOYMENT"
  | "SOMEIP-EVENT-DEPLOYMENT"
  | "SOMEIP-FIELD-DEPLOYMENT"
  | "SOMEIP-EVENT-GROUP-DEPLOYMENT"
  | "FIBEX-ELEMENT"
  | "SYSTEM"
  | "ROOT-SW-COMPOSITION-PROTOTYPE"
  | "SW-COMPOSITION-PROTOTYPE"
  | "COMPONENT-PROTOTYPE"
  | "CONNECTOR-PROTOTYPE"
  | "ASSEMBLY-SW-CONNECTOR"
  | "DELEGATION-SW-CONNECTOR"
  | "PASS-THROUGH-SW-CONNECTOR"
  | "UNKNOWN";

export interface ARXMLElement {
  id: string;
  name: string;
  type: ARXMLElementType;
  path: string;
  attributes: Record<string, string>;
  children?: ARXMLElement[];
  references?: ElementReference[];
  parent?: string;
  loaded: boolean;
  hasChildren: boolean;
  metadata: ElementMetadata;
}

export interface ElementReference {
  type: "reference" | "definition";
  target: string;
  path: string;
  resolved: boolean;
}

export interface ElementMetadata {
  lineNumber: number;
  byteOffset: number;
  size: number;
  namespace: string;
  schema: string;
  description?: string;
  tags?: string[];
}

// Parser Configuration
export interface ParseOptions {
  packages: string[];
  elementTypes: ARXMLElementType[];
  maxDepth: number;
  maxElements: number;
  validateSchema: boolean;
  enableReferences: boolean;
  memoryLimit: number;
}

// Parser State Management
export interface ParserState {
  status: "idle" | "parsing" | "loading" | "complete" | "error";
  progress: number;
  currentSection: string;
  elementsProcessed: number;
  memoryUsage: number;
  errors: ParseError[];
  warnings: ParseWarning[];
}

export interface ParseError {
  id: string;
  type: "syntax" | "schema" | "reference" | "memory";
  message: string;
  line?: number;
  column?: number;
  path?: string;
  severity: "error" | "warning";
}

export interface ParseWarning {
  id: string;
  type: "deprecated" | "missing" | "performance" | "memory";
  message: string;
  line?: number;
  path?: string;
}

// Tree Visualization State
export interface TreeState {
  expandedNodes: Set<string>;
  selectedNode: string | null;
  visibleRange: [number, number];
  searchQuery: string;
  filters: TreeFilter[];
  sortMode: "name" | "type" | "path";
}

export interface TreeFilter {
  id: string;
  type: "elementType" | "attribute" | "namespace" | "reference";
  value: string;
  enabled: boolean;
}

// Performance Monitoring
export interface PerformanceMetrics {
  parseTime: number;
  renderTime: number;
  memoryPeak: number;
  nodeCount: number;
  searchIndexSize: number;
}

// Search and Indexing
export interface SearchIndex {
  elements: Map<string, ARXMLElement>;
  nameIndex: Map<string, string[]>;
  typeIndex: Map<ARXMLElementType, string[]>;
  pathIndex: Map<string, string>;
  attributeIndex: Map<string, Map<string, string[]>>;
}

export interface SearchResult {
  element: ARXMLElement;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: "name" | "type" | "path" | "attribute";
  value: string;
  indices: [number, number][];
}

// Virtual Tree Rendering
export interface VirtualTreeItem {
  id: string;
  element: ARXMLElement;
  level: number;
  index: number;
  visible: boolean;
  expanded: boolean;
  selected: boolean;
}

// File Processing
export interface FileProcessingOptions {
  chunkSize: number;
  maxFileSize: number;
  useWorker: boolean;
  validateContent: boolean;
  preserveComments: boolean;
  preserveWhitespace: boolean;
}

// Export Configuration
export interface ExportOptions {
  format: "arxml" | "json" | "xml" | "csv";
  includeMetadata: boolean;
  includeReferences: boolean;
  selectedOnly: boolean;
  prettyPrint: boolean;
  validateOutput: boolean;
}

// Parser Actions
export interface ParserActions {
  parseFile: (file: File, options: ParseOptions) => Promise<void>;
  cancelParsing: () => void;
  selectElements: (elementIds: string[]) => void;
  expandNode: (elementId: string) => void;
  collapseNode: (elementId: string) => void;
  searchElements: (query: string) => SearchResult[];
  filterElements: (filters: TreeFilter[]) => void;
  exportElements: (
    elementIds: string[],
    options: ExportOptions
  ) => Promise<Blob>;
  clearData: () => void;
}

// Worker Messages
export interface WorkerMessage {
  type:
    | "parse"
    | "search"
    | "filter"
    | "export"
    | "progress"
    | "error"
    | "complete";
  payload?: Record<string, unknown>;
  id?: string;
}

export interface WorkerParseMessage extends WorkerMessage {
  type: "parse";
  payload: {
    fileBuffer: ArrayBuffer;
    options: ParseOptions;
  };
}

export interface WorkerProgressMessage extends WorkerMessage {
  type: "progress";
  payload: {
    progress: number;
    currentSection: string;
    elementsProcessed: number;
    memoryUsage: number;
  };
}

export interface WorkerCompleteMessage extends WorkerMessage {
  type: "complete";
  payload: {
    elements: ARXMLElement[];
    metrics: PerformanceMetrics;
    searchIndex: SearchIndex;
  };
}

export interface WorkerErrorMessage extends WorkerMessage {
  type: "error";
  payload: {
    error: ParseError;
  };
}
