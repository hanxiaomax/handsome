import { Upload, FileCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadArea } from "./FileUploadArea";
import { TextInputArea } from "./TextInputArea";

interface FileUploadState {
  isDragOver: boolean;
  selectedFile: File | null;
  fileInfo: {
    name: string;
    size: number;
    type: string;
  } | null;
  content: string;
  originalContent: string;
}

interface InputModeSelectorProps {
  inputMode: "file" | "text";
  onInputModeChange: (mode: "file" | "text") => void;
  fileUpload: FileUploadState;
  textInput: string;
  onTextInputChange: (value: string) => void;
  onFileSelect: (file: File) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onParse: () => void;
  autoParseEnabled: boolean;
  isLoading: boolean;
}

export function InputModeSelector({
  inputMode,
  onInputModeChange,
  fileUpload,
  textInput,
  onTextInputChange,
  onFileInputChange,
  onFileDrop,
  onDragOver,
  onDragLeave,
  onParse,
  autoParseEnabled,
  isLoading,
}: InputModeSelectorProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-8">
        <Tabs
          value={inputMode}
          onValueChange={(value) => onInputModeChange(value as "file" | "text")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Text Input
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-0">
            <FileUploadArea
              isDragOver={fileUpload.isDragOver}
              onDrop={onFileDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onFileSelect={() =>
                document.getElementById("file-input")?.click()
              }
              onFileInputChange={onFileInputChange}
            />
          </TabsContent>

          <TabsContent value="text" className="mt-0">
            <TextInputArea
              textInput={textInput}
              onTextInputChange={onTextInputChange}
              onParse={onParse}
              isParsingMode={!autoParseEnabled}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
