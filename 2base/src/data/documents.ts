import { FileText, BookOpen, Settings, History, Home } from "lucide-react";

export interface DocumentInfo {
  id: string;
  title: string;
  description: string;
  path: string;
  category: "guide" | "specification" | "reference" | "changelog";
  tags: string[];
  icon: React.ComponentType<{ className?: string }>;
  content?: string;
}

export const documents: DocumentInfo[] = [
  {
    id: "tool-development-guide",
    title: "Tool Development Guide",
    description: "Complete guide for creating new tools in the project",
    path: "/documents/TOOL_DEVELOPMENT_GUIDE.md",
    category: "guide",
    tags: ["development", "tools", "guide", "tutorial", "react", "typescript"],
    icon: BookOpen,
    content:
      "Tool development guide with step-by-step instructions for creating new tools",
  },
  {
    id: "design-specification",
    title: "Design Specification",
    description: "Complete design guidelines and architecture specification",
    path: "/documents/design-specification.md",
    category: "specification",
    tags: ["design", "architecture", "UI", "UX", "guidelines", "standards"],
    icon: Settings,
    content: "Design principles, UI standards, and architecture guidelines",
  },
  {
    id: "readme",
    title: "Project README",
    description: "Project overview, installation guide and basic usage",
    path: "/documents/README.md",
    category: "reference",
    tags: ["readme", "setup", "installation", "overview", "getting-started"],
    icon: Home,
    content: "Project overview with installation and setup instructions",
  },
  {
    id: "house-clean-plan",
    title: "House Clean Plan",
    description: "Project refactoring and cleanup documentation",
    path: "/documents/house-clean-plan.md",
    category: "reference",
    tags: ["refactoring", "cleanup", "maintenance", "optimization"],
    icon: FileText,
    content: "Project refactoring plan and cleanup guidelines",
  },
  {
    id: "changelog",
    title: "Changelog",
    description: "Project version history and release notes",
    path: "/documents/CHANGELOG.md",
    category: "changelog",
    tags: ["changelog", "version", "history", "releases", "updates"],
    icon: History,
    content: "Version history and release notes",
  },
];

export const documentCategories = [
  {
    id: "all",
    name: "All Documents",
    icon: FileText,
  },
  {
    id: "guide",
    name: "Guides",
    icon: BookOpen,
  },
  {
    id: "specification",
    name: "Specifications",
    icon: Settings,
  },
  {
    id: "reference",
    name: "Reference",
    icon: FileText,
  },
  {
    id: "changelog",
    name: "Changelog",
    icon: History,
  },
];
