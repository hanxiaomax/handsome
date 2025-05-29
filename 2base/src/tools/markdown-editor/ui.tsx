import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { ToolLayout } from "@/components/layout/tool-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Table,
  List,
  ListOrdered,
  Quote,
  Eye,
  FileText,
  Download,
  Upload,
  Settings,
  Copy,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { useMinimizedTools } from "@/contexts/minimized-tools-context";
import { toolInfo } from "./toolInfo";
import { MarkdownEngine } from "./lib";
import type {
  EditorState,
  EditorConfig,
  ViewMode,
  TextSelection,
  ToolbarAction,
  EditorStats,
  MarkdownParseResult,
} from "./lib/types";

const initialConfig: EditorConfig = {
  theme: "auto",
  fontSize: 14,
  lineNumbers: true,
  wordWrap: true,
  autoSave: true,
  vim: false,
  previewSync: true,
  previewVisible: true,
  splitRatio: 0.5,
};

const initialState: EditorState = {
  content: `# Welcome to Markdown Editor

This is a **powerful** Markdown editor with *real-time* preview capabilities.

## Features

- ✨ Real-time preview
- 🎨 Syntax highlighting
- 📝 Rich toolbar
- 📁 File import/export
- 🔧 Customizable settings
- ⚡ Keyboard shortcuts

## Example Code

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Table Example

| Feature | Status | Notes |
|---------|--------|-------|
| Preview | ✅ | Real-time |
| Export | ✅ | Multiple formats |
| Themes | ⚡ | Coming soon |

> **Tip:** Use the toolbar buttons or keyboard shortcuts for quick formatting!

---

Happy writing! 📚`,
  cursorPosition: 0,
  selectionStart: 0,
  selectionEnd: 0,
  scrollPosition: 0,
  isDirty: false,
  fileName: "untitled.md",
  lastSaved: null,
};

