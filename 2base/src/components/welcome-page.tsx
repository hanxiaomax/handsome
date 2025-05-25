import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tools, categories } from "@/data/tools";
import { Calculator, FileText, Image, Lock, Code, Zap } from "lucide-react";

export function WelcomePage() {
  const categoryIcons = {
    development: Code,
    text: FileText,
    file: FileText,
    encode: Zap,
    crypto: Lock,
    image: Image,
  };

  const activeCategories = categories.filter(
    (cat) => cat.id !== "all" && cat.count > 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Calculator className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Tool Suite</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive collection of developer tools designed to boost your
            productivity. All tools run locally in your browser for maximum
            privacy and speed.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {tools.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Tools</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {tools.filter((t) => !t.requiresBackend).length}
            </div>
            <div className="text-sm text-muted-foreground">Offline Tools</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {activeCategories.length}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCategories.map((category) => {
              const IconComponent =
                categoryIcons[category.id as keyof typeof categoryIcons] ||
                Code;
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.count} tool{category.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Featured Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tools.slice(0, 3).map((tool) => (
              <div
                key={tool.id}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{tool.name}</h3>
                    {!tool.requiresBackend && (
                      <Badge variant="secondary" className="text-xs">
                        Offline
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium mb-1">Browse Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Explore tools by category in the sidebar or use the search
                  function to find specific tools.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium mb-1">Select a Tool</h4>
                <p className="text-sm text-muted-foreground">
                  Click on any tool in the sidebar to view its detailed
                  information and features.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium mb-1">Start Using</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Use Tool" to open the tool and start working. All data
                  stays local for privacy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
