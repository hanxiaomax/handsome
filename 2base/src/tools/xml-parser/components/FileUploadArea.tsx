import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  isDragOver: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileSelect: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadArea({
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onFileInputChange,
}: FileUploadAreaProps) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-muted/20"
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onFileSelect}
    >
      <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        Upload XML File
      </h3>
      <p className="text-muted-foreground mb-3">
        Drop your XML file here or click to browse
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        Supports .xml, .arxml, .xsd, .svg files
      </p>
      <input
        type="file"
        accept=".xml,.arxml,.xsd,.svg,.rss,.atom"
        onChange={onFileInputChange}
        className="hidden"
        id="file-input"
      />
    </div>
  );
}
