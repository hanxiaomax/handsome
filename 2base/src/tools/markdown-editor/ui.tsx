import { useState } from "react";
import { ToolWrapper } from "@/components/common/tool-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Eye, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { toolInfo } from "./toolInfo";

const initialMarkdown = `# Welcome to Markdown Editor

This is a **powerful** Markdown editor with *real-time* preview capabilities.

## Features

- ✨ Real-time preview
- 🎨 Syntax highlighting
- 📝 Rich toolbar
- 📁 File import/export

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

> **Tip:** Use the tabs to switch between edit and preview modes!

---

Happy writing! 📚`;

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(
      /```([a-z]*)\n([\s\S]*?)```/g,
      '<pre><code class="language-$1">$2</code></pre>'
    )
    .replace(/^\| (.*) \|$/gim, (_, content) => {
      const cells = content
        .split(" | ")
        .map((cell: string) => `<td>${cell}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/\n/g, "<br>");
}

export default function MarkdownEditor() {
  const [content, setContent] = useState(initialMarkdown);
  const [fileName] = useState("untitled.md");
  const [activeTab, setActiveTab] = useState("edit");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch {
      toast.error("Failed to copy content");
    }
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File exported successfully");
  };

  const previewHtml = markdownToHtml(content);

  return (
    <ToolWrapper toolInfo={toolInfo} state={{ content, fileName }}>
      {/* Main Content Container */}
      <div className="w-full h-full flex flex-col p-6 space-y-4 mt-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{fileName}</Badge>
            <Badge variant="secondary">{content.length} characters</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Editor */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Markdown Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">
                  <FileText className="h-4 w-4 mr-1" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="h-full mt-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your markdown here..."
                  className="h-96 font-mono text-sm resize-none"
                />
              </TabsContent>

              <TabsContent value="preview" className="h-full mt-4">
                <div
                  className="h-96 p-4 border rounded-md overflow-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ToolWrapper>
  );
}
