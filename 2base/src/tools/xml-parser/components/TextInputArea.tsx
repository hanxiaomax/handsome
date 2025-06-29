import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextInputAreaProps {
  textInput: string;
  onTextInputChange: (value: string) => void;
  onParse: () => void;
  isParsingMode: boolean;
  isLoading: boolean;
}

export function TextInputArea({
  textInput,
  onTextInputChange,
  onParse,
  isParsingMode,
  isLoading,
}: TextInputAreaProps) {
  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] w-full border rounded-md">
        <Textarea
          placeholder="Paste your XML content here..."
          value={textInput}
          onChange={(e) => onTextInputChange(e.target.value)}
          className="min-h-[400px] font-mono text-sm border-none resize-none focus-visible:ring-0"
        />
      </ScrollArea>
      {textInput.trim() && isParsingMode && (
        <div className="flex justify-end">
          <Button
            onClick={onParse}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Parse XML
          </Button>
        </div>
      )}
    </div>
  );
}
