import { ScrollArea } from "@/components/ui/scroll-area";

interface SourceCodeDisplayProps {
  content: string;
  showLineNumbers: boolean;
}

export function SourceCodeDisplay({
  content,
  showLineNumbers,
}: SourceCodeDisplayProps) {
  const lines = content.split("\n");

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4">
        <div className="font-mono text-sm">
          {lines.map((line, index) => (
            <div key={index} className="flex hover:bg-muted/30 min-h-[1.2rem]">
              {showLineNumbers && (
                <span className="text-muted-foreground text-xs w-12 flex-shrink-0 text-right pr-4 select-none border-r mr-4">
                  {index + 1}
                </span>
              )}
              <span className="flex-1 whitespace-pre-wrap break-all">
                {line || " "}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