export default function MarkdownEditor() {
  const navigate = useNavigate();
  const { minimizeTool } = useMinimizedTools();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Editor state
  const [state, setState] = useState<EditorState>(initialState);
  const [config, setConfig] = useState<EditorConfig>(initialConfig);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [parseResult, setParseResult] = useState<MarkdownParseResult | null>(
    null
  );
  const [stats, setStats] = useState<EditorStats | null>(null);

  // Refs
  const engine = useRef(new MarkdownEngine());
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Dialogs
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);

  // Window control handlers
  const handleClose = useCallback(() => navigate("/"), [navigate]);
  const handleMinimize = useCallback(() => {
    minimizeTool(toolInfo);
    navigate("/");
  }, [minimizeTool, navigate]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Get current selection
  const getCurrentSelection = useCallback((): TextSelection => {
    const textarea = editorRef.current;
    if (!textarea) {
      return { start: 0, end: 0, text: "" };
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = state.content.substring(start, end);

    return { start, end, text };
  }, [state.content]);

  // Update editor content
  const updateContent = useCallback(
    (newContent: string, cursorPos?: number) => {
      setState((prev) => ({
        ...prev,
        content: newContent,
        cursorPosition: cursorPos ?? prev.cursorPosition,
        isDirty: true,
      }));

      // Update cursor position
      if (cursorPos !== undefined && editorRef.current) {
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.setSelectionRange(cursorPos, cursorPos);
            editorRef.current.focus();
          }
        }, 0);
      }
    },
    []
  );

  // Toolbar actions
  const toolbarActions: ToolbarAction[] = useMemo(
    () => [
      {
        id: "bold",
        label: "Bold",
        icon: Bold,
        shortcut: "Ctrl+B",
        action: (content, selection) =>
          engine.current.formatBold(content, selection),
      },
      {
        id: "italic",
        label: "Italic",
        icon: Italic,
        shortcut: "Ctrl+I",
        action: (content, selection) =>
          engine.current.formatItalic(content, selection),
      },
      {
        id: "strikethrough",
        label: "Strikethrough",
        icon: Strikethrough,
        shortcut: "Ctrl+Shift+S",
        action: (content, selection) => ({
          content:
            selection.start === selection.end
              ? content.substring(0, selection.start) +
                "~~~~" +
                content.substring(selection.start)
              : content.substring(0, selection.start) +
                "~~" +
                selection.text +
                "~~" +
                content.substring(selection.end),
          cursorPosition:
            selection.start === selection.end
              ? selection.start + 2
              : selection.end + 4,
        }),
      },
      {
        id: "code",
        label: "Inline Code",
        icon: Code,
        shortcut: "Ctrl+`",
        action: (content, selection) => ({
          content:
            selection.start === selection.end
              ? content.substring(0, selection.start) +
                "``" +
                content.substring(selection.start)
              : content.substring(0, selection.start) +
                "`" +
                selection.text +
                "`" +
                content.substring(selection.end),
          cursorPosition:
            selection.start === selection.end
              ? selection.start + 1
              : selection.end + 2,
        }),
        separator: true,
      },
      {
        id: "h1",
        label: "Heading 1",
        icon: Heading1,
        shortcut: "Ctrl+1",
        action: (content, selection) =>
          engine.current.insertHeading(content, selection, 1),
      },
      {
        id: "h2",
        label: "Heading 2",
        icon: Heading2,
        shortcut: "Ctrl+2",
        action: (content, selection) =>
          engine.current.insertHeading(content, selection, 2),
      },
      {
        id: "h3",
        label: "Heading 3",
        icon: Heading3,
        shortcut: "Ctrl+3",
        action: (content, selection) =>
          engine.current.insertHeading(content, selection, 3),
        separator: true,
      },
      {
        id: "link",
        label: "Link",
        icon: Link,
        shortcut: "Ctrl+K",
        action: () => {
          setShowLinkDialog(true);
          return {
            content: state.content,
            cursorPosition: state.cursorPosition,
          };
        },
      },
      {
        id: "image",
        label: "Image",
        icon: Image,
        shortcut: "Ctrl+Shift+I",
        action: () => {
          setShowImageDialog(true);
          return {
            content: state.content,
            cursorPosition: state.cursorPosition,
          };
        },
      },
      {
        id: "table",
        label: "Table",
        icon: Table,
        shortcut: "Ctrl+T",
        action: () => {
          setShowTableDialog(true);
          return {
            content: state.content,
            cursorPosition: state.cursorPosition,
          };
        },
        separator: true,
      },
      {
        id: "ul",
        label: "Unordered List",
        icon: List,
        shortcut: "Ctrl+Shift+8",
        action: (content, selection) => ({
          content:
            content.substring(0, selection.start) +
            "- " +
            content.substring(selection.start),
          cursorPosition: selection.start + 2,
        }),
      },
      {
        id: "ol",
        label: "Ordered List",
        icon: ListOrdered,
        shortcut: "Ctrl+Shift+7",
        action: (content, selection) => ({
          content:
            content.substring(0, selection.start) +
            "1. " +
            content.substring(selection.start),
          cursorPosition: selection.start + 3,
        }),
      },
      {
        id: "quote",
        label: "Quote",
        icon: Quote,
        shortcut: "Ctrl+Shift+>",
        action: (content, selection) => ({
          content:
            content.substring(0, selection.start) +
            "> " +
            content.substring(selection.start),
          cursorPosition: selection.start + 2,
        }),
      },
    ],
    [state.content, state.cursorPosition]
  );

  // Handle toolbar action
  const handleToolbarAction = useCallback(
    (actionId: string) => {
      const action = toolbarActions.find((a) => a.id === actionId);
      if (!action) return;

      const selection = getCurrentSelection();
      const result = action.action(state.content, selection);

      updateContent(result.content, result.cursorPosition);
    },
    [toolbarActions, getCurrentSelection, state.content, updateContent]
  );

  // Parse markdown with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const result = engine.current.parseMarkdown(state.content);
      setParseResult(result);

      const editorStats = engine.current.calculateStats(
        state.content,
        state.cursorPosition
      );
      setStats(editorStats);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [state.content, state.cursorPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorRef.current || editorRef.current !== document.activeElement)
        return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            handleToolbarAction("bold");
            break;
          case "i":
            e.preventDefault();
            handleToolbarAction("italic");
            break;
          case "k":
            e.preventDefault();
            handleToolbarAction("link");
            break;
          case "`":
            e.preventDefault();
            handleToolbarAction("code");
            break;
          case "1":
            if (!e.shiftKey) {
              e.preventDefault();
              handleToolbarAction("h1");
            }
            break;
          case "2":
            if (!e.shiftKey) {
              e.preventDefault();
              handleToolbarAction("h2");
            }
            break;
          case "3":
            if (!e.shiftKey) {
              e.preventDefault();
              handleToolbarAction("h3");
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleToolbarAction]);

  // File operations
  const handleFileImport = useCallback(async (file: File) => {
    try {
      const result = await engine.current.importFile(file);
      setState((prev) => ({
        ...prev,
        content: result.content,
        fileName: result.fileName,
        isDirty: false,
        lastSaved: new Date(),
      }));
      toast.success(`Imported ${result.fileName}`);
    } catch {
      toast.error("Failed to import file");
    }
  }, []);

  const handleExport = useCallback(
    (format: "markdown" | "html") => {
      engine.current.exportContent(state.content, {
        format,
        fileName: state.fileName?.replace(/\.[^/.]+$/, "") || "document",
        includeTOC: false,
        includeCSS: format === "html",
      });
      toast.success(`Exported as ${format.toUpperCase()}`);
      setShowExport(false);
    },
    [state.content, state.fileName]
  );

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.content);
      toast.success("Content copied to clipboard");
    } catch {
      toast.error("Failed to copy content");
    }
  }, [state.content]);

  return (
    <TooltipProvider>
      <ToolLayout
        toolName={toolInfo.name}
        toolDescription={toolInfo.description}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
      >
        <div className="w-full h-full flex flex-col p-6 space-y-4 mt-5">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{state.fileName}</Badge>
                  {state.isDirty && (
                    <Badge variant="destructive">Unsaved</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Selector */}
                  <Tabs
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as ViewMode)}
                    className="w-auto"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="editor">
                        <FileText className="h-4 w-4 mr-1" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="split">
                        <Maximize2 className="h-4 w-4 mr-1" />
                        Split
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Separator orientation="vertical" className="h-8" />

                  {/* File Operations */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".md,.markdown,.txt";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) handleFileImport(file);
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Import file</TooltipContent>
                    </Tooltip>

                    <Dialog open={showExport} onOpenChange={setShowExport}>
                      <DialogTrigger asChild>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Export file</TooltipContent>
                        </Tooltip>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Export Document</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Button
                            onClick={() => handleExport("markdown")}
                            className="w-full"
                          >
                            Export as Markdown (.md)
                          </Button>
                          <Button
                            onClick={() => handleExport("html")}
                            className="w-full"
                          >
                            Export as HTML (.html)
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={handleCopy}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy content</TooltipContent>
                    </Tooltip>

                    <Dialog open={showSettings} onOpenChange={setShowSettings}>
                      <DialogTrigger asChild>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Settings</TooltipContent>
                        </Tooltip>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editor Settings</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label>Line Numbers</label>
                            <Switch
                              checked={config.lineNumbers}
                              onCheckedChange={(checked) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  lineNumbers: checked,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label>Word Wrap</label>
                            <Switch
                              checked={config.wordWrap}
                              onCheckedChange={(checked) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  wordWrap: checked,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label>Auto Save</label>
                            <Switch
                              checked={config.autoSave}
                              onCheckedChange={(checked) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  autoSave: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 flex-wrap">
                {toolbarActions.map((action, index) => (
                  <React.Fragment key={action.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToolbarAction(action.id)}
                        >
                          <action.icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {action.label} ({action.shortcut})
                      </TooltipContent>
                    </Tooltip>
                    {action.separator && index < toolbarActions.length - 1 && (
                      <Separator orientation="vertical" className="h-6" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Editor/Preview */}
          <div
            className="flex-1 min-h-0 grid gap-4"
            style={{
              gridTemplateColumns:
                viewMode === "editor"
                  ? "1fr"
                  : viewMode === "preview"
                  ? "0 1fr"
                  : "1fr 1fr",
            }}
          >
            {/* Editor Pane */}
            {viewMode !== "preview" && (
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Editor</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-full pb-4">
                  <Textarea
                    ref={editorRef}
                    value={state.content}
                    onChange={(e) => {
                      const textarea = e.target;
                      setState((prev) => ({
                        ...prev,
                        content: textarea.value,
                        cursorPosition: textarea.selectionStart,
                        isDirty: true,
                      }));
                    }}
                    onSelect={(e) => {
                      const textarea = e.target as HTMLTextAreaElement;
                      setState((prev) => ({
                        ...prev,
                        cursorPosition: textarea.selectionStart,
                        selectionStart: textarea.selectionStart,
                        selectionEnd: textarea.selectionEnd,
                      }));
                    }}
                    className="h-full min-h-[500px] resize-none border-0 shadow-none focus-visible:ring-0 font-mono text-sm"
                    placeholder="Start writing your Markdown content..."
                    style={{
                      wordWrap: config.wordWrap ? "break-word" : "normal",
                      whiteSpace: config.wordWrap ? "pre-wrap" : "pre",
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Preview Pane */}
            {viewMode !== "editor" && (
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-auto">
                  <div
                    ref={previewRef}
                    className="prose prose-sm max-w-none h-full"
                    dangerouslySetInnerHTML={{
                      __html: parseResult?.html || "",
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Status Bar */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  {stats && (
                    <>
                      <span>Words: {stats.wordCount}</span>
                      <span>Characters: {stats.charCount}</span>
                      <span>Lines: {stats.lineCount}</span>
                      <span>Reading time: {stats.readingTime}m</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {stats && (
                    <span>
                      Ln {stats.currentLine}, Col {stats.currentColumn}
                    </span>
                  )}
                  {state.lastSaved && (
                    <span>Saved: {state.lastSaved.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Keyboard Shortcuts & Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Text Formatting</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                        Ctrl+B
                      </kbd>{" "}
                      Bold text
                    </li>
                    <li>
                      <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                        Ctrl+I
                      </kbd>{" "}
                      Italic text
                    </li>
                    <li>
                      <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                        Ctrl+K
                      </kbd>{" "}
                      Insert link
                    </li>
                    <li>
                      <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                        Ctrl+`
                      </kbd>{" "}
                      Inline code
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Tips</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Drag and drop files to import</li>
                    <li>• Use three view modes: Edit, Preview, Split</li>
                    <li>• Export to Markdown or HTML formats</li>
                    <li>• All changes are automatically saved locally</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link Dialog */}
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Link Text</label>
                  <Input id="link-text" placeholder="Enter link text" />
                </div>
                <div>
                  <label className="text-sm font-medium">URL</label>
                  <Input id="link-url" placeholder="https://" />
                </div>
                <Button
                  onClick={() => {
                    const text =
                      (document.getElementById("link-text") as HTMLInputElement)
                        ?.value || "";
                    const url =
                      (document.getElementById("link-url") as HTMLInputElement)
                        ?.value || "";

                    if (url) {
                      const selection = getCurrentSelection();
                      const result = engine.current.insertLink(
                        state.content,
                        selection,
                        { text, url }
                      );
                      updateContent(result.content, result.cursorPosition);
                      setShowLinkDialog(false);
                    }
                  }}
                  className="w-full"
                >
                  Insert Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Image Dialog */}
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Alt Text</label>
                  <Input id="image-alt" placeholder="Enter alt text" />
                </div>
                <div>
                  <label className="text-sm font-medium">Image URL</label>
                  <Input id="image-src" placeholder="https://" />
                </div>
                <Button
                  onClick={() => {
                    const alt =
                      (document.getElementById("image-alt") as HTMLInputElement)
                        ?.value || "";
                    const src =
                      (document.getElementById("image-src") as HTMLInputElement)
                        ?.value || "";

                    if (src) {
                      const selection = getCurrentSelection();
                      const result = engine.current.insertImage(
                        state.content,
                        selection,
                        { alt, src }
                      );
                      updateContent(result.content, result.cursorPosition);
                      setShowImageDialog(false);
                    }
                  }}
                  className="w-full"
                >
                  Insert Image
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Table Dialog */}
          <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Rows</label>
                    <Input
                      id="table-rows"
                      type="number"
                      defaultValue="3"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Columns</label>
                    <Input
                      id="table-cols"
                      type="number"
                      defaultValue="3"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const rows = parseInt(
                      (
                        document.getElementById(
                          "table-rows"
                        ) as HTMLInputElement
                      )?.value || "3"
                    );
                    const cols = parseInt(
                      (
                        document.getElementById(
                          "table-cols"
                        ) as HTMLInputElement
                      )?.value || "3"
                    );

                    const headers = Array(cols)
                      .fill(0)
                      .map((_, i) => `Header ${i + 1}`);
                    const tableRows = Array(rows)
                      .fill(0)
                      .map(() => Array(cols).fill("Cell"));

                    const selection = getCurrentSelection();
                    const result = engine.current.insertTable(
                      state.content,
                      selection,
                      {
                        headers,
                        rows: tableRows,
                      }
                    );
                    updateContent(result.content, result.cursorPosition);
                    setShowTableDialog(false);
                  }}
                  className="w-full"
                >
                  Insert Table
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </ToolLayout>
    </TooltipProvider>
  );
}
